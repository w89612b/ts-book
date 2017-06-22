///<reference path="./interfaces" />

import {AppEvent } from "./app_event";

class EventEmitter implements IEventEmitter {
  protected _metiator: IMediator;
  protected _events: Array<IAppEvent>;

  constructor(metiator: IMediator) {
    this._metiator = metiator;
  }

  public triggerEvent(event:IAppEvent):void {
    this._metiator.publish(event);
  }

  public subscribeToEvents(events:Array<IAppEvent>):void {
    this._events = events;
    for(var i:number=0,el:number = this._events.length; i<el; i++) {
      this._metiator.subscribe(this._events[i]);
    }
  }

  public unsubscribeToEvents():void {
    for(var i:number=0,el:number = this._events.length; i<el; i++) {
      this._metiator.unsubscribe(this._events[i]);
    }
  }
}

export {EventEmitter};