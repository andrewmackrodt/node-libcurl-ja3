// Mostly copied from https://github.com/nodegit/nodegit/blob/288ab93/lifecycleScripts/postinstall.js
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const util = require('util')

// remember that everything in here must be a direct
// dependency of the package no dev dependencies are allowed.
const log = require('npmlog')
const rimraf = require('rimraf')

const buildFlags = require('./utils/buildFlags')

const execAsync = util.promisify(exec)

log.heading = 'node-libcurl-ja3'

const rootPath = path.join(__dirname, '..')

function cleanup() {
  // If we're using node-libcurl from a package manager then let's clean up after
  // ourselves when we install successfully - unless specified not to.
  if (!(buildFlags.mustBuild || buildFlags.skipCleanup)) {
    rimraf.sync(path.join(rootPath, 'build'))
    if (fs.existsSync(path.join(rootPath, 'curl-impersonate'))) {
      rimraf.sync(path.join(rootPath, 'curl-impersonate'))
    }
  }
}

module.exports = function install() {
  const distIndexPath = path.resolve(rootPath, 'dist', 'index.js')
  const distIndexExists = fs.existsSync(distIndexPath)

  // this is ternary will almost always fall into the first condition.
  // If we are using TS it probably means we have the git repo setup too.
  // But who knows, someone may be trying the code from a zip archive or something lol
  const executable = distIndexExists ? 'node' : 'yarn ts-node'

  const file = distIndexExists
    ? distIndexPath
    : path.resolve(rootPath, 'lib', 'index.ts')

  return execAsync(`${executable} "${file}"`)
    .catch(function (e) {
      if (~e.toString().indexOf('Module version mismatch')) {
        log.warn(
          'node-libcurl-ja3 was built for a different version of Node.js.',
        )
      } else {
        throw e
      }
    })
    .then(function () {
      if (buildFlags.isGitRepo) {
        // If building from a git repository, there is no need for clean up.
        return Promise.resolve()
      } else {
        cleanup()
      }
    })
}

// Called on the command line
// this should always be the case
// no reasoning for keeping the module.exports and having this check here :)
// it was probably just for future reference.
if (require.main === module) {
  module.exports().catch(function (e) {
    log.warn('Could not finish postinstall')
    log.error(e)
  })
}
