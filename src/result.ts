import { RusttyCloneable, isRusttyClass } from "./utils";
import Option from "./option";
import util from "util";

export default class Result<T = unknown, E = never> {
  private _ok: boolean;
  private _value: T | E;

  private constructor(ok: true, value?: T);
  private constructor(ok: false, value?: E);
  private constructor(ok: boolean, value?: T | E);
  private constructor(ok: boolean, value?: T | E) {
    this._ok = ok;
    this._value = value!;
  }

  /**
   * Returns provided value if this is Ok, otherwise return current object.
   * @param res Result object to compare with.
   * @returns This object or provided default.
   * @example
   * const a = Ok(1);
   * const b = Ok(2);
   * assert(a.and(b).unwrap() === 2);
   * 
   * const c = Err("Error!");
   * const d = Ok(3);
   * assert(c.and(d).unwrapErr() === "Error!");
   * 
   * const e = Ok(4);
   * const f = Err("Error!");
   * assert(e.and(f).unwrapErr() === "Error!");
   * 
   * const g = Err("Error!");
   * const h = Err("Another error!");
   * assert(g.and(h).unwrapErr() === "Error!");
   */
  public and<U>(res: Result<U, E>): Result<U, E> {
    return this._ok ? res : this.into();
  }

  /**
   * Returns result of the provided callback if this is Ok, otherwise return current object.
   * @param callback Callback function to call if this is Ok.
   * @returns This object or result from the callback.
   * @example
   * const ok = Ok("Hello!");
   * const res = ok.andThen(v => v.length); // Callback will be called because `ok` is Ok.
   * assert(res.unwrap() === 6);
   * 
   * const err = Err("Error!");
   * const res2 = err.andThen(v => v.length); // In this case callback won't be called
   * assert(res2.unwrapErr() === "Error!");
   */
  public andThen<U>(callback: (ok: T) => Result<U, E>): Result<U, E> {
    return this._ok ? callback(this._value as T) : this.into();
  }

  /**
   * Clones this object using structured cloning algorithm.
   * @returns Cloned object.
   * @example
   * const a = Ok(1);
   * const b = a.cloned().unwrap();
   * assert(a.unwrap() === b);
   * 
   * class NotCloneable {
   *   public sayHello() {
   *     console.log("Hello!");
   *   }
   * } 
   * 
   * const c = Ok(new NotCloneable());
   * const d = c.cloned(); // This will throw an error since `NotCloneable` cannot be cloned
   */
  public cloned(this: Result<RusttyCloneable, RusttyCloneable>): Result<T, E> {
    return isRusttyClass(this._value) ? (this._value as any).cloned() : new Result(this._ok, structuredClone(this._value));
  }

  /**
   * Returns true if this is Ok and contains provided value.
   * @param value Value to compare with.
   * @returns boolean value indicating whether this is Ok and contains provided value.
   * @example
   * const a = Ok(1);
   * assert(a.contains(1) === true);
   * 
   * const b = Err("Error!");
   * assert(b.contains(1) === false);
   * 
   * const c = Ok(2);
   * assert(c.contains(1) === false);
   */
  public contains(value: T): boolean {
    return this._ok && this._value === value;
  }

  /**
   * Returns true if this is Err and contains provided value.
   * @param value Value to compare with.
   * @returns boolean value indicating whether this is Err and contains provided value.
   * @example
   * const a = Ok(1);
   * assert(a.containsErr(1) === false);
   * 
   * const b = Err("Error!");
   * assert(b.containsErr("Error!") === true);
   * 
   * const c = Err("Another error!");
   * assert(c.containsErr("Error!") === false);
   */
  public containsErr(value: E): boolean {
    return !this._ok && this._value === value;
  }

  /**
   * Converts this Result object into an Option<E> object.
   * @returns Option object.
   * @example
   * const a = Ok(1);
   * const b = a.err(); // None
   * assert(b.isNone()) === true);
   * 
   * const c = Err("Error!");
   * const d = c.err(); // Some("Error!")
   * assert(d.isSome() === true);
   */
  public err(): Option<E> {
    return this._ok ? None() : Some(this._value as E);
  }

  /**
   * Extracts Ok value from this Result object. If this is Err, throws an error.
   * @param message Error message to throw if this is Err.
   * @returns Ok value.
   * @example
   * const a = Ok(1);
   * assert(a.expect("Error!") === 1);
   * 
   * const b = Err("Error!");
   * b.expect("Error!"); // This will throw an error
   */
  public expect(message: string): T {
    if (this._ok) return this._value as T;
    throw new Error(`${message}: ${this._value}`);
  }

