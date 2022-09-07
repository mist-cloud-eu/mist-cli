"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_utils_1 = require("../clone_utils");
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Clone {
    constructor(name) {
        this.name = name;
    }
    async execute() {
        try {
            let reply = await (0, utils_1.sshReq)(`clone ${this.name}`);
            if (!reply.startsWith("{")) {
                console.log(reply);
                return;
            }
            let structure = JSON.parse(reply);
            await (0, clone_utils_1.clone)(structure, this.name);
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("clone", {
    desc: "Download the code of an organization",
    arg: "name",
    construct: (arg) => new Clone(arg),
    flags: {},
});
