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
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Role {
    constructor(role, params) {
        this.role = role;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`role`, this.role, this.params.delete, `--user`, this.params.user, `--org`, org.name));
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "role";
parser_1.argParser.push(CMD, {
    desc: "Create or assign a role",
    arg: "role",
    construct: (arg, params) => new Role(arg, params),
    flags: {
        user: {
            arg: "user",
            short: "u",
            desc: "Assign the role to a user",
            overrideValue: (s) => s,
        },
        delete: {
            desc: "Delete the role",
            defaultValue: "",
            overrideValue: "--delete",
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
