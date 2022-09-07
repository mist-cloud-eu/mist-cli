"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_utils_1 = require("../clone_utils");
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Org {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }
    execute() {
        return this.params.delete.execute(this.name, this.params.join);
    }
}
class CreateOrganization {
    async execute(name) {
        try {
            let reply = await (0, utils_1.sshReq)(`org ${name}`);
            if (!reply.startsWith("{")) {
                console.log(reply);
                return;
            }
            let structure = JSON.parse(reply);
            await (0, clone_utils_1.clone)(structure, name);
        }
        catch (e) {
            throw e;
        }
    }
}
class JoinOrganization {
    async execute(name) {
        try {
            console.log(await (0, utils_1.sshReq)(`org ${name} --join`));
        }
        catch (e) {
            throw e;
        }
    }
}
class NoDeleteOrganization {
    execute(name, join) {
        return join.execute(name);
    }
}
class DeleteOrganization {
    async execute(name, join) {
        try {
            console.log(await (0, utils_1.sshReq)(`org ${name} --delete`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("org", {
    desc: "Create an organization",
    arg: "name",
    construct: (arg, params) => new Org(arg, params),
    flags: {
        join: {
            short: "j",
            desc: "Join an existing organization",
            defaultValue: new CreateOrganization(),
            overrideValue: new JoinOrganization(),
        },
        delete: {
            desc: "Delete the organization",
            defaultValue: new NoDeleteOrganization(),
            overrideValue: new DeleteOrganization(),
        },
    },
});
