"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Key {
    constructor(duration, params) {
        this.duration = duration;
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`key ${this.duration} ${this.params.update} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("key", {
    desc: "Create an api key",
    arg: "duration",
    construct: (arg, params) => new Key(arg, params),
    flags: {
        update: {
            desc: "Update the duration of a key",
            arg: "key",
            defaultValue: "",
            overrideValue: (s) => `--update ${s}`,
        },
    },
});
