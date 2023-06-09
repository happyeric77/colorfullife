# Create a typed event emitter

We can make use of node's built-in `EventEmitter` when we want to create a custom event emitter. However, it is not type-safe. We can use TypeScript to create a typed event emitter.

## Scaffold

You can extend the `EventEmitter` class from `events` module in node. In this case, we will create our own one named `TypedEventEmitter` because I would like to just demo the most important 2 methods: `on` and `emit`.

The following code shows the basic structure of the event emitter:

```ts
export class TypedEventEmitter {
  private eventListeners: Record<string, Array<Function>> = {};
  on(eventName: string, callback: (payload: unknown) => void) {}
  emit(eventName: string, payload: unknown) {}
}
```

As can be seen, there are `unknown` types in the `on` and `emit` methods. At the same time, using `Function` type is not recommended.
So we will refactor the code to make it more type-safe.

## Generic with type constraints

The first step is introducing the generic type to the class. The generic type will be used to define the event map. The event map is a record type that defines the event name and the payload type.

Now, in `on` and `emit` methods, we can use the generic type to define the type of the event name and the payload.

```ts

// delete-next-line
export class TypedEventEmitter {
  // add-next-line
export class TypedEventEmitter<T extends Record<string, any[]>> {
  private eventListeners: Record<string, Array<Function>> = {};

  // delete-next-line
  on(eventName: string, callback: (payload: unknown) => void) {}
  // add-next-line
  on<U extends keyof T>(eventName: U, callback: (payload: T[U]) => void) {}

  // delete-next-line
  emit(eventName: string, payload: unknown) {}
  // add-next-line
  emit<U extends keyof T>(eventName: U, payload: T[U]) {}
}

```

## Mapped types

The next step is to refactor the `eventListeners` property.
As mentioned, using `Function` type is not explicit enough. So we can also use our defined generic type to explicitly tell:

1. The event name is a key of the event map (generic type T's key)
2. The listener will be an array of function with the payload of event map (generic type T's value) as arguments

```ts
export class TypedEventEmitter<T extends Record<string, any[]>> {
  // delete-next-line
  private eventListeners: Record<string, Array<Function>> = {};
  // add-next-line
  private _eventListeners: { [Key in keyof T]?: Array<(...payload: T[Key]) => void> } = {};
  on<U extends keyof T>(eventName: U, callback: (...payload: T[U]) => void) {}
  emit<U extends keyof T>(eventName: U, ...payload: T[U]) {}
}
```

## Final refector

We can extract the listener callback type to a separate type to make the code more readable.

```ts
// add-next-line
type ListenerCallback<T extends Array<any>> = (...payload: T) => void;

export class TypedEventEmitter<T extends Record<string, Array<any>>> {
  // delete-next-line
  private _eventListeners: { [Key in keyof T]?: Array<(...payload: T[Key]) => void> } = {};
  // add-next-line
  private _eventListeners: { [Key in keyof T]?: Array<ListenerCallback<T[Key]>> } = {};

  // delete-next-line
  on<U extends keyof T>(eventName: U, callback: (...payload: T[U]) => void) {}
  // add-next-line
  on<U extends keyof T>(eventName: U, callback: ListenerCallback<T[U]>) {
    const listeners = this._eventListeners[eventName] ?? [];
    listeners.push(callback);
    this._eventListeners[eventName] = listeners;
  }
  emit<U extends keyof T>(eventName: U, ...payloads: T[U]) {
    const callbacks = this._eventListeners[eventName];
    callbacks?.forEach((callback) => callback(...payloads));
  }
}
```

## Implement the event emitter logic

Now we can implement the event emitter logic.

```ts
export class TypedEventEmitter<T extends Record<string, any[]>> {
  private _eventListeners: { [Key in keyof T]?: Array<(...payload: T[Key]) => void> } = {};
  on<U extends keyof T>(eventName: U, callback: (...payload: T[U]) => void) {
    // add-start
    const listeners = this._eventListeners[eventName] ?? [];
    listeners.push(callback);
    this._eventListeners[eventName] = listeners;
    // add-end
  }
  emit<U extends keyof T>(eventName: U, ...payloads: T[U]) {
    // add-start
    const callbacks = this._eventListeners[eventName];
    callbacks?.forEach((callback) => callback(...payloads));
    // add-end
  }
}
```

## Test the event emitter

We can test the event emitter with the concept that users can subscribe to the news and when there is a new news, the event emitter will emit the event and the listener will be called.

```ts
// Define the event map types
type NewsEvents = {
  subscribe: [string];
  unsubscribe: [string];
};

// Create a new instance of the event emitter
const newsEmitter = new TypedEventEmitter<NewsEvents>();

// Subscribe to the event
newsEmitter.on("subscribe", (news) => {
  console.log(news);
});

// Emit the event
newsEmitter.emit("subscribe", "Hello World News");
```

You will see it will be able to infer the type of the not only the event name but also the payload.
But, You will see the following error:

:::warning

```
TSError: ⨯ Unable to compile TypeScript:
lib/index.ts(8,20): error TS2345: Argument of type 'ListenerCallback<T[U]>' is not assignable to parameter of type 'never'.
```

:::

The reason is that the `on` method is not able to infer the type of the eventName. So, Two solutions here:

1. Conditional check if listeners is undefined

```ts
// ...
on<U extends keyof T>(eventName: U, callback: ListenerCallback<T[U]>) {
  const listeners = this._eventListeners[eventName];
    if (listeners) {
      return listeners.push(callback);
    }
  this._eventListeners[eventName] = [callback];
}
// ...
```

2. Explicitly define the type of the empty array type when the listeners is undefined.

```ts
// ...
on<U extends keyof T>(eventName: U, callback: ListenerCallback<T[U]>) {
  const listeners = this._eventListeners[eventName] ?? ([] as Array<ListenerCallback<T[U]>>);
  listeners.push(callback);
  this._eventListeners[eventName] = listeners;
}
// ...
```

But The best solution is replacing Array with Set.

```ts
on<U extends keyof T>(eventName: U, callback: ListenerCallback<T[U]>) {
  const listeners = this._eventListeners[eventName] ?? new Set();
  listeners.add(callback);
  this._eventListeners[eventName] = listeners;
}
```

The reason is that Set is a collection of unique values. So, We don't need to worry if the callback is already in the listeners.

Congratulations! We can now use the event emitter with the type safety.

:::info

[Github source code](https://github.com/happyeric77/colorfullife/tree/master/packages/typesafe-emitter)

[npm package](https://www.npmjs.com/package/@colorfullife/typesafe-emitter)

[colorful-doc](https://docs.colorfullife.ml/typescript/typed-eventEmmiter)

:::
