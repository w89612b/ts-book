///<reference path="./interfaces" />
import {Dispatcher} from "./dispatcher";
import {Mediator} from "./mediator";
import {AppEvent} from "./app_event";
import {Router} from "./router";

/**
 * 程序组件设置接口
 * 主要负责初始化框架的主要组件（路由，中介器，调度器）
 * @param  {IDispatcher} _dispatcher 调度器
 * @param  {IMediator} _mediator 中介器
 * @param  {IRouter} _router 路由
 * @param  {IControllerDetails} _controllers 控制器
 * @param  {FN} _onErrorHandler   全局错误处理函数
 */
class App {
  private _dispatcher: IDispatcher;
  private _mediator: IMediator;
  private _router: IRouter;
  private _controllers: IControllerDetails[];
  private _onErrorHandler: (o:Object)=>void;

  constructor(appSettings: IAppSettings) {
    this._controllers = appSettings.controllers;
    this._mediator = new Mediator(appSettings.isDebug || false);
    this._router = new Router(this._mediator, appSettings.defaultController, appSettings.defaultAction);
    this._dispatcher = new Dispatcher(this._mediator, this._controllers);
    this._onErrorHandler = appSettings.onErrorHandler;
  }

  public initialize ():void {
    this._router.initialize();
    this._dispatcher.initialize();
    this._mediator.subscribe(new AppEvent("app.error", null,(e:any, data?:any)=> {
      this._onErrorHandler(data);
    }));
    this._mediator.publish(new AppEvent("app.initialize", null, null));
  }
}

export {App};