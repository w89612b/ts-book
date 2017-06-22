///<reference path="./interfaces" />

class AppEvent implements IAppEvent {
  public guid:string;
  public topic:string;
  public data:any;
  public handler:(e:Object, data? : any)=>void;
  /**
   * 程序事件处理
   * @param  {string} topic 标志
   * @param  {any} data 数据
   * @param  {(e:any,data?:any)=>void} handler 回调方法
   */
  constructor(topic:string, data:any, handler:(e:any, data?:any)=>void) {
    this.topic = topic;
    this.data = data;
    this.handler = handler;
  }
}

export {AppEvent};