"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Secret {
    constructor(set, params) {
        this.set = set;
        this.params = params;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            if (team === null)
                throw "Cannot manage secrets in organization root. First create a team.";
            console.log(await (0, utils_1.sshReq)(`secret ${this.set} ${this.params.overwrite} --org ${org.name} --team ${team}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("secret", {
    desc: "Set a secret accessible to our team's services",
    arg: "key:value",
    construct: (arg, params) => new Secret(arg, params),
    flags: {
        overwrite: {
            defaultValue: "",
            overrideValue: "--overwrite",
        },
    },
});
