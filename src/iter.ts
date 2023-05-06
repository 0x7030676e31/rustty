Array.prototype.append = function <T = any, U = T>(this: Array<T | U>, other: U[]): Array<T | U> {
  this.push(...other.splice(0));
  return this;
}

Array.prototype.clear = function <T = any>(this: Array<T>): void {
  this.splice(0);
}

Array.prototype.dedup = function <T = any>(this: Array<T>): void {
  this.dedupBy((a, b) => a === b);
}

Array.prototype.dedupBy = function <T = any>(this: Array<T>, fn: (a: T, b: T, index: number, self: T[]) => boolean): void {
  this.retain((v, idx) => !fn(v, this[idx + 1], idx, this));
}

Array.prototype.dedupByKey = function <T = any, U = any>(this: Array<T>, fn: (item: T, index: number, self: T[]) => U): void {
  this.retain(this.map(fn).map((v, idx, self) => v !== self[idx + 1]));
}

Array.prototype.spliceFilter = function <T = any>(this: Array<T>, predicate: (item: T, index: number, self: T[]) => boolean): T[] {
  const rejected: T[] = [];
  this.splice(0, this.length, ...this.filter((v, i, s) => predicate(v, i, s) || void rejected.push(v)));

  return rejected;
}

Array.prototype.isEmpty = function <T = any>(this: Array<T>): boolean {
  return this.len() === 0;
}

Array.prototype.len = function <T = any>(this: Array<T>): number {
  return this.reduce((acc) => acc + 1, 0);
}

Array.prototype.retain = function <T = any>(this: Array<T>, predicate: ((item: T, index: number, self: T[]) => boolean) | boolean[]): void {
  this.splice(0, this.length, ...this.filter(predicate instanceof Array ? (_, idx) => predicate[idx] : predicate));
}

Array.prototype.chunks = function <T = any>(this: Array<T>, size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < this.length; i += size) chunks.push(this.slice(i, i + size));

  return chunks;
}

Array.prototype.startsWith = function <T = any>(this: Array<T>, other: T[]): boolean {
  return this.slice(0, other.length).every((v, i) => v === other[i]);
}

Array.prototype.endsWith = function <T = any>(this: Array<T>, other: T[]): boolean {
  return this.slice(-other.length).every((v, i) => v === other[i]);
}

Array.prototype.fillWith = function <T = any, U = T>(this: Array<T | U>, fn: (index: number, self: T[]) => U): U[] {
  const entries = Object.keys(this);
  for (let i = 0; i < this.length; i++) if (!entries.includes(i.toString())) this[i] = fn(i, this as T[]);

  return this as U[];
}

Array.prototype.first = function <T = any>(this: Array<T>): Option<T> {
  return this.length === 0 ? None() : Some(this[0]);
}

Array.prototype.groupBy = function <T = any>(this: Array<T>, fn: (a: T, b: T, index: number, self: T[]) => boolean): T[][] {
  if (this.length === 0) return [];
  
  const groups: T[][] = [[ this[0] ]];
  for (let i = 1; i < this.length; i++) {
    if (fn(this[i - 1], this[i], i, this)) groups.last().unwrap().push(this[i]);
    else groups.push([ this[i] ]);
  }

  return groups;
}

Array.prototype.last = function <T = any>(this: Array<T>): Option<T> {
  return this.length === 0 ? None() : Some(this.at(-1));
}

Array.prototype.rchunks = function <T = any>(this: Array<T>, size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = this.length; i > 0; i -= size) chunks.push(this.slice(Math.max(i - size, 0)  , i));

  return chunks;
}

Array.prototype.repeat = function <T = any>(this: Array<T>, times: number): T[] {
  return Array(times).fillWith(() => this.slice(0)).flat();
}

Array.prototype.rotateLeft = function <T = any>(this: Array<T>, mid: number): T[] {
  return this.splitAt(mid).reverse().flat() as any;
}

Array.prototype.rotateRight = function <T = any>(this: Array<T>, mid: number): T[] {
  return this.splitAt(this.length - mid).reverse().flat() as any;
}

Array.prototype.rsplit = function <T = any>(this: Array<T>, predicate: (item: T, index: number, self: T[]) => boolean): T[][] {
  return this.split(predicate).reverse();
}

