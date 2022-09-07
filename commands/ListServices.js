"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class ListServices {
    constructor(team) {
        this.team = team;
    }
    async execute() {
        try {
            let { org, team } = (0, utils_1.fetchOrg)();
            console.log(await (0, utils_1.sshReq)(`list-services ${this.team} --org ${org.name}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("list-services", {
    desc: "List the services of a team",
    arg: "team",
    construct: (arg, params) => new ListServices(arg),
    flags: {},
});
