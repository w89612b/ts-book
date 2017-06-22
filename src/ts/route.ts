///<reference path="./interfaces" />
/**
 * 路由转化器
 * @param  {string} controllerName 控制器名称
 * @param  {string} actionName 请求名称
 * @param  {Object[]} args 请求参数
 * @FN serialize 转化路由并返回路由地址
 */
class Route implements IRoute {
  public controllerName:string;
  public actionName:string;
  public args:Object[];

  constructor(controllerName:string, actionName:string, args:Object[]) {
    this.controllerName = controllerName;
    this.actionName = actionName;
    this.args = args;
  }

  public serialize(): string {
    var s:string, sargs:string;
    sargs = this.args.map(a=>a.toString()).join("/");
    s = `${this.controllerName}/${this.actionName}/${sargs}`;
    return s;
  }
}

export {Route};