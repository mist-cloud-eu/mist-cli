"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.addToHistory = exports.printTable = exports.output = exports.fetchOrg = exports.fetchOrgRaw = exports.urlReq = exports.partition = exports.sshReq = exports.execStreamPromise = exports.execPromise = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const config_1 = require("./config");
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
function sshReq(cmd) {
    return execPromise(`ssh mist@${config_1.SSH_HOST} "${cmd}"`);
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
function fetchOrgRaw() {
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
exports.fetchOrgRaw = fetchOrgRaw;
function fetchOrg() {
    let res = fetchOrgRaw();
    if (res.org === null)
        throw "Not inside a mist organization";
    return res;
}
exports.fetchOrg = fetchOrg;
function output(str) {
    console.log(str
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
        header += k.trim().padEnd(widths[k]) + " | ";
    });
    output(header);
    let divider = "";
    Object.keys(widths).forEach((k) => {
        divider += "-".repeat(widths[k]) + "-+-";
    });
    output(divider);
    mapped.forEach((row) => {
        let result = "";
        Object.keys(widths).forEach((k) => {
            if (k.startsWith(" "))
                result += row[k].padStart(widths[k]) + " | ";
            else
                result += row[k].padEnd(widths[k]) + " | ";
        });
        output(result);
    });
}
exports.printTable = printTable;
const historyFolder = os_1.default.homedir() + "/.mist/";
const historyFile = "history";
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
