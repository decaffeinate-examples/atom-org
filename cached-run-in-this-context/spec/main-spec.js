const main = require('../src/main')
const vm = require('vm')

describe('cached runInThisContext', () => {
  it('runs arbitrary functions as vm.runInThisContext does', () => {
    const fn = '(function(a, b, c) { return a + b + c; })'

    expect(
      vm.runInThisContext(fn, 'filename-1')(1, 2, 3)
    ).toBe(
      main.runInThisContext(fn, 'filename-1').result(1, 2, 3)
    )
  })

  it('throws an exception when the code is not valid', () => {
    const fn = '(function(a, b, c) { an arbitrary error @$%^* })'

    expect(() => main.runInThisContext(fn, 'file-with-errors')).toThrow('Unexpected identifier')
    expect(() => main.runInThisContextCached(fn, 'file-with-errors', Buffer.from(''))).toThrow('Unexpected identifier')
  })

  it('throws an exception when the code throws an exception', () => {
    const code = 'throw new Error("Oops");'

    expect(() => main.runInThisContext(code, 'file-with-errors')).toThrow('Oops')
    expect(() => main.runInThisContextCached(code, 'file-with-errors', Buffer.from(''))).toThrow('Oops')
  })

  it('returns a cache that can be used to speed up future compilations', () => {
    const fn = '(function(a, b, c) { return a; })'

    const nonCached = main.runInThisContext(fn, 'filename-2')
    const cached = main.runInThisContextCached(fn, 'filename-2', nonCached.cacheBuffer)

    expect(nonCached.cacheBuffer).not.toBe(null)
    expect(nonCached.result(1)).toBe(cached.result(1))
    expect(cached.wasRejected).toBe(false)
  })

  it('rejects the cache when the provided buffer is invalid', () => {
    const fn = '(function(a, b, c) { return a + b; })'

    const cached = main.runInThisContextCached(fn, 'filename', Buffer.from('invalid cache'))

    expect(cached.result(10, 20)).toBe(30)
    expect(cached.wasRejected).toBe(true)
  })

  it('rejects the cache when compiling a function that is not sufficiently similar to the cached one', () => {
    const fn1 = '(function() { return 50; })'
    const fn2 = '(function(a, b, c) { return a + c; })'

    const {cacheBuffer} = main.runInThisContext(fn1, 'filename')
    const cached = main.runInThisContextCached(fn2, 'filename', cacheBuffer)

    expect(cached.result(10, 20, 30)).toBe(40)
    expect(cached.wasRejected).toBe(true)
  })
})
