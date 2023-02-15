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
class Secret {
    constructor(key, params) {
        this.key = key;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                if (team === null)
                    throw "Cannot manage secrets in organization root. First create a team.";
                if (this.params.prod === "" && this.params.test === "")
                    throw "Secret should be set in --prod, --test, or both.";
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`secret`, this.key, this.params.overwrite, this.params.prod, this.params.test, `--org`, org.name, `--team`, team, `--value`, this.params.value));
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "secret";
parser_1.argParser.push(CMD, {
    desc: "Set a secret environment variable accessible to the team's services",
    arg: "key",
    construct: (arg, params) => new Secret(arg, params),
    flags: {
        value: {
            short: "v",
            arg: "value",
            defaultValue: "",
            overrideValue: (s) => s,
        },
        overwrite: {
            defaultValue: "",
            overrideValue: "--overwrite",
        },
        prod: {
            defaultValue: "",
            overrideValue: "--prod",
        },
        test: {
            defaultValue: "",
            overrideValue: "--test",
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return team !== null;
    },
});