Array.prototype.rsplitn = function <T = any>(this: Array<T>, n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][] {
  if (n < 0) throw new Error("n cannot be negative");
  if (n === 0) return [];

  const chunks: T[][] = [];
  const indexes = this.map((v, i, s) => [predicate(v, i, s), i]).filter(([v]) => v).map(([, i]) => i).reverse().concat([ -1 ]) as number[];
  for (const [i, pos] of indexes.enumerate()) {
    chunks.push(this.slice(pos + 1, indexes[i - 1] ?? this.length));
    if (chunks.length === n) {
      chunks.last().unwrap().unshift(...this.slice(0, pos + 1));
      break;
    }
  }

  return chunks;
}

Array.prototype.split = function <T = any>(this: Array<T>, predicate: (item: T, index: number, self: T[]) => boolean, inclusive?: boolean): T[][] {
  if (inclusive) return this.splitInclusive(predicate);
  
  const chunks: T[][] = [[]];
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) chunks.push([]);
    else chunks.last().unwrap().push(this[i]);
  }

  return chunks;
}

Array.prototype.splitAt = function <T = any>(this: Array<T>, mid: number): [T[], T[]] {
  if (mid < 0) throw new Error("mid cannot be negative");
  if (mid > this.length) throw new Error("mid cannot be greater than the length of the array");
  return [ this.slice(0, mid), this.slice(mid) ];
}

Array.prototype.splitFirst = function <T = any>(this: Array<T>): Option<[T, T[]]> {
  return this.length === 0 ? None() : Some([ this[0], this.slice(1) ]);
}

Array.prototype.splitInclusive = function <T = any>(this: Array<T>, predicate: (item: T, index: number, self: T[]) => boolean): T[][] {
  const chunks: T[][] = [[]];
  for (let i = 0; i < this.length; i++) {
    chunks.last().unwrap().push(this[i]);
    if (predicate(this[i], i, this)) chunks.push([]);
  }

  return chunks;
}

Array.prototype.splitLast = function <T = any>(this: Array<T>): Option<[T, T[]]> {
  return this.length === 0 ? None() : Some([ this.last().unwrap(), this.slice(0, -1) ]);
}

Array.prototype.splitn = function <T = any>(this: Array<T>, n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][] {
  if (n < 0) throw new Error("n cannot be negative");
  if (n === 0) return [];

  const chunks: T[][] = [[]];
  for (let i = 0; i < this.length; i++) {
    if (chunks.length === n) {
      chunks.last().unwrap().push(...this.slice(i));
      return chunks;
    }

    if (!predicate(this[i], i, this)) chunks.last().unwrap().push(this[i]);
    else chunks.push([]);
  }

  return chunks;
}

Array.prototype.stripPrefix = function <T = any>(this: Array<T>, prefix: T[]): Option<T[]> {
  return this.startsWith(prefix) ? Some(this.slice(prefix.length)) : None();
}

Array.prototype.stripSuffix = function <T = any>(this: Array<T>, suffix: T[]): Option<T[]> {
  return this.endsWith(suffix) ? Some(this.slice(0, -suffix.length)) : None();
}

Array.prototype.swap = function <T = any>(this: Array<T>, a: number, b: number): void {
  if (a < 0 || a >= this.length) throw new Error("a is out of bounds");
  if (b < 0 || b >= this.length) throw new Error("b is out of bounds");

  const temp = this[a];
  this[a] = this[b];
  this[b] = temp;
}

Array.prototype.windows = function <T = any>(this: Array<T>, size: number): T[][] {
  if (size <= 0 || size > this.length) throw new Error("size is out of bounds");
  return this.map((_, i) => this.slice(i, i + size)).slice(0, this.length - size + 1);
}

Array.prototype.cycle = function* <T = any>(this: Array<T>): Generator<T, void, undefined> {
  while (true) {
    for (const item of this) yield item;
  }
}

Array.prototype.enumerate = function <T = any>(this: Array<T>): [number, T][] {
  return this.map((v, i) => [i, v]);
}

Array.prototype.rev = function <T = any>(this: Array<T>): T[] {
  return this.slice().reverse();
}

Array.prototype.zip = function <T = any, U = any>(this: Array<T>, other: U[]): [T, U][] {
  return this.map((v, i) => [v, other[i]]).slice(0, Math.min(this.length, other.length)) as [T, U][];
}

Array.prototype.unzip = function <T = any, U = any>(this: [T, U][]): [T[], U[]] {
  return [ this.map(v => v[0]), this.map(v => v[1]) ];
}

