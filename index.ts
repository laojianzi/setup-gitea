import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import axios from "axios"
import { execSync } from "child_process"
import os = require("os")
import path = require("path")
import process = require("process")

const downloadURL = "https://dl.gitea.io/gitea"
const getAssetURL = (version: string): string => {
  let platform = os.platform().toString()
  switch (platform) {
    case "win32":
      platform = "windows"
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

const installGitea = async (version: string) => {
  core.info(`Installing gitea ${version}...`)

  const startedAt = Date.now()
  const assetURL = getAssetURL(version)
  core.info(`Downloading ${assetURL} ...`)

  const toolPath = await tc.downloadTool(assetURL)
  core.info(`Installed gitea into ${toolPath} in ${Date.now() - startedAt}ms`)

  core.addPath(path.dirname(toolPath))
}

function run(command: string) {
  console.log(command)
  const env = Object.assign({}, process.env)
  delete env.CI // for Homebrew on macos-11.0
  execSync(command, { stdio: "inherit", env: env })
}

const versionURL = "https://dl.gitea.io/gitea/version.json"
const getLatestVersion = (): string => {
  let version = "1.15.7"

  axios
    .get(versionURL)
    .then((res) => {
      version = res.data.latest.version
    })
    .catch((err) => {
      core.setFailed(`Error: ${err.message}`)
    })

  return version
}

let installVersion = getLatestVersion()
const inputVersion = core.getInput(`gitea-version`)
if (inputVersion != "") {
  installVersion = inputVersion
}

installGitea(installVersion)
run(`gitea --version`)
