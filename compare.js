/*
-- Fat arrow
 */

[0, 1, 2].map((val) => (val * val))

/*
-- Class
 */

class Rectangle {
  constructor(width, height){
    this.width = width
    this.height = height
  }

  area(){
    return this.width * this.height
  }

  static area(){
    return new Rectangle(width, height).area()
  }
}

class Square extends Rectangle {
  constructor(side){
    super(side, side)
  }
}

/*
-- Object literals
 */

var shorthand = 'foo'
var obj = {
  shorthand, // short for shorthand: shorthand
  method(){
  },
  ['expr' + 'ession']: true
}

/*
-- Template strings
 */

`Hello ${name}`

/*
-- Destructured assignment
 */

var [a, b, c] = [1, 2, 3]

/*
-- Default arguments
 */

function f(a, b, c = 1){
  return a + b + c
}

/*
-- Splats
 */

function s(a, ...args){
  return a * args.length
}

s(1, ...[2, 3, 4, 5])

/*
-- Iteration
 */

for(var n of [1, 2, 3]){
  console.log(n)
}

for(var [i, n] of [1, 4, 9].entries()){
  console.log(i, n)
}

/*
-- let / const
 */

let funcs = []
for(var i of [1, 2, 3]){
  funcs.push(() => i) // binds i to function value (global)
}

for(let i of [1, 2, 3]){
  funcs.push(() => i) // binds i to block value
}

const K = 1
K = 2 // error

/*
-- generators
 */

function* range(n){
  for(let i = 0; i < n; i++){
    yield i
  }
}

for(let i of range(5)){
  console.log(i)
}

/*
-- modules
 */

import Ember from 'ember'
import { Route, Array as EmberArray } from 'ember'
import * as emberPackage from 'ember'

export class Awesome {
}

export default Awesome
