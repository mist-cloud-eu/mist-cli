#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const utils_1 = require("./utils");
const conf = __importStar(require("./package.json"));
require("./commands/Build");
require("./commands/Capability");
require("./commands/Clone");
require("./commands/Cron");
require("./commands/Deploy");
require("./commands/Event");
require("./commands/Inspect");
require("./commands/Key");
require("./commands/ListCapabilities");
require("./commands/ListCrons");
require("./commands/ListEvents");
require("./commands/ListKeys");
require("./commands/ListOrganizations");
require("./commands/ListRoles");
require("./commands/ListSecrets");
require("./commands/ListServices");
require("./commands/ListTeams");
require("./commands/ListUsers");
require("./commands/Login");
require("./commands/Org");
require("./commands/Purge");
require("./commands/Queue");
require("./commands/Role");
require("./commands/Run");
require("./commands/Secret");
require("./commands/Service");
require("./commands/Signup");
require("./commands/Spending");
require("./commands/Team");
require("./commands/Version");
require("./commands/Whoami");
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let call = yield (0, utils_1.execPromise)("npm show @mist-cloud-eu/mist-cli dist-tags --json");
        let version = JSON.parse(call);
        if (versionIsOlder(conf.version, version.latest)) {
            (0, utils_1.output)("New version of mist-cli available, to update run the command:");
            (0, utils_1.output)("    npm update -g @mist-cloud-eu/mist-cli");
        }
    }
    catch (e) { }
    if (process.argv[0].includes("node"))
        process.argv.splice(0, 1);
    process.argv.splice(0, 1);
    if (process.argv.length === 0 || process.argv[0] === "help") {
        (0, utils_1.output)(parser_1.argParser.helpString(process.argv[1]));
    }
    else {
        let commands = parser_1.argParser.parse(process.argv);
        try {
            for (let i = 0; i < commands.length; i++)
                yield commands[i].execute();
        }
        catch (e) {
            console.log("\x1b[31mERROR %s\x1b[0m", e);
        }
    }
}))().catch((e) => {
    console.log("\x1b[31mERROR %s\x1b[0m", e);
});
