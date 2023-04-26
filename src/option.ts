// import util from "util";

export default class Option<T = unknown> {
  public _some: boolean;
  public _value: T;

  private constructor(some: true, value?: T);
  private constructor(some: false);
  private constructor(some: boolean, value?: T);
  private constructor(some: boolean, value?: T) {
    this._some = some;
    this._value = value!;
  }
  
  public cloned(): this {
    return this;
  }

  public isSome(): boolean {
    return this._some;
  }

  public isNone(): boolean {
    return !this._some;
  }

  public static Some<T = void>(value?: T): Option<T> {
    return new Option(true, value);
  }

  public static None<T = never>(): Option<T> {
    return new Option(false);
  }
}