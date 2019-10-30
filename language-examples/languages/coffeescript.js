/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// 1. Example ----------------------------------

class Animal {
  constructor (name) {
    this.name = name
  }

  move (meters) {
    return alert(this.name + ` moved ${meters}m.`)
  }
}

class Snake extends Animal {
  move () {
    alert('Slithering...')
    return super.move(5)
  }
}

class Horse extends Animal {
  move () {
    alert('Galloping...')
    return super.move(45)
  }
}

const sam = new Snake('Sammy the Python')
const tom = new Horse('Tommy the Palomino')

sam.move()
tom.move()

// 2. Tests ----------------------------------

const $controls = $(`#${chartId}`)

// Assignment:
let number = 42
const opposite = true

// Conditions:
if (opposite) { number = -42 }

// Functions:
const square = x => x * x

// Arrays:
const list = [1, 2, 3, 4, 5]

// Objects:
const math = {
  root: Math.sqrt,
  square,
  cube (x) { return x * square(x) }
}

// Splats:
const race = (winner, ...runners) => print(winner, runners)

// Existence:
if (typeof elvis !== 'undefined' && elvis !== null) { alert('I knew it!') }

// Array comprehensions:
const cubes = (Array.from(list).map((num) => math.cube(num)))
