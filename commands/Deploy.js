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
const parser_1 = require("../parser");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
class Deploy {
    constructor() { }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, utils_1.execStreamPromise)(`git add -A && (git diff-index --quiet HEAD || git commit -m 'Deploy') && git push origin HEAD 2>&1`, utils_1.output);
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "deploy";
parser_1.argParser.push(CMD, {
    desc: "Short hand for git add, commit, and push",
    construct: (arg) => new Deploy(),
    flags: {},
    isRelevant: () => fs_1.default.existsSync("mist.json"),
});
