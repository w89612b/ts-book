///<reference path="./interfaces" />
import {EventEmitter} from "./event_emitter";
import {AppEvent} from "./app_event";

/*调度器*/
class Dispatcher extends EventEmitter implements IDispatcher {
  private _controllersHashMap :Object;
  private _currentController: IController;
  private _currentControllerName: string;

  constructor(metiator: IMediator, constructors: IControllerDetails[]) {
    super(metiator);
    this._controllersHashMap = this.getController(constructors);
    this._currentController = null;
    this._currentControllerName = null;
  }

  // 监听app.dispatch事件
  public initialize():void {
    this.subscribeToEvents([
      new AppEvent("app.dispatch", null, (e:any, data?:any)=> {
        this.dispatch(data);
      })
    ]);
  }

  // 查找控制器
  private getController(controllers: IControllerDetails[]):object {
    var hashMap: any[], hashMapEntry: any, name: string, controller: any,l: number;
    hashMap =[];
    l = controllers.length;
    if(l<=0) {
      this.triggerEvent(new AppEvent("app.error", "cannot create an application without at least one contoller.", null));
    }

    for(var i:number =0; i<l; i++) {
      controller = controllers[i];
      name = controller.controllerName;
      hashMapEntry = hashMap[name];
      if(hashMapEntry !== null && hashMapEntry !== undefined) {
        this.triggerEvent(new AppEvent("app.error", "Two controller cannot use the same name.", null));
      }
      hashMap[name] = controller.controller;
    }

    return hashMap;
  }

  // 创建、初始化、销毁controller实例
  private dispatch(route:IRoute): void {
    var Controller: any[] = this._controllersHashMap[route.controllerName];

    // 试图发现controller
    if(Controller === null || Controller === undefined) {
      this.triggerEvent(new AppEvent("app.error", `Controller not found:${route.controllerName}`, null));
    }else {
      // 创建一个新的controller实例
      var controller: IController = new Controller(this._metiator);

      // 该行为不可用
      var a:any = controller[route.actionName];
      if(a=== null || a === undefined) {
        // tslint:disable-next-line:max-line-length
        this.triggerEvent( new AppEvent("app.error", `Action not found in controller:${route.controllerName} - + ${route.actionName}`, null) );
      }else {
        // 行为可用
        if(this._currentController == null) {
          // 初始化controller
          this._currentControllerName = route.controllerName;
          this._currentController = controller;
          this._currentController.initialize();
        }else {
          // 若之前的controller不在需要，则销毁
          if(this._currentControllerName !== route.controllerName) {
            this._currentController.dispose();
            this._currentControllerName = route.controllerName;
            this._currentController = controller;
            this._currentController.initialize();
          }
        }

        // 将流从调试器传递至controller
        this.triggerEvent(new AppEvent(`app.controller.${this._currentControllerName}.${route.actionName}`, route.args, null));
      }
    }
  }
}

export {Dispatcher};