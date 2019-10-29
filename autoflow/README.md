### This package is now a part of the [core Atom repository](https://github.com/atom/atom/tree/master/packages/autoflow), please direct all issues and pull requests there in the future!

---

# Autoflow package
[![OS X Build Status](https://travis-ci.org/atom/autoflow.svg?branch=master)](https://travis-ci.org/atom/autoflow) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/kpmsnkbooa29x907/branch/master?svg=true)](https://ci.appveyor.com/project/Atom/autoflow/branch/master) [![Dependency Status](https://david-dm.org/atom/autoflow.svg)](https://david-dm.org/atom/autoflow)

Format the current selection to have lines no longer than 80 characters using `cmd-alt-q` on macOS and `ctrl-shift-q` on Windows and Linux. If nothing is selected, the current paragraph will be reflowed.

This package uses the config value of `editor.preferredLineLength` when set to determine desired line length.
