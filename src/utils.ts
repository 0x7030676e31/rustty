import Result from "./result";
import Option from "./option";

export type StructuredCloneable
  = string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | void
  | RegExp
  | Date
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array
  | DataView
  | Error
  | Map<StructuredCloneable, StructuredCloneable>
  | Set<StructuredCloneable>
  | Array<StructuredCloneable>
  | { [key: string | number | symbol]: StructuredCloneable };

export type RusttyCloneable = Result<RusttyCloneable | never, RusttyCloneable | never> | Option<RusttyCloneable | never> | StructuredCloneable;
export function isRusttyClass(value: any): value is Result | Option {
  return value instanceof Result || value instanceof Option;
}