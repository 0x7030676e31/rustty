import util from "util";

export default class Option<T = unknown> {
  private _some: boolean;
  private _value: T;

  private constructor(some: true, value?: T);
  private constructor(some: false);
  private constructor(some: boolean, value?: T);
  private constructor(some: boolean, value?: T) {
    this._some = some;
    this._value = value!;
  }

  /**
   * Returns provided value if this is Some, otherwise returns None.
   * @param optb The value to return if this is Some.
   * @returns This object or provided default.
   * @example
   * const a = Some(1);
   * const b = None();
   * assert(a.and(b).isNone() === true);
   * 
   * const c = Some(1);
   * const d = Some(2);
   * assert(c.and(d).unwrap() === 2);
   * 
   * const e = None();
   * const f = Some(2);
   * assert(e.and(f).isNone() === true);
   * 
   * const g = None();
   * const h = None();
   * assert(g.and(h).isNone() === true);
   */
  public and<U>(optb: Option<U>): Option<U> {
    return this._some ? optb : this.into();
  }

  /**
   * Returns Option of the provided callback if this is Some, otherwise return None.
   * @param callback Callback function to call if this is Some.
   * @returns This object or result from the callback.
   * @example
   * const some = Some("Hello!");
   * const res = ok.andThen(v => v.length); // Callback will be called because `some` is Some.
   * assert(res.unwrap() === 6);
   * 
   * const none = None();
   * const res2 = none.andThen(v => v.length); // In this case callback won't be called
   * assert(res2.isNone() === true);
   */
  public andThen<U>(callback: (value: T) => Option<U>): Option<U> {
    return this._some ? callback(this._value) : this.into();
  }
  
  /**
   * Clones this object using structured cloning algorithm.
   * @returns Cloned object.
   * @example
   * const a = Some(1);
   * const b = a.cloned().unwrap();
   * assert(a.unwrap() === b);
   * 
   * class NotCloneable {
   *   public sayHello() {
   *     console.log("Hello!");
   *   }
   * } 
   * 
   * const c = Some(new NotCloneable());
   * const d = c.cloned(); // This will throw an error since `NotCloneable` cannot be cloned
   */
  public cloned(): this {
    return this;
  }

  /**
   * Returns true if this is Some and contains provided value.
   * @param value Value to compare with.
   * @returns boolean value indicating whether this is Some and contains provided value.
   * @example
   * const a = Some(1);
   * assert(a.contains(1) === true);
   * 
   * const b = None();
   * assert(b.contains(1) === false);
   * 
   * const c = Some(2);
   * assert(c.contains(1) === false);
   */
  public contains(value: T): boolean {
    return this._some && this._value === value;
  }

  /**
   * Extracts Some value from this Option object. If this is None, throws an error.
   * @param message Error message to throw if this is None.
   * @returns Some value.
   * @example
   * const a = Some(1);
   * assert(a.expect("Error!") === 1);
   * 
   * const b = None();
   * b.expect("Error!"); // This will throw an error
   */
  public expect(message: string): T {
    if (this._some) return this._value as T;
    throw new Error(message);
  }

  /**
   * Returns the value from this object if provided predicate returns true, otherwise returns None.
   * @param predicate Predicate function to call if this is Some.
   * @returns This object or None.
   * @example
   * const isEven = (v: number) => v % 2 === 0;
   * 
   * const a = Some(1);
   * const b = a.filter(isEven);
   * 
   * assert(b.isNone() === true);
   * 
   * const c = Some(2);
   * const d = c.filter(isEven);
   * 
   * assert(d.unwrap() === 2);
   * 
   * const e = None();
   * const f = e.filter(isEven);
   * 
   * assert(f.isNone() === true);
   */
  public filter(predicate: (some: T) => boolean): Option<T> {
    return this._some && predicate(this._value) ? this : None();
  }

  /**
   * Extracts nested Option object from this Option object.
   * @returns Nested Option object.
   * @example
   * const a = Some(Some(1));
   * const b = a.flatten();
   * assert(b.unwrap() === 1);
   * 
   * const c = Some(None());
   * const d = c.flatten();
   * assert(d.isNone() === true);
   * 
   * const e = None();
   * const f = e.flatten();
   * assert(f.isNone() === true);
   */
  public flatten<U>(this: Option<Option<U>>): Option<U> {
    return this._some ? this._value : None();
  }

  // TODO: https://doc.rust-lang.org/stable/std/option/enum.Option.html#method.get_or_insert

  /**
   * Calls the provided callback if this is Some and returns the same Option object.
   * @param callback Callback to call.
   * @returns same Option object.
   * @example
   * const a = Some(1);
   * a.inspect(v => console.log(v)); // This will log 1
   * 
   * const c = None();
   * c.inspect(v => console.log(v)); // This will not log anything
   */
  public inspect(callback: (value: T) => void): this {
    if (this._some) callback(this._value);
    return this;
  }

