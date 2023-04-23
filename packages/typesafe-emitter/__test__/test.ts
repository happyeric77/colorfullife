// Test event emitter
import { TypedEventEmitter } from "../lib";

type Events = {
  foo: [number, string];
  bar: [boolean];
};
const emitter = new TypedEventEmitter<Events>();

emitter.on("foo", (num, str) => {
  console.log("foo is emitted with:", typeof num, typeof str);
});

emitter.on("bar", (bool) => {
  console.log("bar is emitted with:", typeof bool);
});

emitter.emit("foo", 1, "hello");
emitter.emit("bar", true);
