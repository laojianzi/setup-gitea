import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import os from "os"
import path from "path"

const request = require('request');
const execSync = require("child_process").execSync;
const spawnSync = require('child_process').spawnSync;
const downloadURL = "https://dl.gitea.io/gitea"

const getAssetURL = (version: String): string => {
  let ext = "tar.gz"
  let platform = os.platform().toString()
  switch (platform) {
    case "win32":
      platform = "windows"
      ext = "zip"
      break
  }
  let arch = os.arch()
  switch (arch) {
    case "x64":
      arch = "amd64"
      break
    case "x32":
    case "ia32":
      arch = "386"
      break
  }

  return `${downloadURL}/${version}/gitea-${version}-${platform}-${arch}`
}

const installGitea = (version: String) => {
  core.info(`Installing gitea ${version}...`)

  const startedAt = Date.now()
  const assetURL = getAssetURL(version)
  core.info(`Downloading ${assetURL} ...`)

  const toolPath = tc.downloadTool(assetURL)
  core.info(`Installed gitea into ${toolPath} in ${Date.now() - startedAt}ms`)

  core.addPath(path.dirname(toolPath))
}

function run(command) {
  console.log(command);
  let env = Object.assign({}, process.env);
  delete env.CI; // for Homebrew on macos-11.0
  execSync(command, {stdio: 'inherit', env: env});
}

function runSafe() {
  const args = Array.from(arguments);
  console.log(args.join(' '));
  const command = args.shift();
  // spawn is safer and more lightweight than exec
  const ret = spawnSync(command, args, {stdio: 'inherit'});
  if (ret.status !== 0) {
    throw ret.error;
  }
}

const versionURL = "https://dl.gitea.io/gitea/version.json";
const getLatestVersion = (): string => {
  let version = "1.15.7"
  let options = {json: true};
  request(versionURL, options, (error, res, body) => {
    if (error) {
        return  console.log(error)
    };

    if (!error && res.statusCode == 200) {
      const info = JSON.parse(body);
      version = info.latest.version
    };
  });
  return version
}

const defaultVersion = getLatestVersion()
installGitea(defaultVersion)
run(`gitea --version`)
