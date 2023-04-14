import Option from "./option";
import util from "util";

export default class Result<T, E = unknown> {
  private _ok: boolean;
  private _value: T | E;
  
  private constructor(ok: true, value: T);
  private constructor(ok: false, value: E);
  private constructor(ok: boolean, value: T | E);
  private constructor(ok: boolean, value: T | E) {
    this._ok = ok;
    this._value = value;
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    return this._ok && res._ok ? res : this as any;
  }

  public andThen<U>(callback: (ok: T) => Result<U, E>): Result<U, E> {
    return this._ok ? callback(this._value as T) : this as any;
  }

  public expect(msg: string): T {
    if (this._ok) return this._value as T;
    throw new Error(`${msg}: ${this._value}`);
  }
  
  public expectErr(msg: string): E {
    if (!this._ok) return this._value as E;
    throw new Error(`${msg}: ${this._value}`);
  }

  public flatten<U>(this: Result<Result<U>, E>): Result<U, E> {
    if (this._ok) {
      if (!(this._value instanceof Result)) throw new Error("Cannot flatten a Result<U> where U is not a Result");
      if (this._ok) return this._value as any;
    }
    
    return this as any;
  }

  public inspect(callback: (ok: T) => any): Result<T, E> {
    if (this._ok) callback(this._value as T);
    return this;
  }

  public inspectErr(callback: (err: E) => any): Result<T, E> {
    if (!this._ok) callback(this._value as E);
    return this;
  }

  public intoOk(this: Result<T extends never ? never : T, never>): T {
    if (this._ok) return this._value as T;
    console.error(`Called intoOk on a Result<T, never> where T is not a never`);
    return void 0 as any;
  }

  public intoErr(this: Result<never, E extends never ? never : E>): E {
    if (!this._ok) return this._value as E;
    console.error(`Called intoErr on a Result<never, E> where E is not a never`);
    return void 0 as any;
  }

  public *iter(): Generator<T, void, never> {
    if (this._ok) yield this._value as T;
  }

  public isOk(): boolean {
    return this._ok;
  }
  
  public isOkAnd(callback: (ok: T) => boolean): boolean {
    return this._ok && callback(this._value as T);
  }

  public isErr(): boolean {
    return !this._ok;
  }

  public isErrAnd(callback: (err: E) => boolean): boolean {
    return !this._ok && callback(this._value as E);
  }

  public map<U>(callback: (ok: T) => U): Result<U, E> {
    return new Result(this._ok, this._ok ? callback(this._value as T) : this._value as U | E);
  }

  public mapErr<F>(callback: (err: E) => F): Result<T, F> {
    return new Result(this._ok, this._ok ? this._value : callback(this._value as E) as any);
  }

  public mapOr<U>(fallback: U, callback: (ok: T) => U): U {
    if (this._ok) return callback(this._value as T);
    return fallback;
  }

  public mapOrElse<U>(fallback: (err: E) => U, callback: (ok: T) => U): U {
    if (this._ok) return callback(this._value as T);
    return fallback(this._value as E);
  }

  public or<F>(callback: Result<T, F>): Result<T, F> {
    if (this._ok) return this as any;
    return callback;
  }

  public orElse<F>(fallback: (err: E) => F): Result<T, F> {
    if (this._ok) return this as any;
    return new Result(this._ok, fallback(this._value as E));
  }

  public transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>>;
  public transpose<U>(this: Result<None, E>): None;
  public transpose<U>(this: Result<T, Option<U>>): Option<Result<T, Option<U>>>;

  public transpose<U>(this: Result<T, Option<U>> | Result<Option<U>, E>): Option<Result<T, U>> | Option<Result<T, None>> {    
    if (this._ok) {
      if (!(this._value instanceof Option)) throw new Error("Cannot transpose a Result<T> where T is not an Option");
      if ((this._value as Option<U>).isSome()) return Option.Some(new Result(true, (this._value as Option<U>).unwrap())) as any;
      return Option.None() as any;
    }
    
    if (!(this._value instanceof Option)) throw new Error("Cannot transpose a Result<_, E> where E is not an Option");
    if ((this._value as Option<U>).isSome()) return Option.Some(new Result(false, Option.Some((this._value as Option<U>).unwrap()))) as any;
    return Option.Some(new Result(false, Option.None()));
  }

  public unwrap(): T {
    if (this._ok) return this._value as T;
    throw this._value;
  }

  public unwrapErr(): E {
    if (!this._ok) return this._value as E;
    throw this._value;
  }

  public unwrapOr(fallback: T): T {
    if (this._ok) return this._value as T;
    return fallback;
  }

  public unwrapOrElse(fallback: (err: E) => T): T {
    if (this._ok) return this._value as T;
    return fallback(this._value as E);
  }

  public into<U = T, F = E>(): Result<U, F> {
    return this as any;
  }

  [util.inspect.custom](): string {
    return this._ok ? `Ok(${util.inspect(this._value)})` : `Err(${util.inspect(this._value)})`;
  }
  
  public static Ok<T, E = never>(value?: T): Result<T, E> {
    return new Result<T>(true, value) as Result<T, E>;
  }

  public static Err<T = unknown, E = any>(err?: E): Result<T, E> {
    return new Result(false, err) as Result<T, E>
  }
}
