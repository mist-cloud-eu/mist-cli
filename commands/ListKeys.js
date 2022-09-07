"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListKeys {
    constructor() { }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`list-keys --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-keys", {
    desc: "List the keys of an organization",
    construct: (arg, params) => new ListKeys(),
    flags: {},
});
