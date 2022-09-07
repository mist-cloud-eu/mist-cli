"use strict";
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
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            if (team === null)
                throw "Cannot manage services in organization root. First create a team.";
            await this.params.delete.execute(this.name, team, this.params.private, org, this.params.template);
        }
        catch (e) {
            throw e;
        }
    }
}
class NoTemplate {
    async execute(repoBase, name) {
        try {
            await (0, utils_1.execPromise)(`git clone -q "${repoBase}/${name}" ${name}`);
            // await execPromise(`git init ${name}`);
            // await execPromise(`git remote add origin ${repoBase}/${name}`, name);
        }
        catch (e) {
            throw e;
        }
    }
}
class Template {
    constructor(name) {
        this.name = name;
    }
    async execute(repoBase, name) {
        try {
            await (0, utils_1.execPromise)(`git clone -q "${repoBase}/${this.name}" ${name}`);
            await (0, utils_1.execPromise)(`git remote set-url origin ${repoBase}/${name}`, name);
        }
        catch (e) {
            throw e;
        }
    }
}
class NoDeleteService {
    async execute(name, team, priv, org, template) {
        try {
            console.log(await (0, utils_1.sshReq)(`service ${name} --team ${team} --org ${org.name} ${priv}`));
            let repoBase = `${config_1.GIT_HOST}/${org.name}/${team}`;
            await template.execute(repoBase, name);
        }
        catch (e) {
            throw e;
        }
    }
}
class DeleteService {
    async execute(name, team, priv, org, template) {
        try {
            console.log(await (0, utils_1.sshReq)(`service ${name} --team ${team} --org ${org.name} --delete`));
            // fs.rmSync(name, { recursive: true, force: true });
            if (fs_1.default.existsSync(name))
                fs_1.default.renameSync(name, `(deleted) ${name}`);
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("service", {
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
});
