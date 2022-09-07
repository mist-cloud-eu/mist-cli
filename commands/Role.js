"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Role {
    constructor(role, params) {
        this.role = role;
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`role ${this.role} ${this.params.delete} --user ${this.params.user} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("role", {
    desc: "Create a role",
    arg: "role",
    construct: (arg, params) => new Role(arg, params),
    flags: {
        user: {
            arg: "user",
            short: "u",
            desc: "Assign the role to a user",
            overrideValue: (s) => s,
        },
        delete: {
            desc: "Delete the role",
            defaultValue: "",
            overrideValue: "--delete",
        },
    },
});
