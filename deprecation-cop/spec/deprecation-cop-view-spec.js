/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
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
const Grim = require('grim')
const path = require('path')
const _ = require('underscore-plus')
const etch = require('etch')

describe('DeprecationCopView', function () {
  let [deprecationCopView, workspaceElement] = Array.from([])

  beforeEach(function () {
    spyOn(_, 'debounce').andCallFake(func => function () { return func.apply(this, arguments) })

    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    jasmine.snapshotDeprecations()
    Grim.clearDeprecations()
    const deprecatedMethod = () => Grim.deprecate("A test deprecation. This isn't used")
    deprecatedMethod()

    spyOn(Grim, 'deprecate') // Don't fail tests if when using deprecated APIs in deprecation cop's activation
    const activationPromise = atom.packages.activatePackage('deprecation-cop')

    atom.commands.dispatch(workspaceElement, 'deprecation-cop:view')

    waitsForPromise(() => activationPromise)

    waitsFor(() => deprecationCopView = atom.workspace.getActivePane().getActiveItem())

    return runs(() => jasmine.unspy(Grim, 'deprecate'))
  })

  afterEach(() => jasmine.restoreDeprecationsSnapshot())

  it('displays deprecated methods', function () {
    expect(deprecationCopView.element.textContent).toMatch(/Deprecated calls/)
    return expect(deprecationCopView.element.textContent).toMatch(/This isn't used/)
  })

  // TODO: Remove conditional when the new StyleManager deprecation APIs reach stable.
  if (atom.styles.getDeprecations != null) {
    it('displays deprecated selectors', function () {
      atom.styles.addStyleSheet('atom-text-editor::shadow { color: red }', { sourcePath: path.join('some-dir', 'packages', 'package-1', 'file-1.css') })
      atom.styles.addStyleSheet('atom-text-editor::shadow { color: yellow }', { context: 'atom-text-editor', sourcePath: path.join('some-dir', 'packages', 'package-1', 'file-2.css') })
      atom.styles.addStyleSheet('atom-text-editor::shadow { color: blue }', { sourcePath: path.join('another-dir', 'packages', 'package-2', 'file-3.css') })
      atom.styles.addStyleSheet('atom-text-editor::shadow { color: gray }', { sourcePath: path.join('another-dir', 'node_modules', 'package-3', 'file-4.css') })

      const promise = etch.getScheduler().getNextUpdatePromise()
      waitsForPromise(() => promise)

      return runs(function () {
        const packageItems = deprecationCopView.element.querySelectorAll('ul.selectors > li')
        expect(packageItems.length).toBe(3)
        expect(packageItems[0].textContent).toMatch(/package-1/)
        expect(packageItems[1].textContent).toMatch(/package-2/)
        expect(packageItems[2].textContent).toMatch(/Other/)

        const packageDeprecationItems = packageItems[0].querySelectorAll('li.source-file')
        expect(packageDeprecationItems.length).toBe(2)
        expect(packageDeprecationItems[0].textContent).toMatch(/atom-text-editor/)
        expect(packageDeprecationItems[0].querySelector('a').href).toMatch('some-dir/packages/package-1/file-1.css')
        expect(packageDeprecationItems[1].textContent).toMatch(/:host/)
        return expect(packageDeprecationItems[1].querySelector('a').href).toMatch('some-dir/packages/package-1/file-2.css')
      })
    })
  }

  return it('skips stack entries which go through node_modules/ files when determining package name', function () {
    const stack = [
      {
        functionName: 'function0',
        location: path.normalize('/Users/user/.atom/packages/package1/node_modules/atom-space-pen-viewslib/space-pen.js:55:66'),
        fileName: path.normalize('/Users/user/.atom/packages/package1/node_modules/atom-space-pen-views/lib/space-pen.js')
      },
      {
        functionName: 'function1',
        location: path.normalize('/Users/user/.atom/packages/package1/node_modules/atom-space-pen-viewslib/space-pen.js:15:16'),
        fileName: path.normalize('/Users/user/.atom/packages/package1/node_modules/atom-space-pen-views/lib/space-pen.js')
      },
      {
        functionName: 'function2',
        location: path.normalize('/Users/user/.atom/packages/package2/lib/module.js:13:14'),
        fileName: path.normalize('/Users/user/.atom/packages/package2/lib/module.js')
      }
    ]

    const packagePathsByPackageName = new Map([
      ['package1', path.normalize('/Users/user/.atom/packages/package1')],
      ['package2', path.normalize('/Users/user/.atom/packages/package2')]
    ])

    spyOn(deprecationCopView, 'getPackagePathsByPackageName').andReturn(packagePathsByPackageName)

    const packageName = deprecationCopView.getPackageName(stack)
    return expect(packageName).toBe('package2')
  })
})
