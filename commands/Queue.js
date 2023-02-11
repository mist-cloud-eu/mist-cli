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
class Queue {
    constructor(count, params) {
        this.count = count;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                let data = JSON.parse(yield (0, utils_1.sshReq)(`queue ${this.count} --org ${org.name}`));
                (0, utils_1.printTable)(data, {
                    "Message id": (x) => x.id,
                    Event: (x) => x.e,
                    River: (x) => x.r,
                    Status: (x) => x.s,
                });
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "queue";
parser_1.argParser.push(CMD, {
    desc: "Show status of queued requests",
    arg: "count",
    construct: (arg, params) => new Queue(arg, params),
    flags: {},
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
