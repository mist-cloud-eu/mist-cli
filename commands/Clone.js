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
const clone_utils_1 = require("../clone_utils");
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Clone {
    constructor(name) {
        this.name = name;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let reply = yield (0, utils_1.sshReq)(`clone ${this.name}`);
                if (!reply.startsWith("{")) {
                    console.log(reply);
                    return;
                }
                let structure = JSON.parse(reply);
                yield (0, clone_utils_1.clone)(structure, this.name);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
parser_1.argParser.push("clone", {
    desc: "Download the code of an organization",
    arg: "name",
    construct: (arg) => new Clone(arg),
    flags: {},
});
