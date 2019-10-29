/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { spawn } = require('child_process')
const path = require('path')
const _ = require('underscore-plus')
const npm = require('npm')
const config = require('./apm')
const fs = require('./fs')

const addPortableGitToEnv = function (env) {
  let children
  const localAppData = env.LOCALAPPDATA
  if (!localAppData) { return }

  const githubPath = path.join(localAppData, 'GitHub')

  try {
    children = fs.readdirSync(githubPath)
  } catch (error) {
    return
  }

  for (const child of Array.from(children)) {
    if (child.indexOf('PortableGit_') === 0) {
      const cmdPath = path.join(githubPath, child, 'cmd')
      const binPath = path.join(githubPath, child, 'bin')
      if (env.Path) {
        env.Path += `${path.delimiter}${cmdPath}${path.delimiter}${binPath}`
      } else {
        env.Path = `${cmdPath}${path.delimiter}${binPath}`
      }
      break
    }
  }
}

const addGitBashToEnv = function (env) {
  let gitPath
  if (env.ProgramFiles) {
    gitPath = path.join(env.ProgramFiles, 'Git')
  }

  if (!fs.isDirectorySync(gitPath)) {
    if (env['ProgramFiles(x86)']) {
      gitPath = path.join(env['ProgramFiles(x86)'], 'Git')
    }
  }

  if (!fs.isDirectorySync(gitPath)) { return }

  const cmdPath = path.join(gitPath, 'cmd')
  const binPath = path.join(gitPath, 'bin')
  if (env.Path) {
    return env.Path += `${path.delimiter}${cmdPath}${path.delimiter}${binPath}`
  } else {
    return env.Path = `${cmdPath}${path.delimiter}${binPath}`
  }
}

exports.addGitToEnv = function (env) {
  if (process.platform !== 'win32') { return }
  addPortableGitToEnv(env)
  return addGitBashToEnv(env)
}

exports.getGitVersion = function (callback) {
  const npmOptions = {
    userconfig: config.getUserConfigPath(),
    globalconfig: config.getGlobalConfigPath()
  }
  return npm.load(npmOptions, function () {
    let left
    const git = (left = npm.config.get('git')) != null ? left : 'git'
    exports.addGitToEnv(process.env)
    const spawned = spawn(git, ['--version'])
    const outputChunks = []
    spawned.stderr.on('data', chunk => outputChunks.push(chunk))
    spawned.stdout.on('data', chunk => outputChunks.push(chunk))
    spawned.on('error', function () {})
    return spawned.on('close', function (code) {
      let version
      if (code === 0) {
        let gitName, versionName;
        [gitName, versionName, version] = Array.from(Buffer.concat(outputChunks).toString().split(' '))
        version = version != null ? version.trim() : undefined
      }
      return callback(version)
    })
  })
}
