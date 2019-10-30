## Metrics package
[![OS X Build Status](https://travis-ci.org/atom/metrics.svg?branch=master)](https://travis-ci.org/atom/metrics) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/b5doi205xl3iex04/branch/master?svg=true)](https://ci.appveyor.com/project/Atom/metrics/branch/master) [![Dependency Status](https://david-dm.org/atom/metrics.svg)](https://david-dm.org/atom/metrics)

Help improve Atom by sending usage statistics, exceptions and deprecations to the team.

You will be asked at first-run whether you consent to telemetry being sent to the Atom team which includes usage statistics, sanitized exceptions and deprecation warnings. You can change your mind at a later date from the Atom Settings window.

### Collected data

* A unique UUID v4 random identifier is generated according to [RFC4122][RFC4122]
* Screen and window width and height
* Version of Atom being used including which release channel (stable, beta, dev)
* Name of each Atom view class or Atom configuration file opened in a pane, e.g. `EditorView`, `SettingsView`, `MarkdownPreviewView`, and `UserKeymap`. **No other pane item information is collected.**
* Exception messages (without paths)
* Heap memory used as MB and %
* Commands run (except core commands)
* File open events and their language grammar scope names
* Amount of time the current window was open for
* Amount of time the current window took to load
* Amount of time the app took to launch
* Deprecated package names and versions
* Chrome user-agent (version of Chrome, OS, CPU)
* The number of optional (non-bundled) Atom packages activated at startup
* The number of [user-defined key bindings](https://flight-manual.atom.io/using-atom/sections/basic-customization/#customizing-keybindings) loaded at startup
* File save events when editing the [user init script](https://flight-manual.atom.io/hacking-atom/sections/the-init-file/)
* File save events when editing the [user stylesheet](https://flight-manual.atom.io/using-atom/sections/basic-customization/#style-tweaks)
* Repository open events and the hostname from the repository's URL (i.e., `github.com`, `bitbucket.org`, `gitlab.com`, `visualstudio.com`, `amazonaws.com` if the repository is hosted at one of these domains; otherwise, the hostname is anonymized as `other`)

This information is sent to GitHub's internal analytics pipeline via the [`telemetry`][Telemetry] package which allows the Atom team to analyze usage patterns and errors in order to help improve Atom.

[Telemetry]: https://github.com/atom/telemetry
[RFC4122]: http://www.ietf.org/rfc/rfc4122.txt
