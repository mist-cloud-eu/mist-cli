"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Purge {
    constructor(params) {
        this.params = params;
    }
    async execute() {
        try {
            console.log(await (0, utils_1.sshReq)(`purge ${this.params.delete}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("purge", {
    desc: "Remove all ssh keys from current user",
    construct: (arg, params) => new Purge(params),
    flags: {
        delete: {
            desc: "Delete the user",
            defaultValue: "",
            overrideValue: "--delete",
        },
    },
});
