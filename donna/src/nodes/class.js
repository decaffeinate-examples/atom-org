Node          = require './node'
Method        = require './method'
VirtualMethod = require './virtual_method'
Variable      = require './variable'
Property      = require './property'
Doc           = require './doc'
_             = require 'underscore'

# Public: The Node representation of a CoffeeScript class.
module.exports = class Class extends Node

  # Constructs a class.
  #
  # node - The class node (a {Object})
  # fileName - The filename (a {String})
  # options - The parser options (a {Object})
  # comment - The comment node (a {Object})
  constructor: (@node, @fileName, @lineMapping, @options, comment) ->
    try
      @methods = []
      @variables = []
      @properties = []

      @doc = new Doc(comment, @options)

      if @doc.methods
        @methods.push new VirtualMethod(@, method, @lineMapping, @options) for method in @doc?.methods

      previousExp = null

      for exp in @node.body.expressions
        switch exp.constructor.name

          when 'Assign'
            doc = previousExp if previousExp?.constructor.name is 'Comment'
            doc or= swallowedDoc

            switch exp.value?.constructor.name
              when 'Code'
                @methods.push(new Method(@, exp, @lineMapping, @options, doc)) if exp.variable.base.value is 'this'
              when 'Value'
                @variables.push new Variable(@, exp, @lineMapping, @options, true, doc)

            doc = null

          when 'Value'
            previousProp = null

            for prop in exp.base.properties
              doc = previousProp if previousProp?.constructor.name is 'Comment'
              doc or= swallowedDoc

              switch prop.value?.constructor.name
                when 'Code'
                  @methods.push new Method(@, prop, @lineMapping, @options, doc)
                when 'Value'
                  variable =  new Variable(@, prop, @lineMapping, @options, false, doc)

                  if variable.doc?.property
                    property = new Property(@, prop, @lineMapping, @options, variable.getName(), doc)
                    property.setter = true
                    property.getter = true
                    @properties.push property
                  else
                    @variables.push variable

              doc = null
              previousProp = prop

          when 'Call'
            doc = previousExp if previousExp?.constructor.name is 'Comment'
            doc or= swallowedDoc

            type = exp.variable?.base?.value
            name = exp.args?[0]?.base?.properties?[0]?.variable?.base?.value

            # This is a workaround for a strange CoffeeScript bug:
            # Given the following snippet:
            #
            # class Test
            #   # Doc a
            #   set name: ->
            #
            #   # Doc B
            #   set another: ->
            #
            # This will be converted to:
            #
            # class Test
            #   ###
            #   Doc A
            #   ###
            #   set name: ->
            #
            #   ###
            #   Doc B
            #   ###
            #   set another: ->
            #
            # BUT, Doc B is now a sibling property of the previous `set name: ->` setter!
            #
            swallowedDoc = exp.args?[0]?.base?.properties?[1]

            if name && (type is 'set' or type is 'get')
              property = _.find(@properties, (p) -> p.name is name)

              unless property
                property = new Property(@, exp, @smc, @options, name, doc)
                @properties.push property

              property.setter = true if type is 'set'
              property.getter = true if type is 'get'

              doc = null

        previousExp = exp

    catch error
      console.warn('Create class error:', @node, error) if @options.verbose

  # Public: Get the source file name.
  #
  # Returns the filename of the class (a {String})
  getFileName: -> @fileName

  # Public: Get the class doc
  #
  # Returns the class doc (a [Doc])
  getDoc: -> @doc

  # Public: Alias for {::getClassName}
  #
  # Returns the full class name (a {String})
  getFullName: ->
    @getClassName()

  # Public: Get the full class name
  #
  # Returns the class (a {String})
  getClassName: ->
    try
      unless @className || !@node.variable
        @className = @node.variable.base.value

        # Inner class definition inherits
        # the namespace from the outer class
        if @className is 'this'
          outer = @findAncestor('Class')

          if outer
            @className = outer.variable.base.value
            for prop in outer.variable.properties
              @className += ".#{ prop.name.value }"

          else
            @className = ''

        for prop in @node.variable.properties
          @className += ".#{ prop.name.value }"

      @className

    catch error
      console.warn("Get class classname error at #{@fileName}:", @node, error) if @options.verbose

  # Public: Get the class name
  #
  # Returns the name (a {String})
  getName: ->
    try
      unless @name
        @name = @getClassName().split('.').pop()

      @name

    catch error
      console.warn("Get class name error at #{@fileName}:", @node, error) if @options.verbose

  # Public: Get the source line number
  #
  # Returns a {Number}.
  getLocation: ->
    try
      unless @location
        {locationData} = @node.variable
        firstLine = locationData.first_line + 1
        if !@lineMapping[firstLine]?
          @lineMapping[firstLine] = @lineMapping[firstLine - 1]

        @location = { line: @lineMapping[firstLine] }
      @location

    catch error
      console.warn("Get location error at #{@fileName}:", @node, error) if @options.verbose

  # Public: Get the class namespace
  #
  # Returns the namespace (a {String}).
  getNamespace: ->
    try
      unless @namespace
        @namespace = @getClassName().split('.')
        @namespace.pop()

        @namespace = @namespace.join('.')

      @namespace

    catch error
      console.warn("Get class namespace error at #{@fileName}:", @node, error) if @options.verbose

  # Public: Get the full parent class name
  #
  # Returns the parent class name (a {String}).
  getParentClassName: ->
    try
      unless @parentClassName
        if @node.parent
          @parentClassName = @node.parent.base.value

          # Inner class parent inherits
          # the namespace from the outer class parent
          if @parentClassName is 'this'
            outer = @findAncestor('Class')

            if outer
              @parentClassName = outer.parent.base.value
              for prop in outer.parent.properties
                @parentClassName += ".#{ prop.name.value }"

            else
              @parentClassName = ''

          for prop in @node.parent.properties
            @parentClassName += ".#{ prop.name.value }"

      @parentClassName

    catch error
      console.warn("Get class parent classname error at #{@fileName}:", @node, error) if @options.verbose

  # Public: Get all methods.
  #
  # Returns the methods as an {Array}.
  getMethods: -> @methods

  # Public: Get all variables.
  #
  # Returns the variables as an {Array}.
  getVariables: -> @variables
