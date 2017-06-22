///<reference path="./interfaces" />
///<reference path="../../typings/jquery/jquery.d.ts" />
///<reference path="../../typings/q/Q.d.ts" />

import {EventEmitter} from "./event_emitter";
import {AppEvent} from "./app_event";

/*显示装饰器*/
function ViewSettings(templateUrl:string, container:string):any {
  return function(target:any):any {
    // 保存原构造函数
    var original:any = target;

    // 一个用于生成类实例的工具函数
    function construct(constructor:any, args:any):any {
      var c:any = function():any {
        return constructor.apply(this, args);
      };
      c.prototype = constructor.prototype;

      var instance:any = new c();
      instance._container = container;
      instance._templateUrl = templateUrl;
      return instance;
    }

    // 新构造函数的行为
    var f:any = function(args:any):any {
      return construct(original, args);
    };
    // 为了使instanceof操作符继续可用，复制原型
    f.prototype = original.prototype;

    // 返回新的构造函数（将覆盖原来的）
    return f;
  };
}

class View extends EventEmitter implements IView {
  // _container和_templateUrl的值必须使用ViewSettings装饰器来设置
  protected _container:string;
  private _templateUrl:string;

  private _templateDelegate: HandlebarsTemplateDelegate;

  constructor(metiator:IMediator) {
    super(metiator);
  }

  // 必须由派生类实现接口方法
  public initialize():void {
    throw new Error("View.prototype.initialize() is abstract and must implement.");
  }

  // 必须由派生类实现接口方法
  public dispose():void {
    throw new Error("View.prototype.dispose() is abstrace and must implement.");
  }

// 必须由派生类实现方法
  public bindDomEvents():void {
    throw new Error("View.prototype.bindDomEvents() is abstrace and must implement.");
  }

  // 必须由派生类实现方法
  public unbindDomEvents():void {
    throw new Error("View.prototype.unbindDomEvents() is abstrace and must implement.");
  }

  /*使用异步的方法promise操作模板*/
  // 异步加载模板
  private loadTemplateAsync():any {
    return Q.Promise((resolve:(r:any)=>{}, reject:(e:any)=>{})=> {
      $.ajax({
        method:"GET",
        url: this._templateUrl,
        dataType:"text",
        success:(response:any)=> {
          resolve(response);
        },
        error:(args:any[])=> {
          reject(args);
        }
      });
    });
  }

  // 异步编译模板
  private compileTemplateAsync(source:string):any {
    return Q.Promise((resolve:(r:any)=>{}, reject:(e:any)=>{})=> {
      try {
        var template:any = Handlebars.compile(source);
        resolve(template);
      } catch (e) {
        reject(e);
      }
    });
  }

  // 若操作仍未完成，则异步加载和编译一个模板
  private getTemplateAsync():any {
    return Q.Promise((resolve:(r:any)=>{}, reject:(e:any)=>{})=> {
      if(this._templateDelegate === undefined || this._templateDelegate === null) {
        this.loadTemplateAsync()
        .then((source:any)=> {
          return this.compileTemplateAsync(source);
        })
        .then((templateDelegate:any)=> {
          this._templateDelegate = templateDelegate;
          resolve(this._templateDelegate);
        })
        .catch((e:any)=> {reject(e);});
      }else {
        resolve(this._templateDelegate);
      }
    });
  }

  // 异步渲染一个View
  protected renderAsync(model:IModel):any {
    return Q.Promise((resolve:(r:any)=>{}, reject:(e:any)=>{})=> {
      this.getTemplateAsync()
        .then((templateDelegate:any)=> {
          // 生成HTML并添加到DOM中
          var html:string = this._templateDelegate(model);
          $(this._container).html(html);

          // 将model作为参数传给model
          // 让子试图和DOM事件初始化
          resolve(model);
        })
        .catch((e:any)=> {reject(e);});
    });
  }
}

export {View,ViewSettings};