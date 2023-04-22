type ListenerCallback<T extends Array<any>> = (...payload: T) => void;

export class TypedEventEmitter<T extends Record<string, Array<any>>> {
  private _eventListeners: { [Key in keyof T]?: Set<ListenerCallback<T[Key]>> } = {};
  on<U extends keyof T>(eventName: U, callback: ListenerCallback<T[U]>) {
    const listeners = this._eventListeners[eventName] ?? new Set();
    listeners.add(callback);
    this._eventListeners[eventName] = listeners;
  }
  emit<U extends keyof T>(eventName: U, ...payloads: T[U]) {
    const callbacks = this._eventListeners[eventName];
    callbacks?.forEach((callback) => callback(...payloads));
  }
}
