import result from "./result";
import option from "./option";

globalThis.Ok = result.Ok;
globalThis.Err = result.Err;

globalThis.Some = option.Some;
globalThis.None = option.None;

declare global {
  type Result<T = unknown, E = never> = result<T, E>;
  function Ok<T = void, E = never>(value?: T): Result<T, E>;
  function Err<E = void, T = never>(value?: E): Result<T, E>;

  type Ok<T = unknown> = result<T>;
  type Err<E = unknown> = result<never, E>;

  type Option<T = unknown> = option<T>;
  function Some<T = void>(value?: T): Option<T>;
  function None<T = never>(): Option<T>;

  type None = option<never>;
  type Some<T = unknown> = option<T>;
}
