/** @babel */
/* eslint-disable
    no-multi-str,
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Autoflow package', function () {
  let [autoflow, editor, editorElement] = Array.from([])
  const tabLength = 4

  describe('autoflow:reflow-selection', function () {
    beforeEach(function () {
      let activationPromise = null

      waitsForPromise(() => atom.workspace.open())

      runs(function () {
        editor = atom.workspace.getActiveTextEditor()
        editorElement = atom.views.getView(editor)

        atom.config.set('editor.preferredLineLength', 30)
        atom.config.set('editor.tabLength', tabLength)

        activationPromise = atom.packages.activatePackage('autoflow')

        return atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')
      })

      return waitsForPromise(() => activationPromise)
    })

    it("uses the preferred line length based on the editor's scope", function () {
      atom.config.set('editor.preferredLineLength', 4, { scopeSelector: '.text.plain.null-grammar' })
      editor.setText('foo bar')
      editor.selectAll()
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      return expect(editor.getText()).toBe(`\
foo
bar\
`
      )
    })

    it('rearranges line breaks in the current selection to ensure lines are shorter than config.editor.preferredLineLength honoring tabLength', function () {
      editor.setText('\t\tThis is the first paragraph and it is longer than the preferred line length so it should be reflowed.\n\n\t\tThis is a short paragraph.\n\n\t\tAnother long paragraph, it should also be reflowed with the use of this single command.')

      editor.selectAll()
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      const exedOut = editor.getText().replace(/\t/g, Array(tabLength + 1).join('X'))
      return expect(exedOut).toBe('XXXXXXXXThis is the first\nXXXXXXXXparagraph and it is\nXXXXXXXXlonger than the\nXXXXXXXXpreferred line length\nXXXXXXXXso it should be\nXXXXXXXXreflowed.\n\nXXXXXXXXThis is a short\nXXXXXXXXparagraph.\n\nXXXXXXXXAnother long\nXXXXXXXXparagraph, it should\nXXXXXXXXalso be reflowed with\nXXXXXXXXthe use of this single\nXXXXXXXXcommand.')
    })

    it('rearranges line breaks in the current selection to ensure lines are shorter than config.editor.preferredLineLength', function () {
      editor.setText(`\
This is the first paragraph and it is longer than the preferred line length so it should be reflowed.

This is a short paragraph.

Another long paragraph, it should also be reflowed with the use of this single command.\
`
      )

      editor.selectAll()
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      return expect(editor.getText()).toBe(`\
This is the first paragraph
and it is longer than the
preferred line length so it
should be reflowed.

This is a short paragraph.

Another long paragraph, it
should also be reflowed with
the use of this single
command.\
`
      )
    })

    it('is not confused when the selection boundary is between paragraphs', function () {
      editor.setText(`\
v--- SELECTION STARTS AT THE BEGINNING OF THE NEXT LINE (pos 1,0)

The preceding newline should not be considered part of this paragraph.

The newline at the end of this paragraph should be preserved and not
converted into a space.

^--- SELECTION ENDS AT THE BEGINNING OF THE PREVIOUS LINE (pos 6,0)\
`
      )

      editor.setCursorBufferPosition([1, 0])
      editor.selectToBufferPosition([6, 0])
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      return expect(editor.getText()).toBe(`\
v--- SELECTION STARTS AT THE BEGINNING OF THE NEXT LINE (pos 1,0)

The preceding newline should
not be considered part of this
paragraph.

The newline at the end of this
paragraph should be preserved
and not converted into a
space.

^--- SELECTION ENDS AT THE BEGINNING OF THE PREVIOUS LINE (pos 6,0)\
`
      )
    })

    it('reflows the current paragraph if nothing is selected', function () {
      editor.setText(`\
This is a preceding paragraph, which shouldn't be modified by a reflow of the following paragraph.

The quick brown fox jumps over the lazy
dog. The preceding sentence contains every letter
in the entire English alphabet, which has absolutely no relevance
to this test.

This is a following paragraph, which shouldn't be modified by a reflow of the preciding paragraph.
\
`
      )

      editor.setCursorBufferPosition([3, 5])
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      return expect(editor.getText()).toBe(`\
This is a preceding paragraph, which shouldn't be modified by a reflow of the following paragraph.

The quick brown fox jumps over
the lazy dog. The preceding
sentence contains every letter
in the entire English
alphabet, which has absolutely
no relevance to this test.

This is a following paragraph, which shouldn't be modified by a reflow of the preciding paragraph.
\
`
      )
    })

    return it('allows for single words that exceed the preferred wrap column length', function () {
      editor.setText("this-is-a-super-long-word-that-shouldn't-break-autoflow and these are some smaller words")

      editor.selectAll()
      atom.commands.dispatch(editorElement, 'autoflow:reflow-selection')

      return expect(editor.getText()).toBe(`\
this-is-a-super-long-word-that-shouldn't-break-autoflow
and these are some smaller
words\
`
      )
    })
  })

  return describe('reflowing text', function () {
    beforeEach(() => autoflow = require('../lib/autoflow'))

    it('respects current paragraphs', function () {
      const text = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh id magna ullamcorper sagittis. Maecenas
et enim eu orci tincidunt adipiscing
aliquam ligula.

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Phasellus gravida
nibh id magna ullamcorper
tincidunt adipiscing lacinia a dui. Etiam quis erat dolor.
rutrum nisl fermentum rhoncus. Duis blandit ligula facilisis fermentum.\
`

      const res = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh
id magna ullamcorper sagittis. Maecenas et enim eu orci tincidunt adipiscing
aliquam ligula.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh
id magna ullamcorper tincidunt adipiscing lacinia a dui. Etiam quis erat dolor.
rutrum nisl fermentum rhoncus. Duis blandit ligula facilisis fermentum.\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('respects indentation', function () {
      const text = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh id magna ullamcorper sagittis. Maecenas
et enim eu orci tincidunt adipiscing
aliquam ligula.

    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Phasellus gravida
    nibh id magna ullamcorper
    tincidunt adipiscing lacinia a dui. Etiam quis erat dolor.
    rutrum nisl fermentum  rhoncus. Duis blandit ligula facilisis fermentum\
`

      const res = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh
id magna ullamcorper sagittis. Maecenas et enim eu orci tincidunt adipiscing
aliquam ligula.

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida
    nibh id magna ullamcorper tincidunt adipiscing lacinia a dui. Etiam quis
    erat dolor. rutrum nisl fermentum  rhoncus. Duis blandit ligula facilisis
    fermentum\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('respects prefixed text (comments!)', function () {
      const text = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh id magna ullamcorper sagittis. Maecenas
et enim eu orci tincidunt adipiscing
aliquam ligula.

  #  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  #  Phasellus gravida
  #  nibh id magna ullamcorper
  #  tincidunt adipiscing lacinia a dui. Etiam quis erat dolor.
  #  rutrum nisl fermentum  rhoncus. Duis blandit ligula facilisis fermentum\
`

      const res = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida nibh
id magna ullamcorper sagittis. Maecenas et enim eu orci tincidunt adipiscing
aliquam ligula.

  #  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida
  #  nibh id magna ullamcorper tincidunt adipiscing lacinia a dui. Etiam quis
  #  erat dolor. rutrum nisl fermentum  rhoncus. Duis blandit ligula facilisis
  #  fermentum\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('respects multiple prefixes (js/c comments)', function () {
      const text = `\
// Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida
et enim eu orci tincidunt adipiscing
aliquam ligula.\
`

      const res = `\
// Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida et
// enim eu orci tincidunt adipiscing aliquam ligula.\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly handles * prefix', function () {
      const text = `\
* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida
et enim eu orci tincidunt adipiscing
aliquam ligula.

  * soidjfiojsoidj foi\
`

      const res = `\
* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus gravida et
* enim eu orci tincidunt adipiscing aliquam ligula.

  * soidjfiojsoidj foi\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('does not throw invalid regular expression errors (regression)', function () {
      const text = '\
*** Lorem ipsum dolor sit amet\
'

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(text)
    })

    it('handles different initial indentation', function () {
      const text = `\
Magna ea magna fugiat nisi minim in id duis. Culpa sit sint consequat quis elit magna pariatur incididunt
  proident laborum deserunt est aliqua reprehenderit. Occaecat et ex non do Lorem irure adipisicing mollit excepteur
  eu ullamco consectetur. Ex ex Lorem duis labore quis ad exercitation elit dolor non adipisicing. Pariatur commodo ullamco
  culpa dolor sunt enim. Ullamco dolore do ea nulla ut commodo minim consequat cillum ad velit quis.\
`

      const res = `\
Magna ea magna fugiat nisi minim in id duis. Culpa sit sint consequat quis elit
magna pariatur incididunt proident laborum deserunt est aliqua reprehenderit.
Occaecat et ex non do Lorem irure adipisicing mollit excepteur eu ullamco
consectetur. Ex ex Lorem duis labore quis ad exercitation elit dolor non
adipisicing. Pariatur commodo ullamco culpa dolor sunt enim. Ullamco dolore do
ea nulla ut commodo minim consequat cillum ad velit quis.\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly handles CRLF', function () {
      const text = 'This is the first line and it is longer than the preferred line length so it should be reflowed.\r\nThis is a short line which should\r\nbe reflowed with the following line.\rAnother long line, it should also be reflowed with everything above it when it is all reflowed.'

      const res =
        `\
This is the first line and it is longer than the preferred line length so it
should be reflowed. This is a short line which should be reflowed with the
following line. Another long line, it should also be reflowed with everything
above it when it is all reflowed.\
`
      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('handles cyrillic text', function () {
      const text = '\
В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и медленно, как бы в нерешимости, отправился к К-ну мосту.\
'

      const res = `\
В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел
из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и
медленно, как бы в нерешимости, отправился к К-ну мосту.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('handles `yo` character properly', function () {
      // Because there're known problems with this character in major regex engines
      const text = 'Ё Ё Ё'

      const res = `\
Ё
Ё
Ё\
`

      return expect(autoflow.reflow(text, { wrapColumn: 2 })).toEqual(res)
    })

    it('properly reflows // comments ', function () {
      const text =
        '\
// Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
// Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
// sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
// fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
// quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
// actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
// sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
// direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
// Meditation microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows /* comments ', function () {
      const text =
        '\
/* Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas. */\
'

      const res =
        `\
/* Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
   sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
   fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
   quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
   actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
   sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
   direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
   Meditation microdosing distillery 8-bit humblebrag migas. */\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows pound comments ', function () {
      const text =
        '\
# Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
# Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha
# banh mi, cold-pressed retro whatever ethical man braid asymmetrical
# fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa
# leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually
# aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial
# letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade,
# tacos pickled fanny pack literally meh pinterest slow-carb. Meditation
# microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows - list items ', function () {
      const text =
        '\
- Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
- Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha
  banh mi, cold-pressed retro whatever ethical man braid asymmetrical
  fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa
  leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually
  aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial
  letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade,
  tacos pickled fanny pack literally meh pinterest slow-carb. Meditation
  microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows % comments ', function () {
      const text =
        '\
% Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
% Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha
% banh mi, cold-pressed retro whatever ethical man braid asymmetrical
% fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa
% leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually
% aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial
% letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade,
% tacos pickled fanny pack literally meh pinterest slow-carb. Meditation
% microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows roxygen comments ', function () {
      const text =
        '\
#\' Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
#' Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
#' sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
#' fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
#' quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
#' actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
#' sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
#' direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
#' Meditation microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows -- comments ', function () {
      const text =
        '\
-- Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
-- Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
-- sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
-- fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
-- quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
-- actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
-- sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
-- direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
-- Meditation microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows ||| comments ', function () {
      const text =
        '\
||| Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
||| Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
||| sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
||| fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
||| quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
||| actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
||| sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
||| direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
||| Meditation microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows ;; comments ', function () {
      const text =
        '\
;; Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
;; Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
;; sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
;; fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest
;; quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro
;; actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia
;; sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher
;; direct trade, tacos pickled fanny pack literally meh pinterest slow-carb.
;; Meditation microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('does not treat lines starting with a single semicolon as ;; comments', function () {
      const text =
        '\
;! Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
;! Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard
sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical
fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa
leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually
aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial
letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade,
tacos pickled fanny pack literally meh pinterest slow-carb. Meditation
microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    it('properly reflows > ascii email inclusions ', function () {
      const text =
        '\
> Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha banh mi, cold-pressed retro whatever ethical man braid asymmetrical fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade, tacos pickled fanny pack literally meh pinterest slow-carb. Meditation microdosing distillery 8-bit humblebrag migas.\
'

      const res =
        `\