  /**
   * Checks whether this is None.
   * @returns true if this is None, false otherwise.
   * @example
   * const a = Some(1);
   * assert(a.isNone() === false);
   * 
   * const b = None();
   * assert(b.isNone() === true);
   */
  public isNone(): boolean {
    return !this._some;
  }

  /**
   * Checks whether this is Some.
   * @returns true if this is Some, false otherwise.
   * @example
   * const a = Some(1);
   * assert(a.isSome() === true);
   * 
   * const b = None();
   * assert(b.isSome() === false);
   */
  public isSome(): boolean {
    return this._some;
  }

  /**
   * Checks whether this is Some and the predicate returns true.
   * @param callback Callback to call.
   * @returns true if this is Ok and the callback returns true, false otherwise.
   * @example
   * const a = Ok(1);
   * assert(a.isSomeAnd(v => v === 1) === true);
   * 
   * const b = Err("Error!");
   * assert(b.isSomeAnd(v => v === 1) === false);
   */
  public isSomeAnd(predicate: (some: T) => boolean): boolean {
    return this._some && predicate(this._value);
  }

  /**
   * Returns an iterator over the possibly contained value.
   * @returns Iterator of Some value.
   * @example
   * const a = Some(1);
   * for (const v of a.iter()) {
   *   assert(v === 1);
   * }
   * 
   * const b = None();
   * for (const v of b.iter()) {
   *   assert(false); // This won't be called
   * }
   */
  public *iter(): Generator<T, void, unknown> {
    if (this._some) yield this._value;
  }

  /**
   * Applies a function to the contained value (if Some) and returns modified Option object.
   * @param callback Callback to call.
   * @returns Option object with modified ok value.
   * @example
   * const a = Some(1);
   * const b = a.map(v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = None();
   * const d = c.map(v => v + 1);
   * assert(d.isNone() === true);
   */
  public map<U>(callback: (some: T) => U): Option<U> {
    if (this._some) this._value = callback(this._value) as unknown as T;
    return this.into();
  }

  /**
   * Applies a function to the contained value (if Some), or returns the provided default (if None).
   * @param fallback Default value to return (if Err).
   * @param callback Callback to call (if Some).
   * @returns Option object with modified Some value.
   * @example
   * const a = Some(1);
   * const b = a.mapOr(5, v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = None();
   * const d = c.mapOr(5, v => v + 1);
   * assert(d === 5);
   */
  public mapOr<U>(fallback: U, callback: (some: T) => U): U {
    return this._some ? callback(this._value) : fallback;
  }

  /**
   * Applies a callback to the contained Some value (if Some), or computes a fallback (if None).
   * @param fallback Fallback function to call (if None).
   * @param callback Callback function to call (if Some).
   * @returns Result of the callback or fallback function.
   * @example
   * const a = Some(1);
   * const b = a.mapOrElse(() => 5, v => v + 1).unwrap();
   * assert(b === 2);
   * 
   * const c = None();
   * const d = c.mapOrElse(() => 5, v => v + 1).unwrap();
   * assert(d === 5);
   */
  public mapOrElse<U>(fallback: () => U, callback: (some: T) => U): U {
    return this._some ? callback(this._value) : fallback();
  }

  /**
   * Changes Option type to Result type by providing an error value.
   * @param err Error value to use.
   * @returns Ok if this is Some, Err otherwise.
   * @example
   * const a = Some(1);
   * const b = a.okOr("Error!").unwrap();
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.okOr("Error!").unwrapErr();
   * assert(d === "Error!");
   */
  public okOr<E>(err: E): Result<T, E> {
    return this._some ? Ok(this._value) : Err(err);
  }

  /**
   * Changes Option type to Result type by providing an error value computed from the callback.
   * @param err Error fallback function to call.
   * @returns Ok if this is Some, Err otherwise.
   * @example
   * const a = Some(1);
   * const b = a.okOrElse(() => "Error!").unwrap();
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.okOrElse(() => "Error!").unwrapErr();
   * assert(d === "Error!");
   */
  public okOrElse<E>(err: () => E): Result<T, E> {
    return this._some ? Ok(this._value) : Err(err());
  }

  /**
   * Returns provided value if this is None, otherwise returns this Option object.
   * @param fallback Option object to return if this is None.
   * @returns This object or provided Option object.
   * @example
   * const a = Some(1);
   * const b = a.or(Some(2)).unwrap();
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.or(Some(2)).unwrap();
   * assert(d === 2);
   * 
   * const e = None();
   * const f = e.or(None()).unwrapErr();
   * assert(f === "None");
   * 
   * const g = Some(1);
   * const h = g.or(None()).unwrap();
   * assert(h === 1);
   */
  public or<U>(fallback: Option<U>): Option<T | U> {
    return this._some ? this : fallback;
  }

