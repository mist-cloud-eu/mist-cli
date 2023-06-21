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
const config_1 = require("../config");
const utils_1 = require("../utils");
const fs_1 = __importDefault(require("fs"));
const parser_1 = require("../parser");
class Service {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrg)();
                if (team === null)
                    throw "Cannot manage services in organization root. First create a team.";
                yield this.params.delete.execute(this.name, team, this.params.private, org, this.params.template);
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class NoTemplate {
    execute(repoBase, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, utils_1.execPromise)(`git clone -q "${repoBase}/${name}" ${name}`);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class Template {
    constructor(name) {
        this.name = name;
    }
    execute(repoBase, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, utils_1.execPromise)(`git clone -q "${repoBase}/${this.name}" ${name}`);
                yield (0, utils_1.execPromise)(`git remote set-url origin ${repoBase}/${name}`, name);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class NoDeleteService {
    execute(name, team, priv, org, template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`service`, name, `--team`, team, `--org`, org.name, priv));
                let repoBase = `${config_1.GIT_HOST}/${org.name}/${team}`;
                yield template.execute(repoBase, name);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class DeleteService {
    execute(name, team, priv, org, template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`service`, name, `--team`, team, `--org`, org.name, `--delete`));
                // fs.rmSync(name, { recursive: true, force: true });
                if (fs_1.default.existsSync(name))
                    fs_1.default.renameSync(name, `(deleted) ${name}`);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "service";
parser_1.argParser.push(CMD, {
    desc: "Create a service",
    arg: "name",
    construct: (arg, params) => new Service(arg, params),
    flags: {
        private: {
            short: "p",
            desc: "Make the service team private",
            defaultValue: "",
            overrideValue: "--private",
        },
        template: {
            short: "t",
            desc: "Initialize repo based on template",
            arg: "template",
            defaultValue: new NoTemplate(),
            overrideValue: (s) => new Template(s),
        },
        delete: {
            desc: "Delete the service",
            defaultValue: new NoDeleteService(),
            overrideValue: new DeleteService(),
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return team !== null && !fs_1.default.existsSync("mist.json");
    },
});