Array.prototype.intersperse = function <T = any>(this: Array<T>, item: T): T[] {
  return this.flatMap((v, i) => i === this.length - 1 ? [v] : [v, item]);
}

Array.prototype.intersperseWith = function <T = any>(this: Array<T>, fn: (item: T, index: number, self: T[]) => T): T[] {
  return this.flatMap((v, i) => i === this.length - 1 ? [v] : [v, fn(v, i, this)]);
}

Array.prototype.max = function <T extends number | bigint | string>(this: Array<T>): Option<T> {
  if (this.length === 0) return None();
  if (typeof this[0] === "string") return Some(this.sort().last().unwrap());
  return Some(this.sort((a, b) => (b as any) - (a as any)).first().unwrap());
}

Array.prototype.min = function <T extends number | bigint | string>(this: Array<T>): Option<T> {
  if (this.length === 0) return None();
  if (typeof this[0] === "string") return Some(this.sort().first().unwrap());
  return Some(this.sort((a, b) => (a as any) - (b as any)).first().unwrap());
}

Array.prototype.product = function (this: any[], forceBigInt: boolean = false) {
  const result = this.reduce((a: any, b: any) => a * b, typeof this[0] === "bigint" ? 1n : 1);
  return forceBigInt ? BigInt(result) : result;
} as any;

Array.prototype.sum = function (this: any[], forceBigInt: boolean = false) {
  const result = this.reduce((a: any, b: any) => a + b, typeof this[0] === "bigint" ? 0n : 0);
  return forceBigInt ? BigInt(result) : result;
} as any;


interface Array<T> {
  append<U = T>(other: U[]): Array<T | U>;
  clear(): void;
  dedup(): void;
  dedupBy(fn: (a: T, b: T, index: number, self: T[]) => boolean): void;
  dedupByKey<U>(fn: (item: T, index: number, self: T[]) => U): void;
  spliceFilter(predicate: (item: T, index: number, self: T[]) => boolean): T[]; // drain_filter
  isEmpty(): boolean;
  len(): number;
  retain(predicate: (item: T, index: number, self: T[]) => boolean): void;
  retain(list: boolean[]): void;
  chunks(size: number): T[][];
  startsWith(other: T[]): boolean;
  endsWith(other: T[]): boolean;
  fillWith<U = T>(fn: (index: number, self: T[]) => U): Array<T | U>;
  first(): Option<T>;
  groupBy(predicate: (a: T, b: T, index: number, self: T[]) => boolean): T[][];
  last(): Option<T>;
  rchunks(size: number): T[][];
  repeat(times: number): T[];
  rotateLeft(mid: number): T[];
  rotateRight(mid: number): T[];
  rsplit(predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  rsplitn(n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  split(predicate: (item: T, index: number, self: T[]) => boolean, inclusive?: boolean): T[][];
  splitAt(n: number): [T[], T[]];
  splitFirst(): Option<[T, T[]]>;
  splitInclusive(predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  splitLast(predicate: (item: T, index: number, self: T[]) => boolean): Option<[T, T[]]>;
  splitn(n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  stripPrefix(prefix: T[]): Option<T[]>;
  stripSuffix(suffix: T[]): Option<T[]>;
  swap(a: number, b: number): void;
  windows(size: number): T[][];
  cycle(): Generator<T, void, unknown>;
  enumerate(): [number, T][];
  rev(): T[];
  zip<U>(other: U[]): [T, U][];
  unzip<T, U>(this: [T, U][]): [T[], U[]];
  intersperse<U = T>(separator: U): Array<T | U>;
  intersperseWith<U>(fn: (item: T, index: number, self: T[]) => U): Array<T | U>;
  max(this: number[]): Option<number>;
  max(this: bigint[]): Option<bigint>;
  max(this: string[]): Option<string>;
  min(this: number[]): Option<number>;
  min(this: bigint[]): Option<bigint>;
  min(this: string[]): Option<string>;
  product(this: number[], forceBigInt?: false): number;
  product(this: bigint[], forceBigInt?: false): bigint;
  product(this: Array<number | bigint>, forceBigInt?: true): bigint;
  sum(this: number[], forceBigInt?: false): number;
  sum(this: bigint[], forceBigInt?: false): bigint;
  sum(this: Array<number | bigint>, forceBigInt?: true): bigint;
}

// TODO: add `thisArg` to all methods that take a callback