  /**
   * Extracts Err value from this Result object. If this is Ok, throws an error.
   * @param message Error message to throw if this is Ok.
   * @returns Err value.
   * @example
   * const a = Err("Error!");
   * assert(a.expectErr("Error!") === "Error!");
   * 
   * const b = Ok(1);
   * b.expectErr("Error!"); // This will throw an error
   */
  public expectErr(message: string): E {
    if (!this._ok) return this._value as E;
    throw new Error(`${message}: ${this._value}`);
  }

  /**
   * Extracts nested Result object from this Result object.
   * @returns Nested Result object.
   * @example
   * const a = Ok(Ok(1));
   * const b = a.flatten();
   * assert(b.unwrap() === 1);
   * 
   * const c = Ok(Err("Error!"));
   * const d = c.flatten();
   * assert(d.unwrapErr() === "Error!");
   * 
   * const e = Err("Error!");
   * const f = e.flatten();
   * assert(f.unwrapErr() === "Error!");
   */
  public flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F> {
    return this._ok ? this._value as Result<U, F> : this.into();
  }

  /**
   * Calls the provided callback if this is Ok and returns the same Result object.
   * @param callback Callback to call.
   * @returns same Result object.
   * @example
   * const a = Ok(1);
   * a.inspect(v => console.log(v)); // This will log 1
   * 
   * const c = Err("Error!");
   * c.inspect(v => console.log(v)); // This will not log anything
   */
  public inspect(callback: (ok: T) => void): Result<T, E> {
    if (this._ok) callback(this._value as T);
    return this;
  }

  /**
   * Calls the provided callback if this is Err and returns the same Result object.
   * @param callback Callback to call.
   * @returns same Result object.
   * @example
   * const a = Ok(1);
   * a.inspectErr(v => console.log(v)); // This will not log anything
   * 
   * const c = Err("Error!");
   * c.inspectErr(v => console.log(v)); // This will log "Error!"
   */
  public inspectErr(callback: (err: E) => void): Result<T, E> {
    if (!this._ok) callback(this._value as E);
    return this;
  }

  /**
   * Returns Err value from this Result object.
   * It is recommended to use this method only with TypeScript,
   * as it doesn't check whether this is Ok or Err and can cause a runtime error.
   * This method has the same functionality as the `unwrapErr` method,
   * but it is more type-safe and recommended to use with TypeScript.
   * @returns Err value.
   * @example
   * const a = Ok(1);
   * a.intoErr(); // This will cause a runtime error
   * 
   * const b = Err("Error!");
   * assert(b.intoErr() === "Error!");
   */
  public intoErr(this: Result<never, E>): E {
    return this._value as E;
  }

  /**
   * Returns Ok value from this Result object.
   * It is recommended to use this method only with TypeScript,
   * as it doesn't check whether this is Ok or Err and can cause a runtime error.
   * This method has the same functionality as the `unwrap` method,
   * but it is more type-safe and recommended to use with TypeScript.
   * @returns Ok value.
   * @example
   * const a = Ok(1);
   * assert(a.intoOk() === 1);
   * 
   * const b = Err("Error!");
   * b.intoOk(); // This will cause a runtime error
   */
  public intoOk(this: Result<T, never>): T {
    return this._value as T;
  }

  /**
   * Checks whether this is Err.
   * @returns true if this is Err, false otherwise.
   * @example
   * const a = Ok(1);
   * assert(a.isErr() === false);
   * 
   * const b = Err("Error!");
   * assert(b.isErr() === true);
   */
  public isErr(): boolean {
    return !this._ok;
  }
  
  /**
   * Checks whether this is Err and the predicate returns true.
   * @param predicate Pallback to call.
   * @returns true if this is Err and the predicate returns true, false otherwise.
   * @example
   * const a = Ok(1);
   * assert(a.isErrAnd(v => v === "Error!") === false);
   * 
   * const b = Err("Error!");
   * assert(b.isErrAnd(v => v === "Error!") === true);
   */
  public isErrAnd(predicate: (err: E) => boolean): boolean {
    return !this._ok && predicate(this._value as E);
  }

  /**
   * Checks whether this is Ok.
   * @returns true if this is Ok, false otherwise.
   * @example
   * const a = Ok(1);
   * assert(a.isOk() === true);
   * 
   * const b = Err("Error!");
   * assert(b.isOk() === false);
   */
  public isOk(): boolean {
    return this._ok;
  }

  /**
   * Checks whether this is Ok and the predicate returns true.
   * @param predicate Predicate to call.
   * @returns true if this is Ok and the predicate returns true, false otherwise.
   * @example
   * const a = Ok(1);
   * assert(a.isOkAnd(v => v === 1) === true);
   * 
   * const b = Err("Error!");
   * assert(b.isOkAnd(v => v === 1) === false);
   */
  public isOkAnd(predicate: (ok: T) => boolean): boolean {
    return this._ok && predicate(this._value as T);
  }

