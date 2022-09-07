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
                console.log(yield (0, utils_1.sshReq)(`key ${this.duration} ${this.params.update} --org ${org.name}`));
            }
            catch (e) {
                throw e;
            }
        });
    }
}
parser_1.argParser.push("key", {
    desc: "Create an api key",
    arg: "duration",
    construct: (arg, params) => new Key(arg, params),
    flags: {
        update: {
            desc: "Update the duration of a key",
            arg: "key",
            defaultValue: "",
            overrideValue: (s) => `--update ${s}`,
        },
    },
});
