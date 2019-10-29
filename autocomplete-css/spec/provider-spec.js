/** @babel */
/* eslint-disable
    no-multi-str,
    no-return-assign,
    no-template-curly-in-string,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const packagesToTest = {
  CSS: {
    name: 'language-css',
    file: 'test.css'
  },
  SCSS: {
    name: 'language-sass',
    file: 'test.scss'
  },
  Less: {
    name: 'language-less',
    file: 'test.less'
  },
  PostCSS: {
    name: 'language-postcss',
    file: 'test.postcss'
  }
}

Object.keys(packagesToTest).forEach(function (packageLabel) {
  if (!atom.packages.getAvailablePackageNames().includes(packagesToTest[packageLabel].name)) {
    console.warn(`Skipping tests for ${packageLabel} because it is not installed`)
    return delete packagesToTest[packageLabel]
  }
})

describe('CSS property name and value autocompletions', function () {
  let [editor, provider] = Array.from([])

  const getCompletions = function (options) {
    if (options == null) { options = {} }
    const cursor = editor.getLastCursor()
    const start = cursor.getBeginningOfCurrentWordBufferPosition()
    const end = cursor.getBufferPosition()
    const prefix = editor.getTextInRange([start, end])
    const request = {
      editor,
      bufferPosition: end,
      scopeDescriptor: cursor.getScopeDescriptor(),
      prefix,
      activatedManually: options.activatedManually != null ? options.activatedManually : true
    }
    return provider.getSuggestions(request)
  }

  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage('autocomplete-css'))
    waitsForPromise(() => atom.packages.activatePackage('language-css')) // Used in all CSS languages

    runs(() => provider = atom.packages.getActivePackage('autocomplete-css').mainModule.getProvider())

    return waitsFor(() => Object.keys(provider.properties).length > 0)
  })

  Object.keys(packagesToTest).forEach(packageLabel => describe(`${packageLabel} files`, function () {
    beforeEach(function () {
      waitsForPromise(() => atom.packages.activatePackage(packagesToTest[packageLabel].name))
      waitsForPromise(() => atom.workspace.open(packagesToTest[packageLabel].file))
      return runs(() => editor = atom.workspace.getActiveTextEditor())
    })

    it('returns tag completions when not in a property list', function () {
      editor.setText('')
      expect(getCompletions()).toBe(null)

      editor.setText('d')
      editor.setCursorBufferPosition([0, 0])
      expect(getCompletions()).toBe(null)

      editor.setCursorBufferPosition([0, 1])
      const completions = getCompletions()
      expect(completions).toHaveLength(9)
      return (() => {
        const result = []
        for (const completion of Array.from(completions)) {
          expect(completion.text.length).toBeGreaterThan(0)
          result.push(expect(completion.type).toBe('tag'))
        }
        return result
      })()
    })

    it('autocompletes property names without a prefix when activated manually', function () {
      editor.setText(`\
body {

}\
`
      )
      editor.setCursorBufferPosition([1, 0])
      const completions = getCompletions({ activatedManually: true })
      expect(completions.length).toBe(237)
      return (() => {
        const result = []
        for (const completion of Array.from(completions)) {
          expect(completion.text.length).toBeGreaterThan(0)
          expect(completion.type).toBe('property')
          result.push(expect(completion.descriptionMoreURL.length).toBeGreaterThan(0))
        }
        return result
      })()
    })

    it('does not autocomplete property names without a prefix when not activated manually', function () {
      editor.setText(`\
body {

}\
`
      )
      editor.setCursorBufferPosition([1, 0])
      const completions = getCompletions({ activatedManually: false })
      return expect(completions).toEqual([])
    })

    it('autocompletes property names with a prefix', function () {
      editor.setText(`\
body {
d
}\
`
      )
      editor.setCursorBufferPosition([1, 3])
      let completions = getCompletions()
      expect(completions[0].text).toBe('display: ')
      expect(completions[0].displayText).toBe('display')
      expect(completions[0].type).toBe('property')
      expect(completions[0].replacementPrefix).toBe('d')
      expect(completions[0].description.length).toBeGreaterThan(0)
      expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      expect(completions[1].text).toBe('direction: ')
      expect(completions[1].displayText).toBe('direction')
      expect(completions[1].type).toBe('property')
      expect(completions[1].replacementPrefix).toBe('d')

      editor.setText(`\
body {
D
}\
`
      )
      editor.setCursorBufferPosition([1, 3])
      completions = getCompletions()
      expect(completions.length).toBe(2)
      expect(completions[0].text).toBe('display: ')
      expect(completions[1].text).toBe('direction: ')
      expect(completions[1].replacementPrefix).toBe('D')

      editor.setText(`\
body {
d:
}\
`
      )
      editor.setCursorBufferPosition([1, 3])
      completions = getCompletions()
      expect(completions[0].text).toBe('display: ')
      expect(completions[1].text).toBe('direction: ')

      editor.setText(`\
body {
bord
}\
`
      )
      editor.setCursorBufferPosition([1, 6])
      completions = getCompletions()
      expect(completions[0].text).toBe('border: ')
      expect(completions[0].displayText).toBe('border')
      return expect(completions[0].replacementPrefix).toBe('bord')
    })

    it('does not autocomplete when at a terminator', function () {
      editor.setText(`\
body {
.somemixin();
}\
`
      )
      editor.setCursorBufferPosition([1, 15])
      const completions = getCompletions()
      return expect(completions).toBe(null)
    })

    it('does not autocomplete property names when preceding a {', function () {
      editor.setText(`\
body,{
}\
`
      )
      editor.setCursorBufferPosition([0, 5])
      let completions = getCompletions()
      expect(completions).toBe(null)

      editor.setText('\
body,{}\
'
      )
      editor.setCursorBufferPosition([0, 5])
      completions = getCompletions()
      expect(completions).toBe(null)

      editor.setText(`\
body
{
}\
`
      )
      editor.setCursorBufferPosition([1, 0])
      completions = getCompletions()
      return expect(completions).toBe(null)
    })

    it('does not autocomplete property names when immediately after a }', function () {
      editor.setText('\
body{}\
'
      )
      editor.setCursorBufferPosition([0, 6])
      let completions = getCompletions()
      expect(completions).toBe(null)

      editor.setText(`\
body{
}\
`
      )
      editor.setCursorBufferPosition([1, 1])
      completions = getCompletions()
      return expect(completions).toBe(null)
    })

    it('autocompletes property names when the cursor is up against the punctuation inside the property list', function () {
      editor.setText(`\
body {
}\
`
      )
      editor.setCursorBufferPosition([0, 6])
      let completions = getCompletions()
      expect(completions[0].displayText).toBe('width')

      editor.setText(`\
body {
}\
`
      )
      editor.setCursorBufferPosition([1, 0])
      completions = getCompletions()
      expect(completions[0].displayText).toBe('width')

      editor.setText('\
body { }\
'
      )
      editor.setCursorBufferPosition([0, 6])
      completions = getCompletions()
      expect(completions[0].displayText).toBe('width')

      editor.setText('\
body { }\
'
      )
      editor.setCursorBufferPosition([0, 7])
      completions = getCompletions()
      return expect(completions[0].displayText).toBe('width')
    })

    it('triggers autocomplete when an property name has been inserted', function () {
      spyOn(atom.commands, 'dispatch')
      const suggestion = { type: 'property', text: 'whatever' }
      provider.onDidInsertSuggestion({ editor, suggestion })

      advanceClock(1)
      expect(atom.commands.dispatch).toHaveBeenCalled()

      const {
        args
      } = atom.commands.dispatch.mostRecentCall
      expect(args[0].tagName.toLowerCase()).toBe('atom-text-editor')
      return expect(args[1]).toBe('autocomplete-plus:activate')
    })

    it('autocompletes property values without a prefix', function () {
      let completion
      editor.setText(`\
body {
display:
}\
`
      )
      editor.setCursorBufferPosition([1, 10])
      let completions = getCompletions()
      expect(completions.length).toBe(24)
      for (completion of Array.from(completions)) {
        expect(completion.text.length).toBeGreaterThan(0)
        expect(completion.description.length).toBeGreaterThan(0)
        expect(completion.descriptionMoreURL.length).toBeGreaterThan(0)
      }

      editor.setText(`\
body {
display:

}\
`
      )
      editor.setCursorBufferPosition([2, 0])
      completions = getCompletions()
      expect(completions.length).toBe(24)
      return (() => {
        const result = []
        for (completion of Array.from(completions)) {
          result.push(expect(completion.text.length).toBeGreaterThan(0))
        }
        return result
      })()
    })

    it('autocompletes property values with a prefix', function () {
      editor.setText(`\
body {
display: i
}\
`
      )
      editor.setCursorBufferPosition([1, 12])
      let completions = getCompletions()
      expect(completions[0].text).toBe('inline;')
      expect(completions[0].description.length).toBeGreaterThan(0)
      expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      expect(completions[1].text).toBe('inline-block;')
      expect(completions[2].text).toBe('inline-flex;')
      expect(completions[3].text).toBe('inline-grid;')
      expect(completions[4].text).toBe('inline-table;')
      expect(completions[5].text).toBe('inherit;')

      editor.setText(`\
body {
display: I
}\
`
      )
      editor.setCursorBufferPosition([1, 12])
      completions = getCompletions()
      expect(completions.length).toBe(6)
      expect(completions[0].text).toBe('inline;')
      expect(completions[1].text).toBe('inline-block;')
      expect(completions[2].text).toBe('inline-flex;')
      expect(completions[3].text).toBe('inline-grid;')
      expect(completions[4].text).toBe('inline-table;')
      expect(completions[5].text).toBe('inherit;')

      editor.setText(`\
body {
display:
  i
}\
`
      )
      editor.setCursorBufferPosition([2, 5])
      completions = getCompletions()
      expect(completions[0].text).toBe('inline;')
      expect(completions[1].text).toBe('inline-block;')
      expect(completions[2].text).toBe('inline-flex;')
      expect(completions[3].text).toBe('inline-grid;')
      expect(completions[4].text).toBe('inline-table;')
      expect(completions[5].text).toBe('inherit;')

      editor.setText(`\
body {
text-align:
}\
`
      )
      editor.setCursorBufferPosition([1, 13])
      completions = getCompletions()
      expect(completions).toHaveLength(5)
      expect(completions[0].text).toBe('center;')
      expect(completions[1].text).toBe('left;')
      expect(completions[2].text).toBe('justify;')
      expect(completions[3].text).toBe('right;')
      expect(completions[4].text).toBe('inherit;')

      editor.setText(`\
body {
text-align: c
}\
`
      )
      editor.setCursorBufferPosition([1, 15])
      completions = getCompletions()
      expect(completions).toHaveLength(1)
      return expect(completions[0].text).toBe('center;')
    })

    it('does not complete property values after percentage signs', function () {
      editor.setText(`\
body {
width: 100%
}\
`
      )
      editor.setCursorBufferPosition([1, 13])
      const completions = getCompletions()
      return expect(completions).toHaveLength(0)
    })

    it("it doesn't add semicolon after a property if one is already present", function () {
      editor.setText(`\
body {
display: i;
}\
`
      )
      editor.setCursorBufferPosition([1, 12])
      const completions = getCompletions()
      return completions.forEach(completion => expect(completion.text).not.toMatch(/;\s*$/))
    })

    it('autocompletes inline property values', function () {
      editor.setText('body { display: }')
      editor.setCursorBufferPosition([0, 16])
      let completions = getCompletions()
      expect(completions).toHaveLength(24)
      expect(completions[0].text).toBe('block;')

      editor.setText(`\
body {
display: block; float:
}\
`
      )
      editor.setCursorBufferPosition([1, 24])
      completions = getCompletions()
      expect(completions).toHaveLength(4)
      return expect(completions[0].text).toBe('left;')
    })

    it('autocompletes more than one inline property value', function () {
      editor.setText('body { display: block; float: }')
      editor.setCursorBufferPosition([0, 30])
      let completions = getCompletions()
      expect(completions).toHaveLength(4)
      expect(completions[0].text).toBe('left;')

      editor.setText('body { display: block; float: left; cursor: alias; text-decoration: }')
      editor.setCursorBufferPosition([0, 68])
      completions = getCompletions()
      expect(completions).toHaveLength(5)
      return expect(completions[0].text).toBe('line-through;')
    })

    it('autocompletes inline property values with a prefix', function () {
      editor.setText('body { display: i }')
      editor.setCursorBufferPosition([0, 17])
      let completions = getCompletions()
      expect(completions).toHaveLength(6)
      expect(completions[0].text).toBe('inline;')
      expect(completions[1].text).toBe('inline-block;')
      expect(completions[2].text).toBe('inline-flex;')
      expect(completions[3].text).toBe('inline-grid;')
      expect(completions[4].text).toBe('inline-table;')
      expect(completions[5].text).toBe('inherit;')

      editor.setText('body { display: i}')
      editor.setCursorBufferPosition([0, 17])
      completions = getCompletions()
      expect(completions).toHaveLength(6)
      expect(completions[0].text).toBe('inline;')
      expect(completions[1].text).toBe('inline-block;')
      expect(completions[2].text).toBe('inline-flex;')
      expect(completions[3].text).toBe('inline-grid;')
      expect(completions[4].text).toBe('inline-table;')
      return expect(completions[5].text).toBe('inherit;')
    })

    it("autocompletes inline property values that aren't at the end of the line", function () {
      editor.setText('body { float: display: inline; font-weight: bold; }')
      editor.setCursorBufferPosition([0, 14]) // right before display
      const completions = getCompletions()
      expect(completions).toHaveLength(4)
      expect(completions[0].text).toBe('left;')
      expect(completions[1].text).toBe('right;')
      expect(completions[2].text).toBe('none;')
      return expect(completions[3].text).toBe('inherit;')
    })

    it('autocompletes !important in property-value scope', function () {
      editor.setText(`\
body {
display: inherit !im
}\
`
      )
      editor.setCursorBufferPosition([1, 22])
      const completions = getCompletions()

      let important = null
      for (const c of Array.from(completions)) {
        if (c.displayText === '!important') { important = c }
      }

      return expect(important.displayText).toBe('!important')
    })

    it('does not autocomplete !important in property-name scope', function () {
      editor.setText(`\
body {
!im
}\
`
      )
      editor.setCursorBufferPosition([1, 5])
      const completions = getCompletions()

      let important = null
      for (const c of Array.from(completions)) {
        if (c.displayText === '!important') { important = c }
      }

      return expect(important).toBe(null)
    })

    describe('tags', function () {
      it('autocompletes with a prefix', function () {
        editor.setText(`\
ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 2])
        let completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')
        expect(completions[0].type).toBe('tag')
        expect(completions[0].description).toBe('Selector for <canvas> elements')
        expect(completions[1].text).toBe('code')

        editor.setText(`\
canvas,ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 9])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')

        editor.setText(`\
canvas ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 9])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')

        editor.setText(`\
canvas, ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 10])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        return expect(completions[0].text).toBe('canvas')
      })

      return it('does not autocompletes when prefix is preceded by class or id char', function () {
        editor.setText(`\
.ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 3])
        let completions = getCompletions()
        expect(completions).toBe(null)

        editor.setText(`\
#ca {
}\
`
        )
        editor.setCursorBufferPosition([0, 3])
        completions = getCompletions()
        return expect(completions).toBe(null)
      })
    })

    return describe('pseudo selectors', function () {
      it('autocompletes without a prefix', function () {
        editor.setText(`\
div: {
}\
`
        )
        editor.setCursorBufferPosition([0, 4])
        const completions = getCompletions()
        expect(completions.length).toBe(43)
        return (() => {
          const result = []
          for (const completion of Array.from(completions)) {
            const text = (completion.text || completion.snippet)
            expect(text.length).toBeGreaterThan(0)
            result.push(expect(completion.type).toBe('pseudo-selector'))
          }
          return result
        })()
      })

      // TODO: Enable these tests when we can enable autocomplete and test the
      // entire path.
      xit('autocompletes with a prefix', function () {
        editor.setText(`\
div:f {
}\
`
        )
        editor.setCursorBufferPosition([0, 5])
        const completions = getCompletions()
        expect(completions.length).toBe(5)
        expect(completions[0].text).toBe(':first')
        expect(completions[0].type).toBe('pseudo-selector')
        expect(completions[0].description.length).toBeGreaterThan(0)
        return expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      })

      xit('autocompletes with arguments', function () {
        editor.setText(`\
div:nth {
}\
`
        )
        editor.setCursorBufferPosition([0, 7])
        const completions = getCompletions()
        expect(completions.length).toBe(4)
        expect(completions[0].snippet).toBe(':nth-child(${1:an+b})')
        expect(completions[0].type).toBe('pseudo-selector')
        expect(completions[0].description.length).toBeGreaterThan(0)
        return expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      })

      return xit('autocompletes when nothing precedes the colon', function () {
        editor.setText(`\
:f {
}\
`
        )
        editor.setCursorBufferPosition([0, 2])
        const completions = getCompletions()
        expect(completions.length).toBe(5)
        return expect(completions[0].text).toBe(':first')
      })
    })
  }))

  Object.keys(packagesToTest).forEach(function (packageLabel) {
    if (packagesToTest[packageLabel].name !== 'language-css') {
      return describe(`${packageLabel} files`, function () {
        beforeEach(function () {
          waitsForPromise(() => atom.packages.activatePackage(packagesToTest[packageLabel].name))
          waitsForPromise(() => atom.workspace.open(packagesToTest[packageLabel].file))
          return runs(() => editor = atom.workspace.getActiveTextEditor())
        })

        it('autocompletes tags and properties when nesting inside the property list', function () {
          editor.setText(`\
.ca {
  di
}\
`
          )
          editor.setCursorBufferPosition([1, 4])
          const completions = getCompletions()
          expect(completions[0].text).toBe('display: ')
          expect(completions[1].text).toBe('direction: ')
          return expect(completions[2].text).toBe('div')
        })

        // FIXME: This is an issue with the grammar. It thinks nested
        // pseudo-selectors are meta.property-value.scss/less
        xit('autocompletes pseudo selectors when nested in LESS and SCSS files', function () {
          editor.setText(`\
.some-class {
  .a:f
}\
`
          )
          editor.setCursorBufferPosition([1, 6])
          const completions = getCompletions()
          expect(completions.length).toBe(5)
          return expect(completions[0].text).toBe(':first')
        })

        it('does not show property names when in a class selector', function () {
          editor.setText(`\
body {
  .a
}\
`
          )
          editor.setCursorBufferPosition([1, 4])
          const completions = getCompletions()
          return expect(completions).toBe(null)
        })

        it('does not show property names when in an id selector', function () {
          editor.setText(`\
body {
  #a
}\
`
          )
          editor.setCursorBufferPosition([1, 4])
          const completions = getCompletions()
          return expect(completions).toBe(null)
        })

        it('does not show property names when in a parent selector', function () {
          editor.setText(`\
body {
  &
}\
`
          )
          editor.setCursorBufferPosition([1, 4])
          const completions = getCompletions()
          return expect(completions).toBe(null)
        })

        return it('does not show property names when in a parent selector with a prefix', function () {
          editor.setText(`\
body {
  &a
}\
`
          )
          editor.setCursorBufferPosition([1, 4])
          const completions = getCompletions()
          return expect(completions).toBe(null)
        })
      })
    }
  })

  return describe('SASS files', function () {
    beforeEach(function () {
      waitsForPromise(() => atom.packages.activatePackage('language-sass'))
      waitsForPromise(() => atom.workspace.open('test.sass'))
      return runs(() => editor = atom.workspace.getActiveTextEditor())
    })

    it('autocompletes property names with a prefix', function () {
      editor.setText(`\
body
  d\
`
      )
      editor.setCursorBufferPosition([1, 3])
      let completions = getCompletions()
      expect(completions[0].text).toBe('display: ')
      expect(completions[0].displayText).toBe('display')
      expect(completions[0].type).toBe('property')
      expect(completions[0].replacementPrefix).toBe('d')
      expect(completions[0].description.length).toBeGreaterThan(0)
      expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      expect(completions[1].text).toBe('direction: ')
      expect(completions[1].displayText).toBe('direction')
      expect(completions[1].type).toBe('property')
      expect(completions[1].replacementPrefix).toBe('d')

      editor.setText(`\
body
  D\
`
      )
      editor.setCursorBufferPosition([1, 3])
      completions = getCompletions()
      expect(completions.length).toBe(11)
      expect(completions[0].text).toBe('display: ')
      expect(completions[1].text).toBe('direction: ')
      expect(completions[1].replacementPrefix).toBe('D')

      editor.setText(`\
body
  d:\
`
      )
      editor.setCursorBufferPosition([1, 3])
      completions = getCompletions()
      expect(completions[0].text).toBe('display: ')
      expect(completions[1].text).toBe('direction: ')

      editor.setText(`\
body
  bord\
`
      )
      editor.setCursorBufferPosition([1, 6])
      completions = getCompletions()
      expect(completions[0].text).toBe('border: ')
      expect(completions[0].displayText).toBe('border')
      return expect(completions[0].replacementPrefix).toBe('bord')
    })

    it('triggers autocomplete when an property name has been inserted', function () {
      spyOn(atom.commands, 'dispatch')
      const suggestion = { type: 'property', text: 'whatever' }
      provider.onDidInsertSuggestion({ editor, suggestion })

      advanceClock(1)
      expect(atom.commands.dispatch).toHaveBeenCalled()

      const {
        args
      } = atom.commands.dispatch.mostRecentCall
      expect(args[0].tagName.toLowerCase()).toBe('atom-text-editor')
      return expect(args[1]).toBe('autocomplete-plus:activate')
    })

    it('autocompletes property values without a prefix', function () {
      let completion
      editor.setText(`\
body
  display:\
`
      )
      editor.setCursorBufferPosition([1, 10])
      let completions = getCompletions()
      expect(completions.length).toBe(24)
      for (completion of Array.from(completions)) {
        expect(completion.text.length).toBeGreaterThan(0)
        expect(completion.description.length).toBeGreaterThan(0)
        expect(completion.descriptionMoreURL.length).toBeGreaterThan(0)
      }

      editor.setText(`\
body
  display:\
`
      )
      editor.setCursorBufferPosition([2, 0])
      completions = getCompletions()
      expect(completions.length).toBe(24)
      return (() => {
        const result = []
        for (completion of Array.from(completions)) {
          result.push(expect(completion.text.length).toBeGreaterThan(0))
        }
        return result
      })()
    })

    it('autocompletes property values with a prefix', function () {
      editor.setText(`\
body
  display: i\
`
      )
      editor.setCursorBufferPosition([1, 12])
      let completions = getCompletions()
      expect(completions[0].text).toBe('inline')
      expect(completions[0].description.length).toBeGreaterThan(0)
      expect(completions[0].descriptionMoreURL.length).toBeGreaterThan(0)
      expect(completions[1].text).toBe('inline-block')
      expect(completions[2].text).toBe('inline-flex')
      expect(completions[3].text).toBe('inline-grid')
      expect(completions[4].text).toBe('inline-table')
      expect(completions[5].text).toBe('inherit')

      editor.setText(`\
body
  display: I\
`
      )
      editor.setCursorBufferPosition([1, 12])
      completions = getCompletions()
      expect(completions.length).toBe(6)
      expect(completions[0].text).toBe('inline')
      expect(completions[1].text).toBe('inline-block')
      expect(completions[2].text).toBe('inline-flex')
      expect(completions[3].text).toBe('inline-grid')
      expect(completions[4].text).toBe('inline-table')
      return expect(completions[5].text).toBe('inherit')
    })

    it('autocompletes !important in property-value scope', function () {
      editor.setText(`\
body
  display: inherit !im\
`
      )
      editor.setCursorBufferPosition([1, 22])
      const completions = getCompletions()

      let important = null
      for (const c of Array.from(completions)) {
        if (c.displayText === '!important') { important = c }
      }

      return expect(important.displayText).toBe('!important')
    })

    it('does not autocomplete when indented and prefix is not a char', function () {
      editor.setText(`\
body
  .\
`
      )
      editor.setCursorBufferPosition([1, 3])
      let completions = getCompletions({ activatedManually: false })
      expect(completions).toBe(null)

      editor.setText(`\
body
  #\
`
      )
      editor.setCursorBufferPosition([1, 3])
      completions = getCompletions({ activatedManually: false })
      expect(completions).toBe(null)

      editor.setText(`\
body
  .foo,\
`
      )
      editor.setCursorBufferPosition([1, 7])
      completions = getCompletions({ activatedManually: false })
      expect(completions).toBe(null)

      editor.setText(`\
body
  foo -\
`
      )
      editor.setCursorBufferPosition([1, 8])
      completions = getCompletions({ activatedManually: false })
      expect(completions).toBe(null)

      // As spaces at end of line will be removed, we'll test with a char
      // after the space and with the cursor before that char.
      editor.setCursorBufferPosition([1, 7])
      completions = getCompletions({ activatedManually: false })
      return expect(completions).toBe(null)
    })

    it('does not autocomplete when inside a nth-child selector', function () {
      editor.setText(`\
body
  &:nth-child(4\
`
      )
      editor.setCursorBufferPosition([1, 15])
      const completions = getCompletions({ activatedManually: false })
      return expect(completions).toBe(null)
    })

    it('autocompletes a property name with a dash', function () {
      editor.setText(`\
body
  border-\
`
      )
      editor.setCursorBufferPosition([1, 9])
      const completions = getCompletions({ activatedManually: false })
      expect(completions).not.toBe(null)

      expect(completions[0].text).toBe('border: ')
      expect(completions[0].displayText).toBe('border')
      expect(completions[0].replacementPrefix).toBe('border-')

      expect(completions[1].text).toBe('border-radius: ')
      expect(completions[1].displayText).toBe('border-radius')
      return expect(completions[1].replacementPrefix).toBe('border-')
    })

    it('does not autocomplete !important in property-name scope', function () {
      editor.setText(`\
body {
  !im
}\
`
      )
      editor.setCursorBufferPosition([1, 5])
      const completions = getCompletions()

      let important = null
      for (const c of Array.from(completions)) {
        if (c.displayText === '!important') { important = c }
      }

      return expect(important).toBe(null)
    })

    describe('tags', function () {
      it('autocompletes with a prefix', function () {
        editor.setText('\
ca\
'
        )
        editor.setCursorBufferPosition([0, 2])
        let completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')
        expect(completions[0].type).toBe('tag')
        expect(completions[0].description).toBe('Selector for <canvas> elements')
        expect(completions[1].text).toBe('code')

        editor.setText('\
canvas,ca\
'
        )
        editor.setCursorBufferPosition([0, 9])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')

        editor.setText('\
canvas ca\
'
        )
        editor.setCursorBufferPosition([0, 9])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        expect(completions[0].text).toBe('canvas')

        editor.setText('\
canvas, ca\
'
        )
        editor.setCursorBufferPosition([0, 10])
        completions = getCompletions()
        expect(completions.length).toBe(7)
        return expect(completions[0].text).toBe('canvas')
      })

      return it('does not autocomplete when prefix is preceded by class or id char', function () {
        editor.setText('\
.ca\
'
        )
        editor.setCursorBufferPosition([0, 3])
        let completions = getCompletions()
        expect(completions).toBe(null)

        editor.setText('\
#ca\
'
        )
        editor.setCursorBufferPosition([0, 3])
        completions = getCompletions()
        return expect(completions).toBe(null)
      })
    })

    return describe('pseudo selectors', () => it('autocompletes without a prefix', function () {
      editor.setText('\
div:\
'
      )
      editor.setCursorBufferPosition([0, 4])
      const completions = getCompletions()
      expect(completions.length).toBe(43)
      return (() => {
        const result = []
        for (const completion of Array.from(completions)) {
          const text = (completion.text || completion.snippet)
          expect(text.length).toBeGreaterThan(0)
          result.push(expect(completion.type).toBe('pseudo-selector'))
        }
        return result
      })()
    }))
  })
})
