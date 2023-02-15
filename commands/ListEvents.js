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
class ListEvents {
    constructor(params) {
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                let cmd = [`list-events`, `--org`, org.name];
                if (this.params.key !== "")
                    cmd.push(`--key`, this.params.key);
                (0, utils_1.fastPrintTable)(JSON.parse(yield (0, utils_1.sshReq)(...cmd)));
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "list-events";
parser_1.argParser.push(CMD, {
    desc: "List the events of an organization",
    construct: (arg, params) => new ListEvents(params),
    flags: {
        key: {
            short: "k",
            arg: "key",
            defaultValue: "",
            overrideValue: (s) => s,
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
