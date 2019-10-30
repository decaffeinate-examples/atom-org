/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const child_process = require('child_process');
const fs = require('./fs');
const path = require('path');
const npm = require('npm');
const semver = require('semver');

module.exports = {
  getHomeDirectory() {
    if (process.platform === 'win32') { return process.env.USERPROFILE; } else { return process.env.HOME; }
  },

  getAtomDirectory() {
    return process.env.ATOM_HOME != null ? process.env.ATOM_HOME : path.join(this.getHomeDirectory(), '.atom');
  },

  getRustupHomeDirPath() {
    if (process.env.RUSTUP_HOME) {
      return process.env.RUSTUP_HOME;
    } else {
      return path.join(this.getHomeDirectory(), '.multirust');
    }
  },

  getCacheDirectory() {
    return path.join(this.getAtomDirectory(), '.apm');
  },

  getResourcePath(callback) {
    let asarPath;
    if (process.env.ATOM_RESOURCE_PATH) {
      return process.nextTick(() => callback(process.env.ATOM_RESOURCE_PATH));
    }

    let apmFolder = path.resolve(__dirname, '..');
    let appFolder = path.dirname(apmFolder);
    if ((path.basename(apmFolder) === 'apm') && (path.basename(appFolder) === 'app')) {
      asarPath = `${appFolder}.asar`;
      if (fs.existsSync(asarPath)) {
        return process.nextTick(() => callback(asarPath));
      }
    }

    apmFolder = path.resolve(__dirname, '..', '..', '..');
    appFolder = path.dirname(apmFolder);
    if ((path.basename(apmFolder) === 'apm') && (path.basename(appFolder) === 'app')) {
      asarPath = `${appFolder}.asar`;
      if (fs.existsSync(asarPath)) {
        return process.nextTick(() => callback(asarPath));
      }
    }

    switch (process.platform) {
      case 'darwin':
        return child_process.exec('mdfind "kMDItemCFBundleIdentifier == \'com.github.atom\'"', function(error, stdout, stderr) {
          let appLocation;
          if (stdout == null) { stdout = ''; }
          if (!error) { [appLocation] = Array.from(stdout.split('\n')); }
          if (!appLocation) { appLocation = '/Applications/Atom.app'; }
          return callback(`${appLocation}/Contents/Resources/app.asar`);
        });
      case 'linux':
        var appLocation = '/usr/local/share/atom/resources/app.asar';
        if (!fs.existsSync(appLocation)) {
          appLocation = '/usr/share/atom/resources/app.asar';
        }
        return process.nextTick(() => callback(appLocation));
    }
  },

  getReposDirectory() {
    return process.env.ATOM_REPOS_HOME != null ? process.env.ATOM_REPOS_HOME : path.join(this.getHomeDirectory(), 'github');
  },

  getElectronUrl() {
    return process.env.ATOM_ELECTRON_URL != null ? process.env.ATOM_ELECTRON_URL : 'https://atom.io/download/electron';
  },

  getAtomPackagesUrl() {
    return process.env.ATOM_PACKAGES_URL != null ? process.env.ATOM_PACKAGES_URL : `${this.getAtomApiUrl()}/packages`;
  },

  getAtomApiUrl() {
    return process.env.ATOM_API_URL != null ? process.env.ATOM_API_URL : 'https://atom.io/api';
  },

  getElectronArch() {
    switch (process.platform) {
      case 'darwin': return 'x64';
      default: return process.env.ATOM_ARCH != null ? process.env.ATOM_ARCH : process.arch;
    }
  },

  getUserConfigPath() {
    return path.resolve(this.getAtomDirectory(), '.apmrc');
  },

  getGlobalConfigPath() {
    return path.resolve(this.getAtomDirectory(), '.apm', '.apmrc');
  },

  isWin32() {
    return process.platform === 'win32';
  },

  x86ProgramFilesDirectory() {
    return process.env["ProgramFiles(x86)"] || process.env["ProgramFiles"];
  },

  getInstalledVisualStudioFlag() {
    if (!this.isWin32()) { return null; }

    // Use the explictly-configured version when set
    if (process.env.GYP_MSVS_VERSION) { return process.env.GYP_MSVS_VERSION; }

    if (this.visualStudioIsInstalled("14.0")) { return '2015'; }
    if (this.visualStudioIsInstalled("12.0")) { return '2013'; }
    if (this.visualStudioIsInstalled("11.0")) { return '2012'; }
    if (this.visualStudioIsInstalled("10.0")) { return '2010'; }
  },

  visualStudioIsInstalled(version) {
    return fs.existsSync(path.join(this.x86ProgramFilesDirectory(), `Microsoft Visual Studio ${version}`, "Common7", "IDE"));
  },

  loadNpm(callback) {
    const npmOptions = {
      userconfig: this.getUserConfigPath(),
      globalconfig: this.getGlobalConfigPath()
    };
    return npm.load(npmOptions, () => callback(null, npm));
  },

  getSetting(key, callback) {
    return this.loadNpm(() => callback(npm.config.get(key)));
  },

  setupApmRcFile() {
    try {
      return fs.writeFileSync(this.getGlobalConfigPath(), `\
; This file is auto-generated and should not be edited since any
; modifications will be lost the next time any apm command is run.
;
; You should instead edit your .apmrc config located in ~/.atom/.apmrc
cache = ${this.getCacheDirectory()}
; Hide progress-bar to prevent npm from altering apm console output.
progress = false\
`
      );
    } catch (error) {}
  }
};
