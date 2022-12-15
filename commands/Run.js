"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser");
const utils_1 = require("../utils");
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const project_type_detect_1 = require("@mist-cloud-eu/project-type-detect");
class Run {
    constructor(params) {
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { pathToRoot } = (0, utils_1.fetchOrg)();
                let teams = fs_1.default.readdirSync(pathToRoot);
                teams.splice(teams.indexOf(".mist"), 1);
                teams.splice(teams.indexOf("event-catalogue"), 1);
                const app = (0, express_1.default)();
                app.use(express_1.default.json());
                let hooks;
                app.post("/trace/:traceId/:event", (req, res) => {
                    let traceId = req.params.traceId;
                    let event = req.params.event;
                    let payload = req.body;
                    runService(this.params.port, event, payload, traceId, hooks);
                    res.send("Done");
                });
                app.post("/rapids/:event", (req, res) => __awaiter(this, void 0, void 0, function* () {
                    hooks = new PublicHooks(pathToRoot);
                    processFolders(pathToRoot, teams, hooks);
                    let event = req.params.event;
                    let payload = req.body;
                    let traceId = "s" + Math.random();
                    let response = yield runWithReply(this.params.port, res, event, payload, traceId, hooks);
                }));
                app.get("/rapids", (req, res) => {
                    res.send("Running...");
                });
                app.listen(this.params.port, () => {
                    console.log("");
                    console.log("              .8.                               8                        8 ");
                    console.log('              "8"           od8                 8                        8 ');
                    console.log("                            888                 8                        8 ");
                    console.log("88d88b.d88b.  888 .d8888b 88888888       .d88b. 8  .d88b.  8     8  .d8888 ");
                    console.log('888 "888 "88b 888 88K       888         d"    " 8 d"    "b 8     8 d"    8 ');
                    console.log('888  888  888 888 "Y8888b.  888  888888 8       8 8      8 8     8 8     8 ');
                    console.log("888  888  888 888      X88  Y8b. .      Y.    . 8 Y.    .P Y.    8 Y.    8 ");
                    console.log('888  888  888 888  88888P\'  "Y888Y       "Y88P" 8  "Y88P"   "Y88"8  "Y88"8 ');
                    console.log("");
                    console.log(`Running local Rapids on http://localhost:${this.params.port}/rapids`);
                    console.log(`To exit, press ctrl+c`);
                    console.log("");
                });
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const MAX_WAIT = 30000;
const Reset = "\x1b[0m";
const FgRed = "\x1b[31m";
let pendingReplies = {};
class PublicHooks {
    constructor(pathToRoot) {
        this.hooks = {};
        this.publicEvents = JSON.parse("" + fs_1.default.readFileSync(`${pathToRoot}/event-catalogue/api.json`));
    }
    register(event, river, hook) {
        var _a, _b;
        let evt = this.hooks[event] ||
            (this.hooks[event] = {
                replyCount: (_a = this.publicEvents[event]) === null || _a === void 0 ? void 0 : _a.replyCount,
                waitFor: (_b = this.publicEvents[event]) === null || _b === void 0 ? void 0 : _b.waitFor,
                hooks: {},
            });
        let rvr = evt.hooks[river] || (evt.hooks[river] = []);
        rvr.push(hook);
    }
    riversFor(event) {
        return this.hooks[event];
    }
}
const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const DEFAULT_TIMEOUT = 5 * MINUTES;
function processFolder(folder, hooks) {
    if (fs_1.default.existsSync(`${folder}/mist.json`)) {
        let projectType = (0, project_type_detect_1.detectProjectType)(folder);
        let cmd = project_type_detect_1.RUN_COMMAND[projectType](folder);
        let config = JSON.parse("" + fs_1.default.readFileSync(`${folder}/mist.json`));
        Object.keys(config.hooks).forEach((k) => {
            let [river, event] = k.split("/");
            let hook = config.hooks[k];
            let action, timeout_milliseconds;
            if (typeof hook === "object") {
                action = hook.action;
                timeout_milliseconds = hook.timeout || DEFAULT_TIMEOUT;
            }
            else {
                action = hook;
                timeout_milliseconds = DEFAULT_TIMEOUT;
            }
            hooks.register(event, river, {
                action,
                dir: folder.replace(/\/\//g, "/"),
                cmd,
            });
        });
    }
    else if (fs_1.default.lstatSync(folder).isDirectory()) {
        processFolders(folder, fs_1.default.readdirSync(folder), hooks);
    }
}
function processFolders(prefix, folders, hooks) {
    folders.forEach((folder) => processFolder(prefix + folder + "/", hooks));
}
let spacerTimer;
function output(str) {
    if (spacerTimer !== undefined)
        clearTimeout(spacerTimer);
    console.log(str);
    spacerTimer = setTimeout(() => console.log(""), 10000);
}
function runService(port, event, payload, traceId, hooks) {
    var _a;
    let rs = pendingReplies[traceId];
    if (event === "reply" && rs !== undefined) {
        rs.replies.push(payload);
        if (rs.count !== undefined && rs.replies.length >= rs.count) {
            delete pendingReplies[traceId];
            reply(rs.resp, HTTP.SUCCESS.REPLY(rs.replies));
        }
    }
    let rivers = (_a = hooks.riversFor(event)) === null || _a === void 0 ? void 0 : _a.hooks;
    if (rivers === undefined)
        return;
    let messageId = "m" + Math.random();
    let envelope = `'${JSON.stringify({
        payload: JSON.stringify(payload),
        messageId,
        traceId,
    })}'`;
    Object.keys(rivers).forEach((river) => {
        let services = rivers[river];
        let service = services[~~(Math.random() * services.length)];
        let [cmd, ...rest] = service.cmd.split(" ");
        const args = [...rest, service.action, envelope];
        const options = {
            cwd: service.dir,
            env: Object.assign(Object.assign({}, process.env), { RAPIDS: `http://localhost:${port}/trace/${traceId}` }),
            shell: "sh",
        };
        if (process.env["DEBUG"])
            console.log(cmd, args);
        let ls = (0, child_process_1.spawn)(cmd, args, options);
        ls.stdout.on("data", (data) => {
            output(service.dir + (": " + data).trimEnd());
        });
        ls.stderr.on("data", (data) => {
            output(FgRed + service.dir + (": " + data).trimEnd() + Reset);
        });
    });
}
var HTTP;
(function (HTTP) {
    let SUCCESS;
    (function (SUCCESS) {
        SUCCESS.REPLY = (data) => ({ code: 200, data });
        SUCCESS.QUEUE_JOB = { code: 200, data: "Queued" };
    })(SUCCESS = HTTP.SUCCESS || (HTTP.SUCCESS = {}));
    let CLIENT_ERROR;
    (function (CLIENT_ERROR) {
        CLIENT_ERROR.TIMEOUT_JOB = { code: 400, data: "Job timed out" };
        CLIENT_ERROR.NO_HOOKS = { code: 400, data: "Event has no hooks" };
    })(CLIENT_ERROR = HTTP.CLIENT_ERROR || (HTTP.CLIENT_ERROR = {}));
})(HTTP || (HTTP = {}));
function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}
function reply(res, response) {
    res.status(response.code).send(response.data);
}
function runWithReply(port, resp, event, payload, traceId, hooks) {
    return __awaiter(this, void 0, void 0, function* () {
        let rivers = hooks.riversFor(event);
        if (rivers === undefined)
            return reply(resp, HTTP.CLIENT_ERROR.NO_HOOKS);
        runService(port, event, payload, traceId, hooks);
        pendingReplies[traceId] = { resp, replies: [], count: rivers.replyCount };
        if (rivers.replyCount !== undefined) {
            yield sleep(rivers.waitFor || MAX_WAIT);
            let rs = pendingReplies[traceId];
            if (rs !== undefined) {
                delete pendingReplies[traceId];
                reply(resp, HTTP.SUCCESS.REPLY(rs.replies));
            }
        }
        else if (rivers.waitFor !== undefined) {
            yield sleep(rivers.waitFor);
            let rs = pendingReplies[traceId];
            delete pendingReplies[traceId];
            reply(resp, HTTP.SUCCESS.REPLY(rs.replies));
        }
        else {
            delete pendingReplies[traceId];
            reply(resp, HTTP.SUCCESS.QUEUE_JOB);
        }
    });
}
parser_1.argParser.push("run", {
    desc: "Run system locally",
    construct: (arg, params) => new Run(params),
    flags: {
        port: {
            short: "p",
            desc: "Set which port to run local rapids on",
            defaultValue: 3000,
            arg: "port",
            overrideValue: (s) => +s,
        },
    },
});
