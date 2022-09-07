"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListCapabilities {
    constructor(role) {
        this.role = role;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`list-capabilities ${this.role} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-capabilities", {
    desc: "List the capabilities of a role",
    arg: "role",
    construct: (arg, params) => new ListCapabilities(arg),
    flags: {},
});
