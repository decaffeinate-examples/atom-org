describe 'Python settings', ->
  [editor, languageMode] = []

  afterEach ->
    editor.destroy()

  beforeEach ->
    atom.config.set('core.useTreeSitterParsers', false)

    waitsForPromise ->
      atom.workspace.open().then (o) ->
        editor = o
        languageMode = editor.languageMode

    waitsForPromise ->
      atom.packages.activatePackage('language-python')

  it 'matches lines correctly using the increaseIndentPattern', ->
    increaseIndentRegex = languageMode.increaseIndentRegexForScopeDescriptor(['source.python'])

    expect(increaseIndentRegex.testSync('for i in range(n):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  for i in range(n):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('async for i in range(n):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  async for i in range(n):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('class TheClass(Object):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  class TheClass(Object):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('def f(x):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  def f(x):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('async def f(x):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  async def f(x):')).toBeTruthy()
    expect(increaseIndentRegex.testSync('if this_var == that_var:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  if this_var == that_var:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('elif this_var == that_var:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  elif this_var == that_var:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('else:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  else:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('except Exception:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  except Exception:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('except Exception as e:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  except Exception as e:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('finally:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  finally:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('with open("filename") as f:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  with open("filename") as f:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('async with open("filename") as f:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  async with open("filename") as f:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('while True:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('  while True:')).toBeTruthy()
    expect(increaseIndentRegex.testSync('\t\t  while True:')).toBeTruthy()

  it 'does not match lines incorrectly using the increaseIndentPattern', ->
    increaseIndentRegex = languageMode.increaseIndentRegexForScopeDescriptor(['source.python'])

    expect(increaseIndentRegex.testSync('for i in range(n)')).toBeFalsy()
    expect(increaseIndentRegex.testSync('class TheClass(Object)')).toBeFalsy()
    expect(increaseIndentRegex.testSync('def f(x)')).toBeFalsy()
    expect(increaseIndentRegex.testSync('if this_var == that_var')).toBeFalsy()
    expect(increaseIndentRegex.testSync('"for i in range(n):"')).toBeFalsy()

  it 'matches lines correctly using the decreaseIndentPattern', ->
    decreaseIndentRegex = languageMode.decreaseIndentRegexForScopeDescriptor(['source.python'])

    expect(decreaseIndentRegex.testSync('elif this_var == that_var:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('  elif this_var == that_var:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('else:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('  else:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('except Exception:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('  except Exception:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('except Exception as e:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('  except Exception as e:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('finally:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('  finally:')).toBeTruthy()
    expect(decreaseIndentRegex.testSync('\t\t  finally:')).toBeTruthy()

  it 'does not match lines incorrectly using the decreaseIndentPattern', ->
    decreaseIndentRegex = languageMode.decreaseIndentRegexForScopeDescriptor(['source.python'])

    # NOTE! This first one is different from most other rote tests here.
    expect(decreaseIndentRegex.testSync('else: expression()')).toBeFalsy()
    expect(decreaseIndentRegex.testSync('elif this_var == that_var')).toBeFalsy()
    expect(decreaseIndentRegex.testSync('  elif this_var == that_var')).toBeFalsy()
    expect(decreaseIndentRegex.testSync('else')).toBeFalsy()
    expect(decreaseIndentRegex.testSync('  "finally:"')).toBeFalsy()
