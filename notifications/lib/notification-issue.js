/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NotificationIssue;
const fs = require('fs-plus');
const path = require('path');
const StackTraceParser = require('stacktrace-parser');

const CommandLogger = require('./command-logger');
const UserUtilities = require('./user-utilities');

const TITLE_CHAR_LIMIT = 100; // Truncate issue title to 100 characters (including ellipsis)

const FileURLRegExp = new RegExp('file://\w*/(.*)');

module.exports =
(NotificationIssue = class NotificationIssue {
  constructor(notification) {
    this.normalizedStackPaths = this.normalizedStackPaths.bind(this);
    this.notification = notification;
  }

  findSimilarIssues() {
    let repoUrl = this.getRepoUrl();
    if (repoUrl == null) { repoUrl = 'atom/atom'; }
    const repo = repoUrl.replace(/http(s)?:\/\/(\d+\.)?github.com\//gi, '');
    const issueTitle = this.getIssueTitle();
    const query = `${issueTitle} repo:${repo}`;
    const githubHeaders = new Headers({
      accept: 'application/vnd.github.v3+json',
      contentType: "application/json"
    });

    return fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=created`, {headers: githubHeaders})
      .then(r => r != null ? r.json() : undefined)
      .then(function(data) {
        if ((data != null ? data.items : undefined) != null) {
          const issues = {};
          for (let issue of Array.from(data.items)) {
            if ((issue.title.indexOf(issueTitle) > -1) && (issues[issue.state] == null)) {
              issues[issue.state] = issue;
              if ((issues.open != null) && (issues.closed != null)) { return issues; }
            }
          }

          if ((issues.open != null) || (issues.closed != null)) { return issues; }
        }
        return null;}).catch(e => null);
  }

  getIssueUrlForSystem() {
    // Windows will not launch URLs greater than ~2000 bytes so we need to shrink it
    // Also is.gd has a limit of 5000 bytes...
    return this.getIssueUrl().then(issueUrl => fetch("https://is.gd/create.php?format=simple", {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `url=${encodeURIComponent(issueUrl)}`
    })
    .then(r => r.text())
    .catch(e => null));
  }

  getIssueUrl() {
    return this.getIssueBody().then(issueBody => {
      let repoUrl = this.getRepoUrl();
      if (repoUrl == null) { repoUrl = 'https://github.com/atom/atom'; }
      return `${repoUrl}/issues/new?title=${this.encodeURI(this.getIssueTitle())}&body=${this.encodeURI(issueBody)}`;
    });
  }

  encodeURI(str) {
    return encodeURI(str).replace(/#/g, '%23').replace(/;/g, '%3B').replace(/%20/g, '+');
  }

  getIssueTitle() {
    let title = this.notification.getMessage();
    title = title.replace(process.env.ATOM_HOME, '$ATOM_HOME');
    if (process.platform === 'win32') {
      title = title.replace(process.env.USERPROFILE, '~');
      title = title.replace(path.sep, path.posix.sep); // Standardize issue titles
    } else {
      title = title.replace(process.env.HOME, '~');
    }

    if (title.length > TITLE_CHAR_LIMIT) {
      title = title.substring(0, TITLE_CHAR_LIMIT - 3) + '...';
    }
    return title.replace(/\r?\n|\r/g, "");
  }

  getIssueBody() {
    return new Promise((resolve, reject) => {
      if (this.issueBody) { return resolve(this.issueBody); }
      const systemPromise = UserUtilities.getOSVersion();
      const nonCorePackagesPromise = UserUtilities.getNonCorePackages();

      return Promise.all([systemPromise, nonCorePackagesPromise]).then(all => {
        let packageMessage, packageVersion;
        const [systemName, nonCorePackages] = Array.from(all);

        const message = this.notification.getMessage();
        const options = this.notification.getOptions();
        const repoUrl = this.getRepoUrl();
        const packageName = this.getPackageName();
        if (packageName != null) { packageVersion = __guard__(__guard__(atom.packages.getLoadedPackage(packageName), x1 => x1.metadata), x => x.version); }
        const copyText = '';
        const systemUser = process.env.USER;
        let rootUserStatus = '';

        if (systemUser === 'root') {
          rootUserStatus = '**User**: root';
        }

        if ((packageName != null) && (repoUrl != null)) {
          packageMessage = `[${packageName}](${repoUrl}) package ${packageVersion}`;
        } else if (packageName != null) {
          packageMessage = `'${packageName}' package v${packageVersion}`;
        } else {
          packageMessage = 'Atom Core';
        }

        this.issueBody = `\
[Enter steps to reproduce:]

1. ...
2. ...

**Atom**: ${atom.getVersion()} ${process.arch}
**Electron**: ${process.versions.electron}
**OS**: ${systemName}
**Thrown From**: ${packageMessage}
${rootUserStatus}

### Stack Trace

${message}

\`\`\`
At ${options.detail}

${this.normalizedStackPaths(options.stack)}
\`\`\`

### Commands

${CommandLogger.instance().getText()}

### Non-Core Packages

\`\`\`
${nonCorePackages.join('\n')}
\`\`\`

${copyText}\
`;
        return resolve(this.issueBody);
      });
    });
  }

  normalizedStackPaths(stack) {
    return stack != null ? stack.replace(/(^\W+at )([\w.]{2,} [(])?(.*)(:\d+:\d+[)]?)/gm, (m, p1, p2, p3, p4) => p1 + (p2 || '') +
      this.normalizePath(p3) + p4
    ) : undefined;
  }

  normalizePath(path) {
    return path.replace('file:///', '')                         // Randomly inserted file url protocols
        .replace(/[/]/g, '\\')                           // Temp switch for Windows home matching
        .replace(fs.getHomeDirectory(), '~')             // Remove users home dir for apm-dev'ed packages
        .replace(/\\/g, '/')                             // Switch \ back to / for everyone
        .replace(/.*(\/(app\.asar|packages\/).*)/, '$1'); // Remove everything before app.asar or pacakges
  }

  getRepoUrl() {
    const packageName = this.getPackageName();
    if (packageName == null) { return; }
    let repo = __guard__(__guard__(atom.packages.getLoadedPackage(packageName), x1 => x1.metadata), x => x.repository);
    let repoUrl = (repo != null ? repo.url : undefined) != null ? (repo != null ? repo.url : undefined) : repo;
    if (!repoUrl) {
      let packagePath;
      if (packagePath = atom.packages.resolvePackagePath(packageName)) {
        try {
          repo = __guard__(JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'))), x2 => x2.repository);
          repoUrl = (repo != null ? repo.url : undefined) != null ? (repo != null ? repo.url : undefined) : repo;
        } catch (error) {}
      }
    }

    return repoUrl != null ? repoUrl.replace(/\.git$/, '').replace(/^git\+/, '') : undefined;
  }

  getPackageNameFromFilePath(filePath) {
    if (!filePath) { return; }

    let packageName = __guard__(/\/\.atom\/dev\/packages\/([^\/]+)\//.exec(filePath), x => x[1]);
    if (packageName) { return packageName; }

    packageName = __guard__(/\\\.atom\\dev\\packages\\([^\\]+)\\/.exec(filePath), x1 => x1[1]);
    if (packageName) { return packageName; }

    packageName = __guard__(/\/\.atom\/packages\/([^\/]+)\//.exec(filePath), x2 => x2[1]);
    if (packageName) { return packageName; }

    packageName = __guard__(/\\\.atom\\packages\\([^\\]+)\\/.exec(filePath), x3 => x3[1]);
    if (packageName) { return packageName; }
  }

  getPackageName() {
    let packageName, packagePath;
    const options = this.notification.getOptions();

    if (options.packageName != null) { return options.packageName; }
    if ((options.stack == null) && (options.detail == null)) { return; }

    const packagePaths = this.getPackagePathsByPackageName();
    for (packageName in packagePaths) {
      packagePath = packagePaths[packageName];
      if ((packagePath.indexOf(path.join('.atom', 'dev', 'packages')) > -1) || (packagePath.indexOf(path.join('.atom', 'packages')) > -1)) {
        packagePaths[packageName] = fs.realpathSync(packagePath);
      }
    }

    const getPackageName = filePath => {
      let match;
      filePath = /\((.+?):\d+|\((.+)\)|(.+)/.exec(filePath)[0];

      // Stack traces may be a file URI
      if (match = FileURLRegExp.exec(filePath)) {
        filePath = match[1];
      }

      filePath = path.normalize(filePath);

      if (path.isAbsolute(filePath)) {
        for (let packName in packagePaths) {
          packagePath = packagePaths[packName];
          if (filePath === 'node.js') { continue; }
          const isSubfolder = filePath.indexOf(path.normalize(packagePath + path.sep)) === 0;
          if (isSubfolder) { return packName; }
        }
      }
      return this.getPackageNameFromFilePath(filePath);
    };

    if ((options.detail != null) && (packageName = getPackageName(options.detail))) {
      return packageName;
    }

    if (options.stack != null) {
      const stack = StackTraceParser.parse(options.stack);
      for (let i = 0, end = stack.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const {file} = stack[i];

        // Empty when it was run from the dev console
        if (!file) { return; }
        packageName = getPackageName(file);
        if (packageName != null) { return packageName; }
      }
    }

  }

  getPackagePathsByPackageName() {
    const packagePathsByPackageName = {};
    for (let pack of Array.from(atom.packages.getLoadedPackages())) {
      packagePathsByPackageName[pack.name] = pack.path;
    }
    return packagePathsByPackageName;
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}