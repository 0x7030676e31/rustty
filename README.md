# Rustty

**Rustty** is a library that brings various data structures and algorithms such as iconic **Result** and **Option** from the Rust standard library to the JavaScript world.

---

If you like this project, please consider leaving a star on the [GitHub repository](https://github.com/0x7030676e31/rustty) ✨

## Installation

```bash
npm install rustty
```

## Usage

You can either import the whole library or just the **Result** and **Option** types.

```js
import "rustty";
```
Will import only the **Result** and **Option** types.
On the other hand, if you want to import the whole library, you can do by using the following statement:

```js
import "rustty/full";
```
Note that using the full version will add a lot of methods to the prototypes of the built-in types such as **Array**.

## Examples
### Using Result and Option 

```ts
import "rustty";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Err("Division by zero");
  }

  return Ok(a / b);
}

const result = divide(10, 5); // Ok(2)

console.assert(result.isOk() === true); 
console.assert(result.unwrap() === 2);

const failed = divide(10, 0); // Err("Division by zero")

console.assert(failed.isErr() === true);
console.assert(failed.unwrapErr() === "Division by zero");

// Alternatively, you can use Option type to indicate that the result may be null or undefined

function divide(a: number, b: number): Option<number> {
  if (b === 0) {
    return None;
  }

  return Some(a / b);
}

const result = divide(10, 5).unwrap(); // 2
const failed = divide(10, 0).unwrap(); // Throws an error
```

### Using additional methods

```ts
import "rustty/full";

const arr = [1, 2, 3, 4, 5];

// Swap elements at indices 0 and 4
arr.swap(0, 4);

arr.windows(2).forEach(window => {
  console.log(window); // [5, 2], [2, 3], [3, 4], [4, 1]
});

console.assert(arr.sum() === 15);
console.assert(arr.product() === 120);

arr.swap(0, 4);

arr
  .groupBy((a, b) => Math.round(a / 2) === Math.round(b / 2))
  .forEach(group => console.log(group)); // [1, 2], [3, 4], [5]

console.assert(arr.max() === 5);
console.assert(arr.min() === 1);
```

## Features
Note that every name has been changed to camelCase to be consistent with the JavaScript naming convention.

- [✅] Result with most of its methods (Global scope)
- [✅] Option with most of its methods (Global scope)
- [✅] Most of the methods from Vec (Array) (drain_filter -> spliceFilter)
- [✅] Most of the methods from Slice (Array)
- [✅] Most of the methods from Iterator (Array)
- [❌] Most of the methods from String
- [❌] Most of the methods from HashMap
- [❌] Most of the methods from HashSet
- [❌] Most of the methods from Numbers

If you can't find a method that you need, feel free to open an issue or a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details