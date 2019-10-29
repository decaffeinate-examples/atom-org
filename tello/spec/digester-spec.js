/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const { digest } = require('../src/digester')
const Donna = require('donna')
const CoffeeScript = require('coffee-script')

describe('digest', function () {
  it('generates method arguments', function () {
    const file = `\
# Public: Some class
class Something
  # Public: this is a function
  #
  # * \`argument\` arg
  #   * \`argument\` arg
  someFunction: ->\
`
    const json = Parser.generateDigest(file)
    expect(json.classes.Something.instanceMethods[0].arguments.length).toBe(1)
    return expect(json.classes.Something.instanceMethods[0].arguments[0].children.length).toBe(1)
  })

  it('generates titled method arguments', function () {
    const file = `\
# Public: Some class
class Something
  # Public: this is a function
  #
  # ## Arguments: A title
  #
  # * \`argument\` arg
  #   * \`argument\` arg
  someFunction: ->\
`
    const json = Parser.generateDigest(file)
    const method = json.classes.Something.instanceMethods[0]
    expect(method.titledArguments.length).toBe(1)
    expect(method.titledArguments[0].title).toBe('A title')
    return expect(method.titledArguments[0].arguments.length).toBe(1)
  })

  it('generates examples', function () {
    const file = `\
# Public: Some class
#
# ## Examples
#
# This is an example
#
# \`\`\`js
# a = 1
# \`\`\`
class Something
  # Public: this is a function
  #
  # ## Examples
  #
  # Method example
  #
  # \`\`\`js
  # a = 1
  # \`\`\`
  someFunction: ->\
`
    const json = Parser.generateDigest(file)
    expect(json.classes.Something.examples.length).toBe(1)
    expect(json.classes.Something.examples[0].description).toBe('This is an example')
    expect(json.classes.Something.instanceMethods[0].examples.length).toBe(1)
    return expect(json.classes.Something.instanceMethods[0].examples[0].description).toBe('Method example')
  })

  it('generates events', function () {
    const file = `\
# Public: Some class
#
# ## Events
#
# Class Events
#
# ### event-one
#
# an event
#
# * \`argument\` arg
class Something
  # Public: this is a function
  #
  # ## Events
  #
  # Method Events
  #
  # ### event-method
  #
  # a method event
  #
  # * \`argument\` arg
  someFunction: ->\
`
    const json = Parser.generateDigest(file)
    expect(json.classes.Something.events.length).toBe(1)
    expect(json.classes.Something.events[0].description).toBe('an event')
    expect(json.classes.Something.instanceMethods[0].events.length).toBe(1)
    return expect(json.classes.Something.instanceMethods[0].events[0].description).toBe('a method event')
  })

  it('ignores return statements in class-level documentation', function () {
    const file = `\
# Essential: Summary.
#
# ## \`method1()\`
#
# Returns a {String}.
#
# ## \`method2()\`
#
# Returns a {Number}.
class Person
  someFn: ->\
`
    const json = Parser.generateDigest(file)
    expect(json.classes.Person.summary).toBe('Summary.')
    return expect(json.classes.Person.description.trim()).toBe(`\
Summary.

## \`method1()\`

Returns a {String}.

## \`method2()\`

Returns a {Number}.\
`
    )
  })

  describe('when a class has a super class', () => it('generates links to github based on repo and version', function () {
    const file = `\
# Public: Some class
class Something extends String\
`
    const json = Parser.generateDigest(file)

    return expect(json).toEqualJson({
      classes: {
        Something: {
          visibility: 'Public',
          name: 'Something',
          superClass: 'String',
          filename: 'src/fakefile.coffee',
          summary: 'Some class ',
          description: 'Some class ',
          srcUrl: null,
          sections: [],
          classMethods: [],
          instanceMethods: [],
          classProperties: [],
          instanceProperties: []
        }
      }
    })
  }))

  describe('src link generation', function () {
    describe('when there are multiple packages', () => it('generates links to github based on repo and version', function () {
      const file1 = `\
# Public: Some class
class Something
# Public: this is a function
somefunction: ->\
`
      const file2 = `\
# Public: Another class
class Another

# Public: this is a function
anotherfunction: ->\
`
      const parser = new Parser()
      parser.addFile(file1, {
        filename: 'file1.coffee',
        packageJson: {
          name: 'somerepo',
          repository: 'https://github.com/atom/somerepo.git',
          version: '2.3.4'
        }
      }
      )
      parser.addFile(file2, {
        filename: 'file2.coffee',
        packageJson: {
          name: 'anotherrepo',
          repository: 'https://github.com/atom/anotherrepo.git',
          version: '1.2.3'
        }
      }
      )

      const json = parser.generateDigest()
      expect(json.classes.Something.srcUrl).toEqual('https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L2')
      return expect(json.classes.Another.srcUrl).toEqual('https://github.com/atom/anotherrepo/blob/v1.2.3/file2.coffee#L2')
    }))

    return describe('when there is only one package', () => it('generates links to github based on repo and version', function () {
      const file = `\
# Public: Some class
class Something
# Public: this is a function
somefunction: ->\
`
      const json = Parser.generateDigest(file, {
        filename: 'file1.coffee',
        packageJson: {
          name: 'somerepo',
          repository: 'https://github.com/atom/somerepo.git',
          version: '2.3.4'
        }
      }
      )

      return expect(json).toEqualJson({
        classes: {
          Something: {
            visibility: 'Public',
            name: 'Something',
            superClass: null,
            filename: 'file1.coffee',
            summary: 'Some class ',
            description: 'Some class ',
            srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L2',
            sections: [],
            classMethods: [],
            classProperties: [],
            instanceProperties: [],
            instanceMethods: [{
              visibility: 'Public',
              name: 'somefunction',
              sectionName: null,
              srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L4',
              summary: 'this is a function ',
              description: 'this is a function '
            }]
          }
        }
      })
    }))
  })

  describe('class methods', () => it('generates class level methods', function () {
    const file = `\
# Public: Some class
class Something
# Public: Some class level function
@aClassFunction: ->

# A private class function
@privateClassFunction: ->

# Public: this is a function
someFunction: ->\
`
    const json = Parser.generateDigest(file, {
      filename: 'file1.coffee',
      packageJson: {
        name: 'somerepo',
        repository: 'https://github.com/atom/somerepo.git',
        version: '2.3.4'
      }
    }
    )

    return expect(json).toEqualJson({
      classes: {
        Something: {
          visibility: 'Public',
          name: 'Something',
          superClass: null,
          filename: 'file1.coffee',
          summary: 'Some class ',
          description: 'Some class ',
          srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L2',
          sections: [],
          classProperties: [],
          instanceProperties: [],
          classMethods: [{
            visibility: 'Public',
            name: 'aClassFunction',
            sectionName: null,
            srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L4',
            summary: 'Some class level function ',
            description: 'Some class level function '
          }],
          instanceMethods: [{
            visibility: 'Public',
            name: 'someFunction',
            sectionName: null,
            srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L10',
            summary: 'this is a function ',
            description: 'this is a function '
          }]
        }
      }
    })
  }))

  describe('sections', function () {
    it('correctly splits the sections when there are mutiple classes in the file', function () {
      const file = `\
# Public: Some class
class Something
  # Public: has no section
  noSection: ->

  ###
  Section: One
  ###

  # Public: in section one
  sectionOneFn: ->

# Public: another class
class Another
  # Public: another with no section
  noSection: ->

  ###
  Section: Two

  This is section two!
  ###

  # Public: in section two
  sectionTwoFn: ->\
`
      const json = Parser.generateDigest(file)

      expect(json.classes.Something.sections).toEqualJson([{
        name: 'One',
        description: ''
      }])
      expect(json.classes.Another.sections).toEqualJson([{
        name: 'Two',
        description: 'This is section two!'
      }])

      expect(json.classes.Something.instanceMethods).toEqualJson([{
        srcUrl: null,
        name: 'noSection',
        sectionName: null,
        visibility: 'Public',
        summary: 'has no section ',
        description: 'has no section '
      }, {
        name: 'sectionOneFn',
        sectionName: 'One',
        srcUrl: null,
        visibility: 'Public',
        summary: 'in section one ',
        description: 'in section one '
      }])

      return expect(json.classes.Another.instanceMethods).toEqualJson([{
        srcUrl: null,
        name: 'noSection',
        sectionName: null,
        visibility: 'Public',
        summary: 'another with no section ',
        description: 'another with no section '
      }, {
        name: 'sectionTwoFn',
        sectionName: 'Two',
        srcUrl: null,
        visibility: 'Public',
        summary: 'in section two ',
        description: 'in section two '
      }])
    })

    it('correctly splits the sections when there are mutiple files with classes', function () {
      const file1 = `\
# Public: Some class
class Something
  # Public: has no section
  noSection: ->

  ###
  Section: One
  ###

  # Public: in section one
  sectionOneFn: ->\
`

      const file2 = `\
# Public: another class
class Another
  # Public: another with no section
  noSection: ->

  ###
  Section: Two

  This is section two!
  ###

  # Public: in section two
  sectionTwoFn: ->\
`
      const parser = new Parser()
      parser.addFile(file1, { filename: 'src/file1.coffee' })
      parser.addFile(file2, { filename: 'src/file2.coffee' })
      const json = parser.generateDigest()

      expect(json.classes.Something.sections).toEqualJson([{
        name: 'One',
        description: ''
      }])
      expect(json.classes.Another.sections).toEqualJson([{
        name: 'Two',
        description: 'This is section two!'
      }])

      expect(json.classes.Something.instanceMethods).toEqualJson([{
        srcUrl: null,
        name: 'noSection',
        sectionName: null,
        visibility: 'Public',
        summary: 'has no section ',
        description: 'has no section '
      }, {
        name: 'sectionOneFn',
        sectionName: 'One',
        srcUrl: null,
        visibility: 'Public',
        summary: 'in section one ',
        description: 'in section one '
      }])

      return expect(json.classes.Another.instanceMethods).toEqualJson([{
        srcUrl: null,
        name: 'noSection',
        sectionName: null,
        visibility: 'Public',
        summary: 'another with no section ',
        description: 'another with no section '
      }, {
        name: 'sectionTwoFn',
        sectionName: 'Two',
        srcUrl: null,
        visibility: 'Public',
        summary: 'in section two ',
        description: 'in section two '
      }])
    })

    it('pulls out all the sections, assigns methods to sections, and only returns sections that have public methods', function () {
      const file = `\
# Public: Some class
class Something
  # Public: has no section
  noSection: ->

  ###
  Section: One
  ###

  # Public: in section one
  sectionOneFn: ->

  # Public: in section one
  anotherSectionOneFn: ->

  ###
  Section: Two
  ###

  # Public: in section two
  sectionTwoFn: ->

  ###
  Section: Private
  ###

  # Nope, not in there
  privateFn: ->\
`
      const json = Parser.generateDigest(file)

      expect(json.classes.Something.sections).toEqualJson([{
        name: 'One',
        description: ''
      }, {
        name: 'Two',
        description: ''
      }])

      return expect(json.classes.Something.instanceMethods).toEqualJson([{
        name: 'noSection',
        sectionName: null,
        srcUrl: null,
        visibility: 'Public',
        summary: 'has no section ',
        description: 'has no section '
      }, {
        name: 'sectionOneFn',
        sectionName: 'One',
        srcUrl: null,
        visibility: 'Public',
        summary: 'in section one ',
        description: 'in section one '
      }, {
        name: 'anotherSectionOneFn',
        sectionName: 'One',
        visibility: 'Public',
        summary: 'in section one ',
        description: 'in section one ',
        srcUrl: null
      }, {
        name: 'sectionTwoFn',
        sectionName: 'Two',
        visibility: 'Public',
        summary: 'in section two ',
        description: 'in section two ',
        srcUrl: null
      }])
    })

    return it('handles sections that only have properties', function () {
      const file = `\
# Public: Some class
class Something
  ###
  Section: Methods
  ###

  # Public: A method
  someMethod: (key, options) ->

  ###
  Section: Props
  ###

  # Public: a property thing
  someProp: 1000\
`
      const json = Parser.generateDigest(file)

      return expect(json.classes.Something.sections).toEqualJson([{
        name: 'Methods',
        description: ''
      }, {
        name: 'Props',
        description: ''
      }])
    })
  })

  return describe('properties', () => it('outputs docs for properties', function () {
    const file = `\
# Public: Some class
class Something
# Public: Class prop
@classProperty: null

# Public: Instance prop
instanceProperty: null

# Public: this is a function
someFunction: ->\
`
    const json = Parser.generateDigest(file, {
      filename: 'file1.coffee',
      packageJson: {
        name: 'somerepo',
        repository: 'https://github.com/atom/somerepo.git',
        version: '2.3.4'
      }
    }
    )

    expect(json.classes.Something.instanceProperties).toEqualJson([{
      visibility: 'Public',
      name: 'instanceProperty',
      sectionName: null,
      srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L7',
      summary: 'Instance prop ',
      description: 'Instance prop '
    }])
    return expect(json.classes.Something.classProperties).toEqualJson([{
      visibility: 'Public',
      name: 'classProperty',
      sectionName: null,
      srcUrl: 'https://github.com/atom/somerepo/blob/v2.3.4/file1.coffee#L4',
      summary: 'Class prop ',
      description: 'Class prop '
    }])
  }))
})

// Yeah, recreating some donna stuff here...
class Parser {
  static generateDigest (fileContents, options) {
    const parser = new Parser()
    parser.addFile(fileContents, options)
    return parser.generateDigest()
  }

  constructor () {
    this.slugs = {}
    this.parser = new Donna.Parser()
  }

  generateDigest () {
    const slugs = []
    for (const k in this.slugs) {
      const slug = this.slugs[k]
      slugs.push(slug)
    }
    return digest(slugs)
  }

  addFile (fileContents, param) {
    let name
    if (param == null) { param = {} }
    let { filename, packageJson } = param
    if (filename == null) { filename = 'src/fakefile.coffee' }
    if (packageJson == null) { packageJson = {} }

    const slug = this.slugs[name = packageJson.name != null ? packageJson.name : 'default'] != null ? this.slugs[name] : (this.slugs[name] = {
      main: packageJson.main,
      repository: packageJson.repository,
      version: packageJson.version,
      files: {}
    })

    this.parser.parseContent(fileContents, filename)
    const metadata = new Donna.Metadata(packageJson, this.parser)
    metadata.generate(CoffeeScript.nodes(fileContents))
    return Donna.populateSlug(slug, filename, metadata)
  }
}
