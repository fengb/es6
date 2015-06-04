# Generator

Generators are a new type of function that:

* suspends its own execution
* `yield` a value whenever it is suspended
* can be resumed at a later time
* can be sent a message while resuming
* can terminate itself with `return`

## Examples

### Basic

```javascript
function* gc(){ // the * marks it as a generator
  yield 1
  yield 2
  return 3
}

let gen = gc() // create a generator object
gen.next()     // => { value: 1, done: false }
gen.next()     // => { value: 2, done: false }
gen.next()     // => { value: 3, done: true }

function* echo(){
  while(true){
    let msg = yield  // assign resume message
    if(msg === undefined){
      return
    }

    console.log(msg)
  }
}

gen = echo()
gen.next()      // executes up to the first yield, so nothing really happens
gen.next('foo') // => foo
gen.next(1)     // => 1
gen.next({})    // => [object Object]
gen.next()      // terminates
```

![vaguely useful lifecycle diagram](https://github.com/fengb/es6/blob/master/generator/lifecycle.png?raw=true)

### Iterators

![iterator](https://github.com/fengb/es6/blob/master/generator/iterator.png?raw=true)
[example](https://github.com/fengb/es6/blob/master/generator/iterator.js)

### async-await

![async-await](https://github.com/fengb/es6/blob/master/generator/async-await.png?raw=true)
[example](https://github.com/fengb/es6/blob/master/generator/async-await.js)
