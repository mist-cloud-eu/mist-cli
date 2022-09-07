"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListUsers {
    constructor(params) {
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`list-users ${this.params.pending} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-users", {
    desc: "List the users of an organization",
    construct: (arg, params) => new ListUsers(params),
    flags: {
        pending: {
            desc: "Show only pending users",
            defaultValue: "",
            overrideValue: "--pending",
        },
    },
});