  /**
   * Returns an iterator over the possibly contained value.
   * @returns Iterator of Ok value.
   * @example
   * const a = Ok(1);
   * for (const v of a.iter()) {
   *   assert(v === 1);
   * }
   * 
   * const b = Err("Error!");
   * for (const v of b.iter()) {
   *   assert(false); // This won't be called
   * }
   */
  public *iter(): Generator<T, void, unknown> {
    if (this._ok) yield this._value as T;
  }

  /**
   * Applies a function to the contained value (if Ok) and returns modified Result object.
   * @param callback Callback to call.
   * @returns Result object with modified ok value.
   * @example
   * const a = Ok(1);
   * const b = a.map(v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = Err("Error!");
   * const d = c.map(v => v + 1).unwrapErr();
   * assert(d === "Error!");
   */
  public map<U>(callback: (ok: T) => U): Result<U, E> {
    if (this._ok) this._value = callback(this._value as T) as any;
    return this.into();
  }

  /**
   * Applies a function to the contained Err value (if Err) and returns modified Result object.
   * @param callback Callback to call.
   * @returns Result object with modified Err value.
   * @example
   * const a = Ok(1);
   * const b = a.mapErr(v => v + "!").unwrap();
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.mapErr(v => v + "!").unwrapErr();
   * assert(d === "Error!");
   */
  public mapErr<F>(callback: (err: E) => F): Result<T, F> {
    if (!this._ok) this._value = callback(this._value as E) as any;
    return this.into();
  }

  /**
   * Applies a function to the contained value (if Ok), or returns the provided default (if Err).
   * @param fallback Default value to return (if Err).
   * @param callback Callback to call (if Ok).
   * @returns Result object with modified Ok value.
   * @example
   * const a = Ok(1);
   * const b = a.mapOr(5, v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = Err("Error!");
   * const d = c.mapOr(5, v => v + 1).unwrap();
   * assert(d === 5);
   */
  public mapOr<U>(fallback: U, callback: (ok: T) => U): U {
    return this._ok ? callback(this._value as T) : fallback;
  }

  /**
   * Applies a callback to the contained Ok value (if Ok), or fallback function to the contained Err value (if Err).
   * @param fallback Fallback function to call (if Err).
   * @param callback Callback function to call (if Ok).
   * @returns Result of the callback or fallback function.
   * @example
   * const a = Ok(1);
   * const b = a.mapOrElse(() => 5, v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = Err("Error!");
   * const d = c.mapOrElse(() => 5, v => v + 1).unwrap();
   * assert(d === 5);
   */
  public mapOrElse<U>(fallback: (err: E) => U, callback: (ok: T) => U): U {
    return this._ok ? callback(this._value as T) : fallback(this._value as E);
  }

  /**
   * Returns the Option object containing the Some value or None if this is Err.
   * @returns Option object.
   * @example
   * const a = Ok(1);
   * const b = a.ok();
   * assert(b.isSome() === true);
   * 
   * const c = Err("Error!");
   * const d = c.ok();
   * assert(d.isNone() === true);
   */
  public ok(): Option<T> {
    return this._ok ? Some(this._value as T) : None();
  }

  /**
   * Returns the contained Ok value or a provided default.
   * @param fallback fallback value to return.
   * @returns Ok or fallback Result object.
   * @example
   * const a = Ok(1);
   * const b = a.or(Ok(2)).unwrap();
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.or(Ok(2)).unwrap();
   * assert(d === 2);
   * 
   * const e = Err("Error!");
   * const f = e.or(Err("Error2!")).unwrapErr();
   * assert(f === "Error2!");
   */
  public or<U, F>(fallback: Result<U, F>): Result<T | U, F> {
    return this._ok ? this.into() : fallback.into();
  }

  /**
   * Returns the contained Ok value or computes it from a closure.
   * @param fallback Fallback function to call.
   * @returns Ok or fallback Result object.
   * @example
   * const a = Ok(1);
   * const b = a.orElse(() => Ok(2)).unwrap();
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.orElse(() => Ok(2)).unwrap();
   * assert(d === 2);
   * 
   * const e = Err("Error!");
   * const f = e.orElse(() => Err("Error2!")).unwrapErr();
   * assert(f === "Error2!");
   */ 
  public orElse<U, F>(fallback: (err: E) => Result<U, F>): Result<T | U, F> {
    return this._ok ? this.into() : fallback(this._value as E).into();
  }

