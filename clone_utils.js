"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const utils_1 = require("./utils");
async function clone(struct, name) {
    try {
        console.log(`Cloning ${name}...`);
        fs_1.default.mkdirSync(`${name}/.mist`, { recursive: true });
        let orgFile = { name };
        fs_1.default.writeFileSync(`${name}/.mist/conf.json`, JSON.stringify(orgFile));
        await (0, utils_1.execPromise)(`git clone -q "${config_1.GIT_HOST}/${name}/events" events`, name);
        Object.keys(struct).forEach((team) => {
            fs_1.default.mkdirSync(`${name}/${team}`, { recursive: true });
            createFolderStructure(struct[team], `${name}/${team}`, name, team);
        });
    }
    catch (e) {
        throw e;
    }
}
exports.clone = clone;
function createFolderStructure(struct, prefix, org, team) {
    Object.keys(struct).forEach(async (k) => {
        if (struct[k] instanceof Object)
            createFolderStructure(struct[k], prefix + "/" + k, org, team);
        else {
            // console.log(`git clone "${HOST}/${org}/${team}/${k}" "${prefix}/${k}"`);
            let repo = `"${config_1.GIT_HOST}/${org}/${team}/${k}"`;
            let dir = `${prefix}/${k}`;
            try {
                fs_1.default.mkdirSync(`${dir}`, { recursive: true });
                await (0, utils_1.execPromise)(`git init`, dir);
                await (0, utils_1.execPromise)(`git remote add origin ${repo}`, dir);
                await fs_1.default.writeFile(dir + "/fetch.bat", `@echo off
git fetch
git reset --hard origin/master
(goto) 2>nul & del "%~f0"`, () => { });
            }
            catch (e) {
                console.log(e);
            }
        }
    });
}
