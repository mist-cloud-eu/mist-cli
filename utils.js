"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrg = exports.urlReq = exports.partition = exports.sshReq = exports.execPromise = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const config_1 = require("./config");
function execPromise(cmd, cwd) {
    // console.log("Executing", cmd);
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
function fetchOrg() {
    if (fs_1.default.existsSync(".mist")) {
        if (!fs_1.default.existsSync(".mist/conf.json"))
            throw "Bad .mist folder";
        let org = JSON.parse("" + fs_1.default.readFileSync(`.mist/conf.json`));
        return { org, team: null, pathToRoot: "./" };
    }
    let cwd = process.cwd().split(/\/|\\/);
    let out = "";
    let folder = "/";
    let team = null;
    for (let i = cwd.length - 1; i >= 0; i--) {
        if (fs_1.default.existsSync(out + "../.mist")) {
            team = cwd[i];
            if (!fs_1.default.existsSync(`${out}../.mist/conf.json`))
                throw "Bad .mist folder";
            let org = (JSON.parse("" + fs_1.default.readFileSync(`${out}../.mist/conf.json`)));
            return { org, team, pathToRoot: out + "../" };
        }
        folder = "/" + cwd[i] + folder;
        out += "../";
    }
    throw "Not inside a mist organization";
}
exports.fetchOrg = fetchOrg;
