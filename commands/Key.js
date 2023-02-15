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
class Key {
    constructor(duration, params) {
        this.duration = duration;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                let cmd = [`key`, this.duration, `--org`, org.name];
                if (this.params.name !== "")
                    cmd.push(`--name`, this.params.name);
                if (this.params.update === "") {
                    let { key, expiry } = JSON.parse(yield (0, utils_1.sshReq)(...cmd));
                    (0, utils_1.output)(`${key} expires on ${new Date(expiry).toLocaleString()}.`);
                }
                else {
                    if (this.params.update !== "")
                        cmd.push(`--update`, this.params.update);
                    let { count, expiry } = JSON.parse(yield (0, utils_1.sshReq)(...cmd));
                    (0, utils_1.output)(`Updated ${count} keys to expire on ${new Date(expiry).toLocaleString()}.`);
                }
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "key";
parser_1.argParser.push(CMD, {
    desc: "Create an api key",
    arg: "duration",
    construct: (arg, params) => new Key(arg, params),
    flags: {
        update: {
            short: "u",
            desc: "Update the key",
            arg: "key",
            defaultValue: "",
            overrideValue: (s) => s,
        },
        name: {
            short: "n",
            desc: "Human readable name of key",
            arg: "name",
            defaultValue: "",
            overrideValue: (s) => s,
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
