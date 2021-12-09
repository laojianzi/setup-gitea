"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var tc = require("@actions/tool-cache");
var axios_1 = require("axios");
var child_process_1 = require("child_process");
var os = require("os");
var path = require("path");
var process = require("process");
var downloadURL = "https://dl.gitea.io/gitea";
var getAssetURL = function (version) {
    var platform = os.platform().toString();
    switch (platform) {
        case "win32":
            platform = "windows";
            break;
    }
    var arch = os.arch();
    switch (arch) {
        case "x64":
            arch = "amd64";
            break;
        case "x32":
        case "ia32":
            arch = "386";
            break;
    }
    return "".concat(downloadURL, "/").concat(version, "/gitea-").concat(version, "-").concat(platform, "-").concat(arch);
};
var installGitea = function (version) { return __awaiter(void 0, void 0, void 0, function () {
    var startedAt, assetURL, toolPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                core.info("Installing gitea ".concat(version, "..."));
                startedAt = Date.now();
                assetURL = getAssetURL(version);
                core.info("Downloading ".concat(assetURL, " ..."));
                return [4 /*yield*/, tc.downloadTool(assetURL)];
            case 1:
                toolPath = _a.sent();
                core.info("Installed gitea into ".concat(toolPath, " in ").concat(Date.now() - startedAt, "ms"));
                core.addPath(path.dirname(toolPath));
                return [2 /*return*/];
        }
    });
}); };
function run(command) {
    console.log(command);
    var env = Object.assign({}, process.env);
    delete env.CI; // for Homebrew on macos-11.0
    (0, child_process_1.execSync)(command, { stdio: "inherit", env: env });
}
var versionURL = "https://dl.gitea.io/gitea/version.json";
var getLatestVersion = function () {
    var version = "1.15.7";
    axios_1["default"]
        .get(versionURL)
        .then(function (res) {
        version = res.data.latest.version;
    })["catch"](function (err) {
        core.setFailed("Error: ".concat(err.message));
    });
    return version;
};
var installVersion = getLatestVersion();
var inputVersion = core.getInput("gitea-version");
if (inputVersion != "") {
    installVersion = inputVersion;
}
installGitea(installVersion);
run("gitea --version");