  /**
   * Returns provided value if this is None, otherwise returns result of the callback.
   * @param fallback Callback to call if this is None.
   * @returns This object or result of the callback.
   * @example
   * const a = Some(1);
   * const b = a.orElse(() => Some(2)).unwrap();
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.orElse(() => Some(2)).unwrap();
   * assert(d === 2);
   * 
   * const e = None();
   * const f = e.orElse(() => None()).unwrapErr();
   * 
   * const g = Some(1);
   * const h = g.orElse(() => None()).unwrap();
   * assert(h === 1);
   */
  public orElse<U>(fallback: () => Option<U>): Option<T | U> {
    return this._some ? this : fallback();
  }

  /**
   * Replaces the actual value in this object with the provided one returning the old value.
   * @param value New value to replace the old one.
   * @returns Option object with the old value.
   * @example
   * const a = Some(1);
   * const a_old = a.replace(2).unwrap();
   * assert(a_old === 1);
   * assert(a.unwrap() === 2);
   * 
   * const b = None();
   * const b_old = b.replace(2).unwrapErr();
   * assert(b_old === "None");
   * assert(b.isNone() === true);
   */
  public replace<U>(value: U): Option<T> {
    const self = this.cloned();
    this._value = value as unknown as T;
    return self;
  }

  /**
   * Takes the actual value out of this object, leaving a None in its place.
   * @returns Option object with the old value.
   * @example
   * const a = Some(1);
   * const a_old = a.take().unwrap();
   * assert(a_old === 1);
   * assert(a.isNone() === true);
   * 
   * const b = None();
   * const b_old = b.take().unwrapErr();
   * assert(b_old.isNone() === true);
   * assert(b.isNone() === true);
   */
  public take(): Option<T> {
    const self = this.cloned();
    this._value = undefined as unknown as T;
    this._some = false;
    return self;
  }

