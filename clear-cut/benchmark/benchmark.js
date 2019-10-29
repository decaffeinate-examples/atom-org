/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { calculateSpecificity } = require('../index')

let count = 0

const calculate = function (selector) {
  count++
  calculateSpecificity(selector)
}

const benchmark = function (number) {
  for (const letter of Array.from('abcdefghijklmnopqrztuvwxyz0123456789')) {
    calculate(`a-custom-tag-${letter}`)
    calculate(`a-custom-tag-${letter}:last`)
    calculate(`a-custom-tag-${letter}[foo]`)
    calculate(`a-custom-tag-${letter}[foo=bar]`)
    calculate(`a-custom-tag-${letter}-${number}`)
    calculate(`a-custom-tag-${letter}:not(.ag${number})`)

    calculate(`a-custom-tag-${letter}, .a-class`)
    calculate(`a-custom-tag-${letter}-${number}, .a-class`)

    calculate(`a-custom-tag-${letter}.a-class`)
    calculate(`a-custom-tag-${letter}#an-id`)

    calculate(`body, a-custom-tag-${letter}`)
    calculate(`body, a-custom-tag-${letter}-${number}`)

    calculate(`body, a-custom-tag-${letter}.a-class`)
    calculate(`body, a-custom-tag-${letter}#an-id`)

    calculate(`body > a-custom-tag-${letter}`)
    calculate(`body > a-custom-tag-${letter}-${number}`)

    calculate(`body > a-custom-tag-${letter}.a-class`)
    calculate(`body > a-custom-tag-${letter}#an-id`)

    calculate(`.a-custom-class-${letter}`)
    calculate(`.a-custom-class-${letter}[foo]`)
    calculate(`.a-custom-class-${letter}[foo=bar]`)
    calculate(`.a-custom-class-${letter}:last`)
    calculate(`.a-custom-class-${letter}:not(.a{number})`)
    calculate(`.a-custom-class-${letter}-${number}`)

    calculate(`.a-custom-class-${letter}, body`)
    calculate(`.a-custom-class-${letter}-${number}, body`)

    calculate(`.a-custom-class-${letter}.a-class`)
    calculate(`.a-custom-class-${letter}#an-id`)

    calculate(`.a-class > .a-custom-class-${letter}`)
    calculate(`.a-class > .a-custom-class-${letter}.a-class`)
    calculate(`.a-class > .a-custom-class-${letter}#an-id`)

    calculate(`.a-class, .a-custom-class-${letter}`)
    calculate(`.a-class, .a-custom-class-${letter}.a-class`)
    calculate(`.a-class, .a-custom-class-${letter}#an-id`)

    calculate(`#a-custom-id-${letter}`)
    calculate(`#a-custom-id-${letter}[foo]`)
    calculate(`#a-custom-id-${letter}[foo=bar]`)
    calculate(`#a-custom-id-${letter}:last`)
    calculate(`#a-custom-id-${letter}:not(.a-${number})`)
    calculate(`#a-custom-id-${letter}.a-class`)

    calculate(`#an-id > #a-custom-id-${letter}`)
    calculate(`#an-id > #a-custom-id-${letter}.a-class`)

    calculate(`#an-id, #a-custom-id-${letter}`)
    calculate(`#an-id, #a-custom-id-${letter}.a-class`)
  }
}

const start = Date.now()
for (let index = 0; index <= 10; index++) { benchmark(index) }
console.log(`Calculated ${count} selector specificities in ${Date.now() - start}ms`)
