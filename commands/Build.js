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
const project_type_detect_1 = require("@mist-cloud-eu/project-type-detect");
const child_process_1 = require("child_process");
class Build {
    constructor(params) {
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.params.all.execute();
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class All {
    execute() {
        (0, utils_1.output)("Todo");
    }
}
class One {
    execute() {
        if (!fs_1.default.existsSync("mist.json"))
            throw "Either go into a service folder or use --all flag";
        let projectType = (0, project_type_detect_1.detectProjectType)(".");
        project_type_detect_1.BUILD_SCRIPT_MAKERS[projectType](".").forEach((x) => {
            let [cmd, ...args] = x.split(" ");
            const options = {
                shell: "sh",
            };
            if (process.env["DEBUG"])
                console.log(cmd, args);
            (0, utils_1.output)(`Building ${projectType} project...`);
            let ls = (0, child_process_1.spawn)(cmd, args, options);
            ls.stdout.on("data", (data) => {
                (0, utils_1.output)(data.toString());
            });
            ls.stderr.on("data", (data) => {
                (0, utils_1.output)(data.toString());
            });
        });
    }
}
const CMD = "build";
parser_1.argParser.push(CMD, {
    desc: "Build a service like it will be built on mist-cloud",
    construct: (arg, params) => new Build(params),
    flags: {
        all: {
            short: "a",
            defaultValue: new One(),
            overrideValue: new All(),
        },
    },
    isRelevant: () => fs_1.default.existsSync("mist.json"),
});
