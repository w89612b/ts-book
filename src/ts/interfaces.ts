/**
 * 程序事件处理接口定义
 * @param  {string} topic 标志
 * @param  {any} data 数据
 * @param  {(e:any,data?:any)=>void} handler 回调方法
 */
interface IAppEvent {
  topic: string;
  data: any;
  handler:(e:any, data:any)=> void;
}
/**
 * 中介器接口
 */
interface IMediator {

  /**
   * 触发事件，事件被触发，所有订阅的地方都会收到通知
   * @param  {IAppEvent} e
   * @returns void
   */
  publish(e:IAppEvent):void;
  /**
   * 订阅事件，为一个事件设置事件处理
   * @param  {IAppEvent} e
   * @returns void
   */
  subscribe(e:IAppEvent):void;
  /**
   * 取消订阅，移除一个事件的处理函数
   * @param  {IAppEvent} e
   * @returns void
   */
  unsubscribe(e:IAppEvent):void;
}


/**
 * 程序组件设置接口
 * 主要负责初始化框架的主要组件（路由，中介器，调度器）
 * @param  {IDispatcher} _dispatcher 调度器
 * @param  {IMediator} _mediator 中介器
 * @param  {IRouter} _router 路由
 * @param  {IControllerDetails} _controllers 控制器
 * @param  {FN} _onErrorHandler   全局错误处理函数
 */
interface IAppSettings {
  isDebug: boolean;
  defaultController:string;
  defaultAction:string;
  controllers: Array<IControllerDetails>;
  onErrorHandler: (o:Object)=>void;
}


/*一个完整的控制器*/
interface IControllerDetails {
  controllerName: string;
  controller: {new(args:any[]):IController;};
}

/**
 * 路由转化器
 * @param  {string} controllerName 控制器名称
 * @param  {string} actionName 请求名称
 * @param  {Object[]} args 请求参数
 * @FN serialize 转化路由并返回路由地址
 */
interface IRoute {
  controllerName: string;
  actionName: string;
  args:Object[];
  serialize(): string;
}

/**
 * 事件发射器
 */
interface IEventEmitter {
  triggerEvent(event:IAppEvent):void;
  subscribeToEvents(events: Array<IAppEvent>):void;
  unsubscribeToEvents(events: Array<IAppEvent>):void;
}

/*
* 路由
*/
interface IRouter extends IEventEmitter {
  initialize():void;
}

/*调度器*/
interface IDispatcher extends IEventEmitter {
  initialize():void;
}

/*
* 负责控制器初始化和销毁view和model
* initialize 初始化
* dispose 销毁
*/
interface IController extends IEventEmitter {
  initialize():void;
  dispose():void;
}

/*
* model 网络通信服务，格式化返回数据
*/
interface IModel extends IEventEmitter {
  initialize():void;
  dispose():void;
}

/*
* 负责加载编译模板
*/
interface IView extends IEventEmitter {
  initialize():void;
  dispose():void;
}