  /**
   * Transposes a Option of a Result into a Result of an Option.
   * None will be mapped to Ok(None), Some(Ok(_)) and Some(Err(_)) will be mapped to Ok(Some(_)) and Err(_).
   * @returns Result object containing Option object.
   * @example
   * const a = Some(Ok(1));
   * const b = a.transpose(); // Ok(Some(1))
   * assert(b.unwrap().unwrap() === 1); // Some(Ok(1)) -> Ok(1) -> 1
   * 
   * const c = Some(Err("Error!"));
   * const d = c.transpose(); // Err("Error!")
   * assert(d.unwrapErr() === "Error!"); // Err("Error!") -> "Error!"
   * 
   * const e = None();
   * const f = e.transpose(); // Ok(None)
   * assert(f.unwrap().isNone() === true); // None -> Ok(None) -> None
   */
  public transpose(this: None): Ok<None>;
  public transpose<U>(this: Some<Ok<U>>): Ok<Some<U>>;
  public transpose<E>(this: Some<Err<E>>): Err<E>;
  public transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return !this._some ? Ok(None()) : this._value.isOk() ? Ok(Some(this._value.unwrap())) : Err(this._value.unwrapErr());
  }

  /**
   * Returns the contained Some value or throws the Error.
   * @returns Some value.
   * @throws Error if this is None.
   * @example
   * const a = Some(1);
   * const b = a.unwrap();
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.unwrap(); // throws Error
   */
  public unwrap(): T {
    if (this._some) return this._value;
    throw new Error("Called `Option.unwrap()` on a `None` value");
  }

  /**
   * Returns the contained Some value or a provided default.
   * @param fallback fallback value to return.
   * @returns Some or fallback value.
   * @example
   * const a = Some(1);
   * const b = a.unwrapOr(2);
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.unwrapOr(2);
   * assert(d === 2);
   */
  public unwrapOr<U>(fallback: U): T | U {
    return this._some ? this._value : fallback;
  }

  /**
   * Returns the contained Some value or computes it from a closure.
   * @param fallback Fallback function to call.
   * @returns Some or fallback value.
   * @example
   * const a = Some(1);
   * const b = a.unwrapOrElse(() => 2);
   * assert(b === 1);
   * 
   * const c = None();
   * const d = c.unwrapOrElse(() => 2);
   * assert(d === 2);
   */
  public unwrapOrElse<U>(fallback: () => U): T | U {
    return this._some ? this._value as T : fallback();
  }

  /**
   * Unzips an Option containing a tuple of two elements into two separate Options.
   * If the Option is None, then this method returns two None values, otherwise two Options contained in the tuple.
   * @returns Tuple of two Options.
   * @example
   * const a = Some([1, 2]);
   * const [b, c] = a.unzip();
   * assert(b.unwrap() === 1);
   * assert(c.unwrap() === 2);
   * 
   * const d = None();
   * const [e, f] = d.unzip();
   * assert(e.isNone() === true);
   * assert(f.isNone() === true);
   */
  public unzip<T, U>(this: Option<[T, U]>): [Option<T>, Option<U>] {
    return this._some ? [Some(this._value[0]), Some(this._value[1])] : [None(), None()];
  }

  /**
   * Returns Some if exactly one of this and optb is Some, otherwise returns None.
   * @param optb Option to compare with.
   * @returns XORed Option.
   * @example
   * const a = Some(1);
   * const b = Some(2);
   * assert(a.xor(b).isNone() === true);
   * 
   * const c = None();
   * const d = Some(2);
   * assert(c.xor(d).unwrap() === 2);
   * 
   * const e = Some(1);
   * const f = None();
   * assert(e.xor(f).unwrap() === 1);
   * 
   * const g = None();
   * const h = None();
   * assert(g.xor(h).isNone() === true);
   */
  public xor<U>(optb: Option<U>): Option<T | U> {
    if (!optb._some && this._some) return this.into();
    if (optb._some && !this._some) return optb.into();
    return None();
  }

  /**
   * Zips this with another Option.
   * If this is Some(s) and other is Some(o), this method returns Some((s, o)). Otherwise, None is returned.
   * @param other Option to zip with.
   * @returns Zipped Option.
   * @example
   * const a = Some(1);
   * const b = Some("hi");
   * const c = None();
   * 
   * const d = a.zip(b); // Some([1, "hi"])
   * const e = a.zip(c); // None()
   * 
   * assert(d.isSome() === true);
   * assert(e.isNone() === true);
   */
  public zip<U>(other: Option<U>): Option<[T, U]> {
    return this._some && other._some ? Some([this._value, other._value]) : None();
  }

  /**
   * Zips this and another Option using a function.
   * If this is Some(s) and other is Some(o), this method returns Some(callback(s, o)). Otherwise, None is returned.
   * @param other Option to zip with.
   * @param callback Function to call.
   * @returns Zipped Option.
   * @example
   * class Point {
   *   public x: number;
   *   public y: number;
   * 
   *   private constructor(x: number, y: number) {
   *     this.x = x;
   *     this.y = y;
   *    }
   * 
   *   public static new(x: number, y: number) {
   *     return new Point(x, y);
   *   }
   * 
   *   public cmp(other: Point): boolean {
   *     return this.x === other.x && this.y === other.y;
   *   }
   * }
   * 
   * const x = Some(31.2);
   * const y = Some(49.5);
   * 
   * const a = x.zipWith(y, Point.new); // Some(Point { x: 31.2, y: 49.5 })
   * const b = x.zipWith(None(), Point.new); // None()
   * 
   * assert(a.unwrap().cmp(Point.new(31.2, 49.5)) === true);
   * assert(b.isNone() === true);
   */
  public zipWith<U, R>(other: Option<U>, callback: (a: T, b: U) => R): Option<R> {
    return this._some && other._some ? Some(callback(this._value, other._value)) : None();
  }

  /**
   * Returns the same Some objeact with changed generic types.
   * This method should be used only if you know that it won't cause any type errors,
   * therefore it is not recommended to use this method in most cases, as it can be considered as using the `any` type.
   * @returns Same object but with changed Some type.
   * @example
   * function foo(): Some<number> {
   *   return None();
   * }
   * 
   * function bar(): Some<boolean> {
   *   const value = foo(); // Some<number>
   *   return value.into(); // returning raw `value` would cause a type error
   * }
   * 
   * bar();
   */
  public into<U>(): Option<U> {
    return this as unknown as Option<U>;
  }

  /**
   * Returns a string representation of the Option object.
   * This method is used by the console.log function when logging the Option object to the console.
   * @returns A string representation of the Option object in the format "Some(value)" for some values, and "None" for none values.
   */
  [util.inspect.custom](): string {
    return this._some ? `Some(${util.inspect(this._value)})` : "None";
  }

  /**
   * Creates a new Option object with a some value.
   * @param value The value to wrap in a Some.
   * @returns A new Option object with a some value.
   * @example
   * const some = Some(1);
   * 
   * console.log(some); // Some(1)
   * assert(some.isSome()); // true
   * assert(some.unwrap() === 1); // true
   */
  public static Some<T = void>(value?: T): Option<T> {
    return new Option(true, value);
  }

  /**
   * Creates a new Option object with a none value.
   * @returns A new Option object without a value.
   * @example
   * const none = None();
   * 
   * console.log(none); // None
   * assert(none.isNone()); // true
   */
  public static None<T = never>(): Option<T> {
    return new Option(false);
  }
}