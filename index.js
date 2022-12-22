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
require("./commands/Capability");
require("./commands/Key");
require("./commands/Event");
require("./commands/Role");
require("./commands/Clone");
require("./commands/ListOrganizations");
require("./commands/ListCapabilities");
require("./commands/ListEvents");
require("./commands/ListKeys");
require("./commands/ListRoles");
require("./commands/ListSecrets");
require("./commands/ListServices");
require("./commands/ListTeams");
require("./commands/ListUsers");
require("./commands/Login");
require("./commands/Org");
require("./commands/Purge");
require("./commands/Run");
require("./commands/Service");
require("./commands/Secret");
require("./commands/Team");
require("./commands/Whoami");
require("./commands/Version");
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (process.argv[0].includes("node"))
        process.argv.splice(0, 1);
    process.argv.splice(0, 1);
    if (process.argv.length === 0 || process.argv[0] === "help") {
        console.log(parser_1.argParser.helpString(process.argv[1]));
    }
    else {
        let commands = parser_1.argParser.parse(process.argv);
        try {
            for (let i = 0; i < commands.length; i++)
                yield commands[i].execute();
        }
        catch (e) {
            console.log("ERROR", e);
        }
    }
}))().catch((err) => {
    console.log("ERROR", err);
});
