# rustty

**rustty** is a JavaScript/TypeScript library that brings the Rust programming language's Result and Option types to the world of JavaScript.

The purpose of this library is to provide JavaScript developers with a way to handle errors and nullable values in a more elegant and type-safe manner, inspired by the Rust language's powerful **Result** and **Option** types.

## Installation

```bash
npm install rustty
```

## Usage
Once you've installed **rustty**, you can import it into your project like this:

```ts
import "rustty";
```

After that, the global objects **Ok**, **Err**, **Some**, and **None** will be available for use in your code. The **Result** and **Option** types are also available as global types.

## Result
A **Result** type represents either a success with a value of type *T* or a failure with an error of type *E*.

Here's an example of how to use the Result type in TypeScript:

```ts
function divide(x: number, y: number): Result<number, string> {
  if (y === 0) {
    return Err("division by zero");
  } else {
    return Ok(x / y);
  }
}

const result = divide(6, 3);
if (result.isOk()) {
  console.log("The result is", result.unwrap());
} else {
  console.log("There was an error:", result.unwrapErr());
}

```
In this example, the **divide** function returns an **Ok** value if the division succeeds, and an **Err** value if the division fails (i.e., if the second argument is zero). We can then use the **isOk** and **unwrap** methods to extract the value from the **Ok** result, or the **unwrapErr** method to extract the error from the **Err** result.

Note that all of the methods of **Result** have been camelCased, so instead of  **unwrap_or**, use **unwrapOr**.

For more information on how to use the **Result** type, see the [official Rust documentation](https://doc.rust-lang.org/std/result/).

## Option
An **Option** type represents a value that may or may not be present. It can be either **Some(value)** or **None**.

Here's an example of how to use the Option type in TypeScript:

```ts
function divide(x: number, y: number): Option<number> {
  if (y === 0) {
    return None();
  } else {
    return Some(x / y);
  }
}

const result = divide(6, 3);
if (result.isSome()) {
  console.log("The result is", result.unwrap());
} else {
  console.log("The result is null or undefined");
}
```

In this example, the **divide** function returns a **Some** value if the division succeeds, and a **None** value if the division fails (i.e., if the second argument is zero). We can then use the **isSome** and **unwrap** methods to extract the value from the **Some** result, or handle the case where the result is **None**.

For more information on how to use the **Option** type, see the [official Rust documentation](https://doc.rust-lang.org/std/option/).

There are also method called **into** on both **Result** and **Option**. This method allows you change the type of the value inside the **Result** or **Option**. Only usefull if you are using TypeScript.

## Credits
This library was inspired by the powerful **Result** and **Option** types in the Rust programming language. For more information on Rust, see the [official Rust website](https://www.rust-lang.org/).
