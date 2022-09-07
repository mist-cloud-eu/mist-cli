"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Event {
    constructor(event, params) {
        this.event = event;
        this.params = params;
    }
    async execute() {
        try {
            console.log(await (0, utils_1.sshReq)(`event ${this.event} ${this.params.delete} --key ${this.params.key}`));
        }
        catch (e) {
            throw e;
        }
    }
}
parser_1.argParser.push("event", {
    desc: "Give api key permission to receive specific event type",
    arg: "event",
    construct: (arg, params) => new Event(arg, params),
    flags: {
        key: {
            arg: "key",
            short: "k",
            overrideValue: (s) => s,
        },
        delete: {
            desc: "Disallow event of key",
            defaultValue: "",
            overrideValue: "--delete",
        },
    },
});
