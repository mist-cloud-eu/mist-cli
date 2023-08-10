"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVersion = exports.getHistory = exports.addToHistory = exports.fastPrintTable = exports.printTable = exports.output = exports.fetchOrg = exports.fetchOrgRaw_internal = exports.fetchOrgRaw = exports.urlReq = exports.partition = exports.sshReq = exports.execStreamPromise = exports.execPromise = exports.typedKeys = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const config_1 = require("./config");
const conf = __importStar(require("./package.json"));
function typedKeys(o) {
    return Object.keys(o);
}
exports.typedKeys = typedKeys;
function execPromise(cmd, cwd) {
    // output("Executing", cmd);
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, { cwd }, (error, stdout, stderr) => {
            let err = (error === null || error === void 0 ? void 0 : error.message) || stderr;
            if (err) {
                reject(stderr || stdout);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
exports.execPromise = execPromise;
function execStreamPromise(full, onData, cwd) {
    return new Promise((resolve, reject) => {
        let [cmd, ...args] = full.split(" ");
        let p = (0, child_process_1.spawn)(cmd, args, { cwd, shell: "sh" });
        p.stdout.on("data", (data) => {
            onData(data.toString());
        });
        p.stderr.on("data", (data) => {
            console.log(data.toString());
        });
        p.on("exit", (code) => {
            if (code !== 0)
                reject();
            else
                resolve();
        });
    });
}
exports.execStreamPromise = execStreamPromise;
function sshReqInternal(cmd) {
    return execPromise(`ssh mist@${config_1.SSH_HOST} "${cmd}"`);
}
function sshReq(...cmd) {
    return sshReqInternal(cmd
        .map((x) => (x.length === 0 || x.includes(" ") ? `\\"${x}\\"` : x))
        .join(" "));
}
exports.sshReq = sshReq;
function partition(str, radix) {
    let index = str.indexOf(radix);
    if (index < 0)
        return [str, ""];
    return [str.substring(0, index), str.substring(index + radix.length)];
}
exports.partition = partition;
function urlReq(url, method = "GET", body) {
    return new Promise((resolve, reject) => {
        let [protocol, fullPath] = url.indexOf("://") >= 0 ? partition(url, "://") : ["http", url];
        let [base, path] = partition(fullPath, "/");
        let [host, port] = partition(base, ":");
        let data = JSON.stringify(body);
        let headers;
        if (body !== undefined)
            headers = {
                "Content-Type": "application/json",
                "Content-Length": data.length,
            };
        let sender = protocol === "http" ? http_1.default : https_1.default;
        let req = sender.request({
            host,
            port,
            path: "/" + path,
            method,
            headers,
        }, (resp) => {
            let str = "";
            resp.on("data", (chunk) => {
                str += chunk;
            });
            resp.on("end", () => {
                resolve(str);
            });
        });
        req.on("error", (e) => {
            reject(`Unable to connect to ${host}. Please verify your internet connection.`);
        });
        if (data !== undefined)
            req.write(data);
        req.end();
    });
}
exports.urlReq = urlReq;
let fetchOrgRaw_cache = null;
function fetchOrgRaw() {
    if (fetchOrgRaw_cache === null) {
        fetchOrgRaw_cache = fetchOrgRaw_internal();
    }
    return fetchOrgRaw_cache;
}
exports.fetchOrgRaw = fetchOrgRaw;
function fetchOrgRaw_internal() {
    if (fs_1.default.existsSync(".mist/conf.json")) {
        let org = JSON.parse("" + fs_1.default.readFileSync(`.mist/conf.json`));
        return { org, team: null, pathToRoot: "./" };
    }
    let cwd = process.cwd().split(/\/|\\/);
    let out = "";
    let folder = "/";
    let team = null;
    for (let i = cwd.length - 1; i >= 0; i--) {
        if (fs_1.default.existsSync(out + "../.mist/conf.json")) {
            team = cwd[i];
            let org = (JSON.parse("" + fs_1.default.readFileSync(`${out}../.mist/conf.json`)));
            return { org, team, pathToRoot: out + "../" };
        }
        folder = "/" + cwd[i] + folder;
        out += "../";
    }
    return { org: null, team: null, pathToRoot: null };
}
exports.fetchOrgRaw_internal = fetchOrgRaw_internal;
function fetchOrg() {
    let res = fetchOrgRaw();
    if (res.org === null)
        throw "Not inside a mist organization";
    return res;
}
exports.fetchOrg = fetchOrg;
function output(str) {
    console.log((str || "")
        .trimEnd()
        .split("\n")
        .map((x) => x.trimEnd())
        .join("\n"));
}
exports.output = output;
function printTable(data, transform) {
    let widths = {};
    Object.keys(transform).forEach((k) => {
        widths[k] = k.trim().length;
    });
    let mapped = data.map((row) => {
        let result = {};
        Object.keys(transform).forEach((k) => {
            result[k] = transform[k](row);
            widths[k] = Math.max(widths[k], result[k].length);
        });
        return result;
    });
    let header = "";
    Object.keys(widths).forEach((k) => {
        header += k.trim().padEnd(widths[k]) + " │ ";
    });
    output(header);
    let divider = "";
    Object.keys(widths).forEach((k) => {
        divider += "─".repeat(widths[k]) + "─┼─";
    });
    output(divider);
    mapped.forEach((row) => {
        let result = "";
        Object.keys(widths).forEach((k) => {
            if (k.startsWith(" "))
                result += row[k].padStart(widths[k]) + " │ ";
            else
                result += row[k].padEnd(widths[k]) + " │ ";
        });
        output(result);
    });
}
exports.printTable = printTable;
function fastPrintTable(data, headers) {
    if (data.length > 0) {
        let widths = {};
        Object.keys(headers !== undefined ? headers : data[0]).forEach((k) => (widths[k] = (headers !== undefined ? headers[k] : k).length));
        const SAMPLES = 5;
        for (let i = 0; i < SAMPLES; i++) {
            let x = ~~(Math.random() * data.length);
            Object.keys(data[x]).forEach((k) => (widths[k] = Math.max(widths[k], ("" + data[x][k]).length)));
        }
        output(Object.keys(headers !== undefined ? headers : data[0])
            .map((k) => (headers !== undefined ? headers[k] : k).padEnd(widths[k]))
            .join(" │ "));
        output(Object.keys(headers !== undefined ? headers : data[0])
            .map((k) => "─".repeat(widths[k]))
            .join("─┼─"));
        data.forEach((x) => output(Object.keys(headers !== undefined ? headers : x)
            .map((k) => formatToWidth("" + x[k], widths[k]))
            .join(" │ ")));
    }
    output(`Rows: ${data.length}`);
}
exports.fastPrintTable = fastPrintTable;
const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;
function formatToWidth(str, width) {
    var timestamp = Date.parse(str);
    if (!isNaN(timestamp) && Math.abs(Date.now() - timestamp) < YEAR)
        return new Date(str).toLocaleString().padEnd(width);
    else if (str === null)
        return " ".repeat(width);
    else if (str.length > width)
        return str.substring(0, width - 3) + "...";
    else if (Number.isNaN(+str))
        return str.padEnd(width);
    else
        return str.padStart(width);
}
const historyFolder = os_1.default.homedir() + "/.mist/";
const historyFile = "history";
const updateFile = "last_update_check";
function addToHistory(str) {
    if (!fs_1.default.existsSync(historyFolder))
        fs_1.default.mkdirSync(historyFolder);
    fs_1.default.appendFileSync(historyFolder + historyFile, str.trimEnd() + "\n");
}
exports.addToHistory = addToHistory;
function getHistory() {
    if (!fs_1.default.existsSync(historyFolder + historyFile))
        return [];
    return ("" + fs_1.default.readFileSync(historyFolder + historyFile)).split("\n");
}
exports.getHistory = getHistory;
function versionIsOlder(old, new_) {
    let os = old.split(".");
    let ns = new_.split(".");
    if (+os[0] < +ns[0])
        return true;
    else if (+os[0] > +ns[0])
        return false;
    else if (+os[1] < +ns[1])
        return true;
    else if (+os[1] > +ns[1])
        return false;
    else if (+os[2] < +ns[2])
        return true;
    return false;
}
function checkVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(historyFolder))
            fs_1.default.mkdirSync(historyFolder);
        let lastCheck = fs_1.default.existsSync(historyFolder + updateFile)
            ? +fs_1.default.readFileSync(historyFolder + updateFile).toString()
            : 0;
        if (Date.now() - lastCheck > 4 * 60 * 60 * 1000) {
            try {
                let call = yield execPromise("npm show @mist-cloud-eu/mist-cli dist-tags --json");
                let version = JSON.parse(call);
                if (versionIsOlder(conf.version, version.latest)) {
                    output("New version of mist-cli available, to update run the command:");
                    output("    npm update -g @mist-cloud-eu/mist-cli");
                }
            }
            catch (e) { }
            fs_1.default.writeFileSync(historyFolder + updateFile, "" + Date.now());
        }
    });
}
exports.checkVersion = checkVersion;
