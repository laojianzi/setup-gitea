import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import axios from "axios"
import { execSync } from "child_process"
import os = require("os")
import path = require("path")
import process = require("process")

const downloadURL = "https://dl.gitea.io/gitea"
let exp = ""
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

  switch (platform) {
    case "windows":
      platform = "windows-4.0"
      exp = ".exe"
      break
    case "darwin":
      platform = "darwin-10.12"
      break
  }

  return `${downloadURL}/${version}/gitea-${version}-${platform}-${arch}${exp}`
}

const installGitea = async (version: string): Promise<string> => {
  core.info(`Installing gitea ${version}...`)

  const startedAt = Date.now()
  const assetURL = getAssetURL(version)
  core.info(`Downloading ${assetURL} ...`)

  const toolPath = await tc.downloadTool(assetURL, `${os.tmpdir()}/gitea${exp}`)
  core.info(`Installed gitea into ${toolPath} in ${Date.now() - startedAt}ms`)
  run(`chmod +x ${toolPath}`)
  core.addPath(path.dirname(toolPath))
  core.exportVariable("OS_TMPDIR", path.dirname(toolPath))
  return toolPath
}

function run(command: string) {
  core.info(command)
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
if (inputVersion != "" && inputVersion.toLowerCase() != "latest") {
  installVersion = inputVersion
}

const args = core.getInput(`args`)
installGitea(installVersion)
  .then((toolPath) => {
    run(`${toolPath} ${args}`)
  })
  .catch((err) => {
    core.setFailed(`Error: ${err.message}`)
  })
