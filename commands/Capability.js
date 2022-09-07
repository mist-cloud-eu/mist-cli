"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Capability {
    constructor(capability, params) {
        this.capability = capability;
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`capability ${this.capability} --role ${this.params.role} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("capability", {
    desc: "Add a capability to a role",
    arg: "capability",
    construct: (arg, params) => new Capability(arg, params),
    flags: {
        role: {
            arg: "role",
            short: "r",
            overrideValue: (s) => s,
        },
    },
});
