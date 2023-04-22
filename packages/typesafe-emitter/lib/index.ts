export class TypedEventEmitter {
  private eventListeners: Record<string, Array<Function>> = {};
  on(eventName: string, callback: (payload: unknown) => void) {}
  emit(eventName: string, payload: unknown) {}
}