> Beard pinterest actually brunch brooklyn jean shorts YOLO. Knausgaard sriracha
> banh mi, cold-pressed retro whatever ethical man braid asymmetrical
> fingerstache narwhal. Intelligentsia wolf photo booth, tumblr pinterest quinoa
> leggings four loko poutine. DIY tattooed drinking vinegar, wolf retro actually
> aesthetic austin keffiyeh marfa beard. Marfa trust fund salvia sartorial
> letterpress, keffiyeh plaid butcher. Swag try-hard dreamcatcher direct trade,
> tacos pickled fanny pack literally meh pinterest slow-carb. Meditation
> microdosing distillery 8-bit humblebrag migas.\
`

      return expect(autoflow.reflow(text, { wrapColumn: 80 })).toEqual(res)
    })

    return it("doesn't allow special characters to surpass wrapColumn", function () {
      const test =
        `\
Imagine that I'm writing some LaTeX code. I start a comment, but change my mind. %

Now I'm just kind of trucking along, doing some math and stuff. For instance, $3 + 4 = 7$. But maybe I'm getting really crazy and I use subtraction. It's kind of an obscure technique, but often it goes a bit like this: let $x = 2 + 2$, so $x - 1 = 3$ (quick maths).

That's OK I guess, but now look at this cool thing called set theory: $\\{n + 42 : n \\in \\mathbb{N}\\}$. Wow. Neat. But we all know why we're really here. If you peer deep down into your heart, and you stare into the depths of yourself: is $P = NP$? Beware, though; many have tried and failed to answer this question. It is by no means for the faint of heart.\
`

      const res =
        `\
Imagine that I'm writing some LaTeX code. I start a comment, but change my mind.
%

Now I'm just kind of trucking along, doing some math and stuff. For instance, $3
+ 4 = 7$. But maybe I'm getting really crazy and I use subtraction. It's kind of
an obscure technique, but often it goes a bit like this: let $x = 2 + 2$, so $x
- 1 = 3$ (quick maths).

That's OK I guess, but now look at this cool thing called set theory: $\\{n + 42
: n \\in \\mathbb{N}\\}$. Wow. Neat. But we all know why we're really here. If you
peer deep down into your heart, and you stare into the depths of yourself: is $P
= NP$? Beware, though; many have tried and failed to answer this question. It is
by no means for the faint of heart.\
`

      return expect(autoflow.reflow(test, { wrapColumn: 80 })).toEqual(res)
    })
  })
})
