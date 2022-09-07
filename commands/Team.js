"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const fs_1 = __importDefault(require("fs"));
const parser_1 = require("../parser");
class Team {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            if (team !== null)
                throw "Must be in the organization root.";
            this.params.delete.execute(this.name, this.params.user, org.name);
        }
        catch (e) {
            throw e;
        }
    }
}
class NoDeleteTeam {
    async execute(name, user, org) {
        try {
            fs_1.default.mkdirSync(name);
            console.log(await (0, utils_1.sshReq)(`team ${name} ${user} --org ${org}`));
        }
        catch (e) {
            throw e;
        }
    }
}
class DeleteTeam {
    async execute(name, user, org) {
        try {
            console.log(await (0, utils_1.sshReq)(`team ${name} --delete --org ${org}`));
            if (fs_1.default.existsSync(name))
                fs_1.default.renameSync(name, `(deleted) ${name}`);
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("team", {
    desc: "Create a team",
    arg: "name",
    construct: (arg, params) => new Team(arg, params),
    flags: {
        user: {
            short: "u",
            arg: "email",
            desc: "Move user to team",
            defaultValue: "",
            overrideValue: (s) => `--user ${s}`,
        },
        delete: {
            desc: "Delete the team",
            defaultValue: new NoDeleteTeam(),
            overrideValue: new DeleteTeam(),
        },
    },
});
