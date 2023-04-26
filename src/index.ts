import result from "./result";
import option from "./option";

globalThis.Ok = result.Ok;
globalThis.Err = result.Err;

declare global {
  type Result<T = unknown, E = never> = result<T, E>;
  function Ok<T = void, E = never>(value?: T): Result<T, E>;
  function Err<E = void, T = never>(value?: E): Result<T, E>;

  type None = option<never>;
  type Some<T = unknown> = option<T>;
}