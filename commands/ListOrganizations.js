"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListRoles {
    constructor() { }
    async execute() {
        try {
            console.log(await (0, utils_1.sshReq)(`list-organizations`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-organizations", {
    desc: "List the organization the current user has access to",
    construct: (arg, params) => new ListRoles(),
    flags: {},
});