  /**
   * Transposes a Result of an Option into an Option of a Result.
   * Ok(None()) will be mapped to None, Ok(Some(_)) and Err(_) will be mapped to Some(Ok(_)) and Some(Err(_)) respectively.
   * @returns Option object containing Result object.
   * @example
   * const a = Ok(Some(1));
   * const b = a.transpose() // Some(Ok(1))
   * assert(b.unwrap().unwrap() === 1); // Some(Ok(1)) -> Ok(1) -> 1
   * 
   * const c = Ok(None());
   * const d = c.transpose() // None
   * assert(d.isNone() === true);
   * 
   * const e = Err("Error!");
   * const f = e.transpose() // Some(Err("Error!"))
   * assert(f.unwrap().unwrapErr() === "Error!"); // Some(Err("Error!")) -> Err("Error!") -> "Error!"
   */
  public transpose(this: Result<None>): None;
  public transpose(this: Result<never, E>): Some<Result<never, E>>;
  public transpose<U>(this: Result<Some<U>>): Some<Result<U, E>>;
  public transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.unwrap().isNone() ? None() : Some(this.into());
  }

  /**
   * Returns the contained Ok value or throws the contained Err value.
   * @returns Ok value.
   * @throws Err value.
   * @example
   * const a = Ok(1);
   * const b = a.unwrap();
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.unwrap(); // throws "Error!"
   */
  public unwrap(): T {
    if (this._ok) return this._value as T;
    throw this._value;
  }

  /**
   * Returns the contained Err value or throws the contained Ok value.
   * @returns Err value.
   * @throws Ok value.
   * @example
   * const a = Err("Error!");
   * const b = a.unwrapErr();
   * assert(b === "Error!");
   * 
   * const c = Ok(1);
   * const d = c.unwrapErr(); // throws 1
   */
  public unwrapErr(): E {
    if (!this._ok) return this._value as E;
    throw this._value;
  }

  /**
   * Returns the contained Ok value or a provided default.
   * @param fallback fallback value to return.
   * @returns Ok or fallback value.
   * @example
   * const a = Ok(1);
   * const b = a.unwrapOr(2);
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.unwrapOr(2);
   * assert(d === 2);
   */
  public unwrapOr<U>(fallback: U): T | U {
    return this._ok ? this._value as T : fallback;
  }

  /**
   * Returns the contained Ok value or computes it from a closure.
   * @param fallback Fallback function to call.
   * @returns Ok or fallback value.
   * @example
   * const a = Ok(1);
   * const b = a.unwrapOrElse(() => 2);
   * assert(b === 1);
   * 
   * const c = Err("Error!");
   * const d = c.unwrapOrElse(() => 2);
   * assert(d === 2);
   */
  public unwrapOrElse<U>(fallback: (err: E) => U): T | U {
    return this._ok ? this._value as T : fallback(this._value as E);
  }

  /**
   * Returns the same Result objeact with changed generic types.
   * This method should be used only if you know that it won't cause any type errors,
   * therefore it is not recommended to use this method in most cases, as it can be considered as using the `any` type.
   * @returns Same object but with changed ok and error types.
   * @example
   * function foo(): Result<number, string> {
   *   return Err("Error!");
   * }
   * 
   * function bar(): Result<boolean, string> {
   *   const value = foo(); // Result<number, string>
   *   return value.into(); // returning raw `value` would cause a type error
   * }
   * 
   * bar();
   */
  public into<U = T, F = E>() {
    return this as unknown as Result<U, F>;
  }

  /**
   * Returns a string representation of the Result object.
   * This method is used by the console.log function when logging the Result object to the console.
   * @returns A string representation of the Result object in the format "Ok(value)" for success values, and "Err(value)" for error values.
   */
  [util.inspect.custom](): string {
    return this._ok ? `Ok(${util.inspect(this._value)})` : `Err(${util.inspect(this._value)})`;
  }

  /**
   * Creates a new Result object with a success value.
   * @param value The success value to store in the Result object.
   * @returns A new Result object with a success value.
   * @example
   * const result = Ok("Success!");
   *
   * console.log(result); // Ok("Success!")
   * assert(result.isOk()); // true
   * assert(result.unwrap() === "Success!"); // true
   */
  public static Ok<T = void, E = never>(value?: T): Result<T, E> {
    return new Result(true, value);
  }

  /**
   * Creates a new Result object with an error value.
   * @param value The error value to store in the Result object.
   * @returns A new Result object with an error value.
   * @example
   * const result = Err("An error occurred");
   * 
   * console.log(result); // Err("An error occurred")
   * assert(result.isErr()); // true
   * assert(result.unwrapErr() === "An error occurred"); // true
   * 
   * result.unwrap(); // throws Error
   */
  public static Err<E = void, T = never>(value?: E): Result<T, E> {
    return new Result(false, value);
  }
}
