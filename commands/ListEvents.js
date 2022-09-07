"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListEvents {
    constructor(key) {
        this.key = key;
    }
    async execute() {
        try {
            console.log(await (0, utils_1.sshReq)(`list-events ${this.key}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-events", {
    desc: "List the events of an api key",
    arg: "api key",
    construct: (arg, params) => new ListEvents(arg),
    flags: {},
});
