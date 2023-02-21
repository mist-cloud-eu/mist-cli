#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const utils_1 = require("./utils");
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, utils_1.checkVersion)();
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
