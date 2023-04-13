import result from "./result";
import option from "./option";

globalThis.Ok = result.Ok;
globalThis.Err = result.Err;

globalThis.Some = option.Some;
globalThis.None = option.None;

declare global {
  type Result<T, E = undefined> = result<T, E>;
  function Ok<T, E = never>(value?: T): Result<T, E>;
  function Err(): Result<unknown, undefined>;
  function Err<T = never, E = any>(err: E): Result<T, E>;
  
  type Option<T> = option<T>;
  type None = Option<never>;
  function Some<T>(value: T): Option<T>;
  function Some(): Option<undefined>;
  function None<T>(): Option<T>;
}
