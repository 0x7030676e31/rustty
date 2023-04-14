import Result from "./result";
import util from "util";

export default class Option<T> {
  private _some: boolean;
  private _value!: T;

  private constructor(some: true, value: T);
  private constructor(some: false);

  private constructor(some: boolean, value?: T) {
    this._some = some;
    if (some) this._value = value!;
  }

  public and<U>(optb: Option<U>): Option<U> {
    return this._some && optb._some ? optb : Option.None();
  }

  public andThen<U>(callback: (some: T) => Option<U>): Option<U> {
    return this._some ? callback(this._value) : Option.None();
  }

  public contains(value: T): boolean {
    return this._some && this._value === value;
  }

  public expect(msg: string): T {
    if (this._some) return this._value;
    throw new Error(msg);
  }

  public filter(callback: (some: T) => boolean): Option<T> {
    return this._some && callback(this._value) ? this : Option.None();
  }

  public flatten<U>(this: Option<Option<U>>): Option<U> {
    if (this._some) {
      if (!(this._value instanceof Option)) throw new Error("Cannot flatten an Option<U> where U is not an Option");
      if (this._some) return this._value as Option<U>;
    }

    return this as any;
  }

  public inspect(callback: (some: T) => any): Option<T> {
    if (this._some) callback(this._value);
    return this;
  }

  public isNone(): boolean {
    return !this._some;
  }

  public isSome(): boolean {
    return this._some;
  }

  public isSomeAnd(callback: (some: T) => boolean): boolean {
    return this._some && callback(this._value);
  }

  public *iter(): Generator<T, void, never> {
    if (this._some) yield this._value;
  }

  public map<U>(callback: (some: T) => U): Option<U> {
    return this._some ? Option.Some(callback(this._value)) : Option.None();
  }

  public mapOr<U>(fallback: U, callback: (some: T) => U): U {
    return this._some ? callback(this._value) : fallback;
  }
  
  public mapOrElse<U>(fallback: () => U, callback: (some: T) => U): U {
    return this._some ? callback(this._value) : fallback();
  }

  public okOr<E>(err: E): Result<T, E> {
    return this._some ? Result.Ok(this._value) : Result.Err(err);
  }

  public okOrElse<E>(fallback: () => E): Result<T, E> {
    return this._some ? Result.Ok(this._value) : Result.Err(fallback());
  }

  public or(optb: Option<T>): Option<T> {
    return this._some ? this : optb;
  }

  public orElse(fallback: () => Option<T>): Option<T> {
    return this._some ? this : fallback();
  }

  public replace(value: T): Option<T> {
    const oldValue = this._some ? Option.Some(this._value) : Option.None();
    this._value = value;
    return oldValue;
  }

  public take(): Option<T> {
    const oldValue = this._some ? Option.Some(this._value) : Option.None();
    this._some = false;
    return oldValue;
  }

  public transpose<U>(this: Option<Result<U>>): Result<Option<U>>;
  public transpose<E>(this: Option<Result<never, E>>): Result<never, E>;
  public transpose(this: None): Result<None>;

  public transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    if (this._some && !(this._value instanceof Result)) throw new Error("Cannot transpose an Option<Result<U>> where U is not a Result");
    if (!this._some) return Result.Ok(Option.None());
    if (this._value.isOk()) return Result.Ok(Option.Some(this._value.unwrap()));
    return Result.Err(this._value.unwrapErr());
  }

  public unwrap(): T {
    if (this._some) return this._value;
    throw new Error("Called `Option.unwrap()` on a `None` value");
  }

  public unwrapOr(value: T): T {
    return this._some ? this._value : value;
  }

  public unwrapOrElse(callback: () => T): T {
    return this._some ? this._value : callback();
  }

  public unzip<T, U>(this: Option<[T, U]>): [Option<T>, Option<U>] {
    return this._some ? [Option.Some(this._value[0]), Option.Some(this._value[1])] : [Option.None(), Option.None()];
  }

  public xor(optb: Option<T>): Option<T> {
    return this._some && optb._some ? Option.None() : this._some ? this : optb;
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    return this._some && other._some ? Option.Some([this._value, other._value]) : Option.None();
  }

  public zipWith<U, R>(other: Option<U>, callback: (a: T, b: U) => R): Option<R> {
    return this._some && other._some ? Option.Some(callback(this._value, other._value)) : Option.None();
  }

  public into<U>(): Option<U> {
    return this as any;
  }

  [util.inspect.custom](): string {
    return this._some ? `Some(${util.inspect(this._value)})` : "None";
  }

  public static Some<T>(): Option<undefined>;
  public static Some<T>(value: T): Option<T>;

  public static Some<T>(value?: T): Option<T | undefined> {
    return new Option(true, value);
  }

  public static None<T = never>(): Option<T> {
    return new Option(false);
  }
}