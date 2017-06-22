///<reference path="./interfaces" />

import {EventEmitter} from "./event_emitter";

function ModelSettings(serviceUrl:string):any {
  return function(target:any):any {
    // 保存原构造函数的引用
    var original:any = target;

    // 一个用于生成类实例的工具函数
    function construct(constructor:any, args:any):any {
      var c:any = function():any {
        return constructor.apply(this, args);
      };
      c.prototype = constructor.prototype;

      var instance:any = new c();
      instance._serviceUrl = serviceUrl;

      return instance;
    }

    // 新构造函数的行为
    var f:any = function(args: any):any {
      return construct(original, args);
    };

    // 为了使instanceof操作符继续可用，复制原型
    f.prototype = original.prototype;
    return f;
  };
}

class Model extends EventEmitter implements IModel {
  // _serviceUrl的值必须使用ModelSettings装饰器来设置
  private _serviceUrl: string;

  constructor(metiator: IMediator) {
    super(metiator);
  }

  // 必须由派生类实现接口方法
  public initialize():void {
    throw new Error("Model.prototype.initialize() is abstract and must implement.");
  }

  // 必须由派生类实现接口方法
  public dispose():void {
    throw new Error("Model.prototype.dispose() is abstrace and must implement.");
  }

  // 网络服务请求数据
  protected requestAsync(method:string, dataType: string, data:any):any {
    return Q.Promise((resolve:(r:any)=>{}, reject:(e:any)=>{})=> {
      $.ajax({
        method: method,
        url:this._serviceUrl,
        data: data || {},
        dataType: dataType,
        success:(response:any)=>{
          resolve(response);
        },
        error:(args:any[])=>{
          reject(args);
        }
      });
    });
  }

  // gET请求
  protected getAsync(dataType:string, data:any):any {
    return this.requestAsync("GET", dataType, data);
  }

  // pOST请求
  protected postAsync(dataType:string, data:any):any {
    return this.requestAsync("POST", dataType, data);
  }

  // put请求
  protected putAsync(dataType:string, data:any):any {
    return this.requestAsync("PUT", dataType, data);
  }

  // dELETE请求
  protected deleteAsync(dataType:string, data:any):any {
    return this.requestAsync("DELETE", dataType, data);
  }
}

export {Model,ModelSettings};