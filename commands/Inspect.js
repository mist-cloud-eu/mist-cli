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
class Inspect {
    constructor(id, params) {
        this.id = id;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                let res = JSON.parse(yield (0, utils_1.sshReq)(`inspect`, this.id, `--river`, this.params.river, `--org`, `${org.name}`));
                let resout = res.output;
                delete res.output;
                console.log(res);
                (0, utils_1.output)("Output:");
                (0, utils_1.output)(resout);
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "inspect";
parser_1.argParser.push(CMD, {
    desc: "Show detailed information about an event",
    arg: "id",
    construct: (arg, params) => new Inspect(arg, params),
    flags: {
        river: {
            short: "r",
            arg: "river",
            overrideValue: (s) => s,
        },
    },
    example: "inspect def52a --river init",
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
