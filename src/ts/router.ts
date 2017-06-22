///<reference path="./interfaces" />

import {EventEmitter} from "./event_emitter";
import {AppEvent} from "./app_event";
import {Route} from "./route";

class Router extends EventEmitter implements IRouter {
  private _defaultController:string;
  private _defaultAction: string;

  constructor(metiator: IMediator, defaultController:string, defaultAction:string) {
    super(metiator);
    this._defaultController = defaultController;
    this._defaultAction = defaultAction;
  }

  public initialize():void {
    // 监测URL被用户改变
    $(window).on("hashchange", ()=> {
      var r:any = this.getRoute();
      this.onRouteChange(r);
    });

    // 拥有改变URL的能力
    this.subscribeToEvents([
      // 用于在应用启动时触发路由
      new AppEvent("app.initialize", null, (e:any, data?:any)=> {
        this.onRouteChange(this.getRoute());
      }),
      // 用于从其他组件改变URL
      new AppEvent("app.route", null, (e:any, data?:any)=> {
        this.setRoute(data);
      })
    ]);
  }

  // 读取URL
  private getRoute():any {
    var h:string = window.location.hash;
    return this.parseRoute(h);
  }

  // 改变URL
  private setRoute(route: Route):void {
    var s:string = route.serialize();
    window.location.hash = s;
  }

  // 解析URL
  private parseRoute(hash:string):any {
    var comp:any, controller:any, action:any, args:any, i:number;
    if(hash[hash.length-1] === "/") {
      hash = hash.substring(0,hash.length-1);
    }
    comp = hash.replace("#","").split("/");
    controller = comp[0] || this._defaultController;
    action = comp[1] || this._defaultAction;

    args = [];
    for(i=2; i<comp.length; i++) {
      args.push(comp[i]);
    }

    return new Route(controller,action,args);
  }

  // 通过中介器将控制权转移给调度器
  private onRouteChange(route: Route):void {
    this.triggerEvent(new AppEvent("app.dispatch", route, null));
  }
}

export {Router};