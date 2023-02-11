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
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                if (team !== null)
                    throw "Must be in the organization root.";
                this.params.delete.execute(this.name, this.params.user, org.name);
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class NoDeleteTeam {
    execute(name, user, org) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                fs_1.default.mkdirSync(name);
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`team ${name} ${user} --org ${org}`));
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class DeleteTeam {
    execute(name, user, org) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`team ${name} --delete --org ${org}`));
                if (fs_1.default.existsSync(name))
                    fs_1.default.renameSync(name, `(deleted) ${name}`);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "team";
parser_1.argParser.push(CMD, {
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
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null && team === null;
    },
});
