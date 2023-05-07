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

Array.prototype.startsWith = function <T = any>(this: Array<T>, ...other: T[]): boolean {
  return this.slice(0, other.length).every((v, i) => v === other[i]);
}

Array.prototype.endsWith = function <T = any>(this: Array<T>, ...other: T[]): boolean {
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
    if (predicate(this[i], i, this) && i !== this.length - 1) chunks.push([]);
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

Array.prototype.stripPrefix = function <T = any>(this: Array<T>, ...prefix: T[]): Option<T[]> {
  return this.startsWith(...prefix) ? Some(this.slice(prefix.length)) : None();
}

Array.prototype.stripSuffix = function <T = any>(this: Array<T>, ...suffix: T[]): Option<T[]> {
  return this.endsWith(...suffix) ? Some(this.slice(0, -suffix.length)) : None();
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
  /**
   * Moves all elements from `other` into `self`, leaving `other` empty.
   * @param other The array to append to `self`.
   * @returns `self` after the append operation.
   * @example
   * const arr_a = [1, 2, 3];
   * const arr_b = [4, 5, 6];
   * 
   * arr_a.append(arr_b);
   * 
   * console.assert(arr_a.length === 6);
   * console.assert(arr_b.length === 0);
   */
  append<U = T>(other: U[]): Array<T | U>;

  /**
   * Clears the array, removing all values.
   * @example
   * const arr = [1, 2, 3];
   * 
   * arr.clear();
   * 
   * console.assert(arr.isEmpty() === true);
   */
  clear(): void;

  /**
   * Removes consecutive repeated elements in the array. If the array is sorted, this will remove all duplicates.
   * @example
   * const arr = [1, 2, 2, 3, 2];
   * 
   * arr.dedup(); // [1, 2, 3, 2]
   *  
   * console.assert(arr.length === 4);
   */
  dedup(): void;

  /**
   * Removes all but the first of consecutive elements in the array that satisfy a given equality predicate.
   * @param fn The equality predicate.
   * @example
   * const arr = [1, 2, 2, 3, 2];
   * 
   * arr.dedupBy((a, b) => a === b); // [1, 2, 3, 2]
   * 
   * console.assert(arr.length === 4);
   */
  dedupBy(fn: (a: T, b: T, index: number, self: T[]) => boolean): void;
  
  /**
   * Removes all but the first of consecutive elements in the array that map to the same key.
   * @param fn The key mapping function.
   * @example
   * const arr = [1, 2, 2, 3, 2];
   * 
   * arr.dedupByKey(a => Math.floor(a / 2)); // This will be mapped to [0, 1, 1, 1, 1] and deduped to [1, 2]
   * 
   * console.assert(arr.length === 2);
   * console.assert(arr[0] === 1);
   * console.assert(arr[1] === 2);
   */
  dedupByKey<U>(fn: (item: T, index: number, self: T[]) => U): void;

  /**
   * Removes every element in the array that satisfies a given predicate, returning the removed elements.
   * It's equivalent to `filter` method but `spliceFilter` mutates the array. Rust equivalent to this method is `drain_filter`.
   * @param predicate The predicate function.
   * @returns The removed elements.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const odds = arr.spliceFilter(a => a % 2 === 1); // Returns [1, 3, 5]
   * 
   * console.assert(arr.length === 2);
   * console.assert(odds.length === 3);
   */
  spliceFilter(predicate: (item: T, index: number, self: T[]) => boolean): T[]; // drain_filter
  
  /**
   * Checks if the array is truly empty.
   * @returns `true` if the array is empty, `false` otherwise.
   * @example
   * const arr_a = [1, 2, 3];
   * console.assert(arr_a.isEmpty() === false);
   * 
   * const arr_b = [];
   * console.assert(arr_b.isEmpty() === true);
   * 
   * const arr_c = Array(10);
   * console.assert(arr_c.isEmpty() === true);
   */
  isEmpty(): boolean;
  
  /**
   * Counts the number of elements in the array.
   * @returns True number of elements in the array.
   * @example
   * const arr_a = [1, 2, 3];
   * console.assert(arr_a.len() === 3);
   * 
   * const arr_b = [];
   * console.assert(arr_b.len() === 0);
   * 
   * const arr_c = Array(10);
   * console.assert(arr_c.len() === 0);
   */
  len(): number;
  
  /**
   * Retains only the elements specified by the predicate. In other words, remove all elements `e` such that `predicate(e)` returns `false`.
   * @param predicate The predicate function.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * arr.retain(a => a % 2 === 0); // [2, 4]
   * 
   * console.assert(arr.length === 2);
   * 
   * // Since the method calls the predicate once for each element, you can use external variables to keep track of state.
   * const keep = [true, false, true, false, true];
   * const arr_2 = [1, 2, 3, 4, 5];
   * 
   * arr_2.retain(keep); // [1, 3, 5]
   * 
   * console.assert(arr_2.length === 3);
   */
  retain(predicate: (item: T, index: number, self: T[]) => boolean): void;

  /**
   * Retains only the elements whose corresponding index in the provided array is `true`. In other words, remove all elements `e` such that `list[i]` is `false`.
   * @param list The boolean array.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * arr.retain([true, false, true, false, true]); // [1, 3, 5]
   * 
   * console.assert(arr.length === 3);
   * 
   * // Eventually, you can use the provided predicate method to decide which elements should be retained.
   * const arr_2 = [1, 2, 3, 4, 5];
   * 
   * arr_2.retain(a => a % 2 === 0); // [2, 4]
   * 
   * console.assert(arr_2.length === 2);
   */
  retain(list: boolean[]): void;
  
  /**
   * Splits the array into chunks of the given size.
   * @param size The size of each chunk.
   * @returns The array of chunks.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const chunks = arr.chunks(2);
   * chunks.forEach(chunk => console.log(chunk)); // [1, 2], [3, 4], [5]
   */
  chunks(size: number): T[][];
  
  /**
   * Tests if the array starts with the given elements.
   * @param other The elements to test.
   * @returns `true` if the array starts with the given elements, `false` otherwise.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * console.assert(arr.startsWith(1, 2, 3) === true);
   * console.assert(arr.startsWith(1, 2, 4) === false);
   */
  startsWith(...other: T[]): boolean;

  /**
   * Tests if the array ends with the given elements.
   * @param other The elements to test.
   * @returns `true` if the array ends with the given elements, `false` otherwise.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * console.assert(arr.endsWith(3, 4, 5) === true);
   * console.assert(arr.endsWith(2, 4, 5) === false);
   */
  endsWith(...other: T[]): boolean;
  
  /**
   * Fills the array using the given function. Same as `fill` method,
   * but the function is called for each element, so it won't produce references.
   * @param fn The function to use.
   * @returns The filled array.
   * @example
   * const arr = Array(10);
   * arr[4] = 5;
   * 
   * arr.fillWith(() => 0);
   * arr.forEach(item => console.log(item)); // 0, 0, 0, 0, 5, 0, 0, 0, 0, 0
   * 
   * console.assert(arr.len() === 10);
   */
  fillWith<U = T>(fn: (index: number, self: T[]) => U): Array<T | U>;
  
  /**
   * Returns an `Option` containing the first element of the array, if any.
   * @returns `Option` of the first element of the array.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const first = arr.first();
   * console.assert(first.unwrap() === 1);
   * 
   * const empty = [].first();
   * console.assert(empty.isNone() === true);
   */
  first(): Option<T>;
  
  /**
   * Returns the array containing the groups determined by the given predicate.
   * @param predicate The predicate function.
   * @returns The array of groups.
   * @example
   * const arr = [1, 2, 2, 3, 4, 4, 4, 5];
   * 
   * const groups = arr.groupBy((a, b) => a !== b);
   * groups.forEach(group => console.log(group)); // [1, 2], [2, 3, 4], [4], [4, 5]
   */
  groupBy(predicate: (a: T, b: T, index: number, self: T[]) => boolean): T[][];
  
  /**
   * Returns an `Option` containing the last element of the array, if any.
   * @returns `Option` of the last element of the array.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const last = arr.last();
   * console.assert(last.unwrap() === 5);
   * 
   * const empty = [].last();
   * console.assert(empty.isNone() === true);
   */
  last(): Option<T>;
  
  /**
   * Splits the array into chunks of the given size, starting from the end.
   * @param size The size of each chunk.
   * @returns The array of chunks.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const chunks = arr.rchunks(2);
   * chunks.forEach(chunk => console.log(chunk)); // [4, 5], [2, 3], [1]
   */
  rchunks(size: number): T[][];
  
  /**
   * Repeat the array n times.
   * @param times The number of times to repeat the array.
   * @returns The repeated array.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const repeated = arr.repeat(3);
   * 
   * console.assert(repeated.len() === 9);
   */
  repeat(times: number): T[];
  
  /**
   * Rotates the array in-place such that the first `mid` elements of the array move to the end
   * while the last `this.length - mid` elements move to the front.
   * After calling `rotateLeft`, the element previously at index `mid` will become the first element in the array.
   * @param mid The index of where to start the rotation.
   * @returns The rotated array.
   * @example
   * const arr = ["a", "b", "c", "d", "e", "f"];
   * 
   * const rotated = arr.rotateLeft(2);
   * console.log(rotated); // ["c", "d", "e", "f", "a", "b"]
   */
  rotateLeft(mid: number): T[];
  
  /**
   * Rotates the array in-place such that the first `this.length - mid`
   * elements of the array move to the end while the last `mid` elements move to the front.
   * After calling rotateRight, the element previously at index `this.length - mid`
   * will become the first element in the array.
   * @param mid The index of where to start the rotation.
   * @returns The rotated array.
   * @example
   * const arr = ["a", "b", "c", "d", "e", "f"];
   * 
   * const rotated = arr.rotateRight(2);
   * console.log(rotated); // ["e", "f", "a", "b", "c", "d"]
   */
  rotateRight(mid: number): T[];

  /**
   * Splits the array at index determined by the given predicate, starting from the end.
   * @param predicate The predicate function.
   * @returns The array of splits.
   * @example
   * const arr = [11, 22, 33, 0, 44, 55];
   * 
   * const splits = arr.rsplit(item => item === 0);
   * splits.forEach(split => console.log(split)); // [44, 55], [11, 22, 33]
   */
  rsplit(predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  
  /**
   * Splits the array at index determined by the given predicate, starting from the end, returning at most `n` splits.
   * @param n The maximum number of splits.
   * @param predicate The predicate function.
   * @returns The array of splits.
   * @example
   * const arr = [10, 40, 30, 20, 60, 50];
   * 
   * const splits = arr.rsplitn(2, item => item % 3 === 0);
   * splits.forEach(split => console.log(split)); // [50], [10, 40, 30, 20]
   */
  rsplitn(n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  
  /**
   * Splits the array at index determined by the given predicate.
   * @param predicate The predicate function.
   * @returns The array of splits.
   * @example
   * const arr = [10, 40, 33, 20];
   * 
   * const splits = arr.split(item => item % 3 === 0);
   * splits.forEach(split => console.log(split)); // [10, 40], [20]
   */
  split(predicate: (item: T, index: number, self: T[]) => boolean, inclusive?: boolean): T[][];
  
  /**
   * Splits the array into two at the given index.
   * @param n The index to split at.
   * @returns Two parts of the array.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const [left, right] = arr.splitAt(2);
   * console.log(left); // [1, 2]
   * console.log(right); // [3, 4, 5]
   */
  splitAt(n: number): [T[], T[]];
  
  /**
   * Returns the first and the rest of the elements of the array, or `None` if it is empty.
   * @returns First and the rest
   * @example
   * const arr = [1, 2, 3];
   * 
   * const [first, rest] = arr.splitFirst().unwrap();
   * console.log(first); // 1
   * console.log(rest); // [2, 3]
   * 
   * const empty: number[] = [];
   * console.assert(empty.splitFirst().isNone() === true);
   */
  splitFirst(): Option<[T, T[]]>;
  
  /**
   * Splits the array at index determined by the given predicate.
   * The item that matches the predicate is included in the left split.
   * @param predicate The predicate function.
   * @returns The array of splits.
   * @example
   * const arr = [10, 40, 33, 20];
   * 
   * const splits = arr.splitInclusive(item => item % 3 === 0);
   * splits.forEach(split => console.log(split)); // [10, 40, 33], [20]
   */
  splitInclusive(predicate: (item: T, index: number, self: T[]) => boolean): T[][];

  /**
   * Returns the last and the rest of the elements of the array, or `None` if it is empty.
   * @returns Last and the rest
   * @example
   * const arr = [1, 2, 3];
   * 
   * const [last, rest] = arr.splitLast().unwrap();
   * console.log(last); // 3
   * console.log(rest); // [1, 2]
   */
  splitLast(predicate: (item: T, index: number, self: T[]) => boolean): Option<[T, T[]]>;
  
  /**
   * Splits the array at index determined by the given predicate, returning at most `n` splits.
   * @param n The maximum number of splits.
   * @param predicate The predicate function.
   * @returns The array of splits.
   * @example
   * const arr = [10, 40, 30, 20, 60, 50];
   * 
   * const splits = arr.splitn(2, item => item % 3 === 0);
   * splits.forEach(split => console.log(split)); // [10, 40], [20, 60, 50]
   */
  splitn(n: number, predicate: (item: T, index: number, self: T[]) => boolean): T[][];
  
  /**
   * Strips the prefix from the array, and returns remaining items if successful, otherwise returns `None`.
   * @param prefix The prefix to strip.
   * @returns The remaining items.
   * @example
   * const arr = [10, 40, 60];
   * 
   * const remaining = arr.stripPrefix(10, 40).unwrap();
   * console.assert(remaining.length === 1);
   * 
   * const none = arr.stripPrefix(10, 20);
   * console.assert(none.isNone() === true);
   */
  stripPrefix(...prefix: T[]): Option<T[]>;
  
  /**
   * Strips the suffix from the array, and returns remaining items if successful, otherwise returns `None`.
   * @param suffix The suffix to strip.
   * @returns The remaining items.
   * @example
   * const arr = [10, 40, 60];
   * 
   * const remaining = arr.stripSuffix(40, 60).unwrap();
   * console.assert(remaining.length === 1);
   * 
   * const none = arr.stripSuffix(10, 20);
   * console.assert(none.isNone() === true);
   */
  stripSuffix(...suffix: T[]): Option<T[]>;
  
  /**
   * Swaps two elements in the array.
   * @param a The index of the first element.
   * @param b The index of the second element.
   * @example
   * const arr = ["a", "b", "c", "d", "e"];
   * 
   * arr.swap(2, 4);
   * console.log(arr); // ["a", "b", "e", "d", "c"]
   */
  swap(a: number, b: number): void;
  
  /**
   * Returns an array over all contiguous windows of length `size`. The windows overlap.
   * If the array is shorter than `size`, the method returns empty array.
   * @param size The size of the windows.
   * @returns The array of windows.
   * @example
   * const arr = [1, 2, 3, 4, 5];
   * 
   * const windows = arr.windows(3);
   * windows.forEach(window => console.log(window)); // [1, 2, 3], [2, 3, 4], [3, 4, 5]
   */
  windows(size: number): T[][];
  
  /**
   * Creates an iterator that cycles through the array endlessly.
   * @returns The iterator.
   * @example
   * const arr = [1, 2, 3];
   * 
   * for (const item of arr.cycle()) {
   *   console.log(item); // 1, 2, 3, 1, 2, 3, ...
   * }
   */
  cycle(): Generator<T, void, unknown>;
  
  /**
   * Returns an array which gives the current iteration count as well as the next value.
   * @returns The array of tuples.
   * @example
   * const arr = ["a", "b", "c"];
   * 
   * for (const [index, item] of arr.enumerate()) {
   *   console.log(index, item); // 0 "a", 1 "b", 2 "c"
   * }
   */
  enumerate(): [number, T][];
  
  /**
   * Returns the reversed array, without mutating `self`.
   * @returns The reversed array.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const reversed = arr.rev();
   * console.log(reversed); // [3, 2, 1]
   * console.log(arr); // [1, 2, 3]
   */
  rev(): T[];
  
  /**
   * Zips `self` with another array, returning an array of tuples. When the lengths are unequal,
   * shorter length is used causing the longer array to be truncated.
   * @param other The other array.
   * @returns The array of tuples.
   * @example
   * const arr1 = [1, 2, 3];
   * const arr2 = ["a", "b", "c"];
   * 
   * const zipped = arr1.zip(arr2);
   * 
   * for (const [a, b] of zipped) {
   *   console.log(a, b); // 1 "a", 2 "b", 3 "c"
   * }
   */
  zip<U>(other: U[]): [T, U][];
  
  /**
   * Unzips an array of tuples into two arrays.
   * @returns The tuple of two unzipped arrays.
   * @example
   * const arr = [[1, "a"], [2, "b"], [3, "c"]];
   * 
   * const [nums, letters] = arr.unzip();
   * console.log(nums); // [1, 2, 3]
   * console.log(letters); // ["a", "b", "c"]
   */
  unzip<T, U>(this: [T, U][]): [T[], U[]];
  
  /**
   * Inserts an separator between each element of the array.
   * @param separator The separator to insert.
   * @returns The array with separators.
   * @example
   * const arr = ["a", "b", "c"];
   * 
   * const interspersed = arr.intersperse(100);
   * console.log(interspersed); // ["a", 100, "b", 100, "c"]
   */
  intersperse<U = T>(separator: U): Array<T | U>;
  
  /**
   * Inserts an separator between each element of the array, using a callback to generate the separator.
   * @param fn The callback to generate the separator.
   * @returns The array with separators.
   * @example
   * const arr = ["a", "b", "c"];
   * 
   * const interspersed = arr.intersperseWith((_, index) => (index + 1) * 100);
   * console.log(interspersed); // ["a", 100, "b", 200, "c"]
   */
  intersperseWith<U>(fn: (item: T, index: number, self: T[]) => U): Array<T | U>;
  
  /**
   * Returns the highest value in the array.
   * @returns The highest value.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const max = arr.max().unwrap();
   * console.assert(max === 3);
   * 
   * const empty = [].max();
   * console.assert(empty.isNone() === true);
   */
  max(this: number[]): Option<number>;
  
  /**
   * Returns the highest value in the array.
   * @returns The highest value.
   * @example
   * const arr = [1n, 2n, 3n];
   * 
   * const max = arr.max().unwrap();
   * console.assert(max === 3n);
   * 
   * const empty = [].max();
   * console.assert(empty.isNone() === true);
   */
  max(this: bigint[]): Option<bigint>;
  
  /**
   * Returns the highest value in the array.
   * @returns The highest value.
   * @example
   * const arr = ["a", "bb", "ccc"];
   * 
   * const max = arr.max().unwrap();
   * console.assert(max === "ccc");
   * 
   * const empty = [].max();
   * console.assert(empty.isNone() === true);
   */
  max(this: string[]): Option<string>;
  
  /**
   * Returns the lowest value in the array.
   * @returns The lowest value.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const min = arr.min().unwrap();
   * console.assert(min === 1);
   * 
   * const empty = [].min();
   * console.assert(empty.isNone() === true);
   */
  min(this: number[]): Option<number>;
  
  /**
   * Returns the lowest value in the array.
   * @returns The lowest value.
   * @example
   * const arr = [1n, 2n, 3n];
   * 
   * const min = arr.min().unwrap();
   * console.assert(min === 1n);
   * 
   * const empty = [].min();
   * console.assert(empty.isNone() === true);
   */
  min(this: bigint[]): Option<bigint>;
  
  /**
   * Returns the lowest value in the array.
   * @returns The lowest value.
   * @example
   * const arr = ["a", "bb", "ccc"];
   * 
   * const min = arr.min().unwrap();
   * console.assert(min === "a");
   * 
   * const empty = [].min();
   * console.assert(empty.isNone() === true);
   */
  min(this: string[]): Option<string>;
  
  /**
   * Multiplies all values in the array together.
   * If the array is empty, `1` is returned even if type annotations would suggest otherwise.
   * To prevent this, use `product(true)` to force the result to be a `bigint`.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The product.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const product = arr.product();
   * 
   * console.assert(product === 6);
   */
  product(this: number[], forceBigInt?: false): number;

  /**
   * Multiplies all values in the array together.
   * If the array is empty, `1` is returned even if type annotations would suggest otherwise.
   * To prevent this, use `product(true)` to force the result to be a `bigint`.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The product.
   * @example
   * const arr = [1n, 2n, 3n];
   * 
   * const product = arr.product();
   * console.assert(product === 6n);
   * 
   * const empty_arr: bigint[] = [];
   * const empty_product = empty_arr.product();
   * console.assert(empty_product === 1);
   * 
   * const empty_product_bigint = empty_arr.product(true);
   * console.assert(empty_product_bigint === 1n);
   */
  product(this: bigint[], forceBigInt?: false): bigint;
  
  /**
   * Multiplies all values in the array together.
   * If the array is empty, `1` is returned even if type annotations would suggest otherwise.
   * To prevent this, use `product(true)` to force the result to be a `bigint`.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The product.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const product = arr.product(true);
   * console.assert(product === 6n);
   * 
   * const empty_arr: bigint[] = [];
   * const empty_product = empty_arr.product();
   * console.assert(empty_product === 1);
   * 
   * const empty_product_bigint = empty_arr.product(true);
   * console.assert(empty_product_bigint === 1n);
   */
  product(this: Array<number | bigint>, forceBigInt?: true): bigint;
  
  /**
   * Returns the sum of all values in the array.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The sum.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const sum = arr.sum();
   * 
   * console.assert(sum === 6);
   */
  sum(this: number[], forceBigInt?: false): number;
  
  /**
   * Returns the sum of all values in the array.
   * If the array is empty, `0` is returned even if type annotations would suggest otherwise.
   * To prevent this, use `sum(true)` to force the result to be a `bigint`.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The sum.
   * @example
   * const arr = [1n, 2n, 3n];
   * 
   * const sum = arr.sum();
   * console.assert(sum === 6n);
   * 
   * const empty_arr: bigint[] = [];
   * const empty_sum = empty_arr.sum();
   * console.assert(empty_sum === 0);
   * 
   * const empty_sum_bigint = empty_arr.sum(true);
   * console.assert(empty_sum_bigint === 0n);
   */
  sum(this: bigint[], forceBigInt?: false): bigint;
  
  /**
   * Returns the sum of all values in the array.
   * If the array is empty, `0` is returned even if type annotations would suggest otherwise.
   * To prevent this, use `sum(true)` to force the result to be a `bigint`.
   * @param forceBigInt Whether to force the result to be a `bigint`.
   * @returns The sum.
   * @example
   * const arr = [1, 2, 3];
   * 
   * const sum = arr.sum(true);
   * console.assert(sum === 6n);
   * 
   * const empty_arr: bigint[] = [];
   * const empty_sum = empty_arr.sum();
   * console.assert(empty_sum === 0);
   * 
   * const empty_sum_bigint = empty_arr.sum(true);
   * console.assert(empty_sum_bigint === 0n);
   */
  sum(this: Array<number | bigint>, forceBigInt?: true): bigint;
}
// TODO: add `thisArg` to all methods that take a callback
