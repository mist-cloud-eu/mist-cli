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
class Cron {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                let call = yield (0, utils_1.sshReq)(`cron`, this.name, this.params.overwrite, this.params.event, `--expr`, this.params.expr, `--org`, org.name);
                if (this.params.expr === "") {
                    (0, utils_1.output)(call);
                }
                else {
                    let { s, n } = JSON.parse(call);
                    (0, utils_1.output)(`Cron '${s}' set to run next time at ${new Date(n).toLocaleString()}`);
                }
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "cron";
parser_1.argParser.push(CMD, {
    desc: "Set a cron job trigger",
    arg: "name",
    construct: (arg, params) => new Cron(arg, params),
    flags: {
        expr: {
            short: "x",
            arg: "cron expression",
            overrideValue: (s) => s,
        },
        overwrite: {
            defaultValue: "",
            overrideValue: "--overwrite",
        },
        event: {
            short: "e",
            arg: "event",
            defaultValue: "",
            overrideValue: (s) => `--event ${s}`,
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return team !== null;
    },
});
