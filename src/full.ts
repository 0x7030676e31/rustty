import "./index";
import "./iter";

const arr = [1, 2, 3]

console.log(arr.intersperseWith((_, i) => (i + 1) * 100));