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
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const promises_1 = require("fs/promises");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const FILE_STORE_PATH = ".mist/filestore";
const TMP_FILE_STORE_PATH = ".mist/tmp";
const commonMimeTypes = {
    aac: ["audio/aac"],
    abw: ["application/x-abiword"],
    arc: ["application/x-freearc"],
    avif: ["image/avif"],
    avi: ["video/x-msvideo"],
    azw: ["application/vnd.amazon.ebook"],
    bin: ["application/octet-stream"],
    bmp: ["image/bmp"],
    bz: ["application/x-bzip"],
    bz2: ["application/x-bzip2"],
    cda: ["application/x-cdf"],
    csh: ["application/x-csh"],
    css: ["text/css"],
    csv: ["text/csv"],
    doc: ["application/msword"],
    docx: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    eot: ["application/vnd.ms-fontobject"],
    epub: ["application/epub+zip"],
    gz: ["application/gzip"],
    gif: ["image/gif"],
    htm: ["text/html"],
    html: ["text/html"],
    ico: ["image/vnd.microsoft.icon"],
    ics: ["text/calendar"],
    jar: ["application/java-archive"],
    jpeg: ["image/jpeg"],
    jpg: ["image/jpeg"],
    js: ["text/javascript"],
    json: ["application/json"],
    jsonld: ["application/ld+json"],
    mid: ["audio/midi, audio/x-midi"],
    midi: ["audio/midi, audio/x-midi"],
    mjs: ["text/javascript"],
    mp3: ["audio/mpeg"],
    mp4: ["video/mp4"],
    mpeg: ["video/mpeg"],
    mpkg: ["application/vnd.apple.installer+xml"],
    odp: ["application/vnd.oasis.opendocument.presentation"],
    ods: ["application/vnd.oasis.opendocument.spreadsheet"],
    odt: ["application/vnd.oasis.opendocument.text"],
    oga: ["audio/ogg"],
    ogv: ["video/ogg"],
    ogx: ["application/ogg"],
    opus: ["audio/opus"],
    otf: ["font/otf"],
    png: ["image/png"],
    pdf: ["application/pdf"],
    php: ["application/x-httpd-php"],
    ppt: ["application/vnd.ms-powerpoint"],
    pptx: [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    rar: ["application/vnd.rar"],
    rtf: ["application/rtf"],
    sh: ["application/x-sh"],
    svg: ["image/svg+xml"],
    tar: ["application/x-tar"],
    tif: ["image/tiff"],
    tiff: ["image/tiff"],
    ts: ["video/mp2t"],
    ttf: ["font/ttf"],
    txt: ["text/plain"],
    vsd: ["application/vnd.visio"],
    wav: ["audio/wav"],
    weba: ["audio/webm"],
    webm: ["video/webm"],
    webp: ["image/webp"],
    woff: ["font/woff"],
    woff2: ["font/woff2"],
    xhtml: ["application/xhtml+xml"],
    xls: ["application/vnd.ms-excel"],
    xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    xml: ["application/xml", "text/xml"],
    xul: ["application/vnd.mozilla.xul+xml"],
    zip: ["application/zip"],
    "3gp": ["video/3gpp", "audio/3gpp"],
    "3g2": ["video/3gpp2", "audio/3gpp2"],
    "7z": ["application/x-7z-compressed"],
};
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
                const server = http_1.default.createServer(app);
                this.io = new socket_io_1.Server(server);
                this.io.on("connection", (socket) => {
                    let traceId = socket.id;
                    this.runService(pathToRoot, this.params.port, "connected", Buffer.alloc(0), traceId, hooks, undefined);
                    socket.onAny((event, payload) => {
                        this.runService(pathToRoot, this.params.port, event, payload, traceId, hooks, undefined);
                    });
                });
                app.use((req, res, next) => {
                    if (req.is("multipart/form-data")) {
                        express_1.default.urlencoded({ extended: true })(req, res, next);
                    }
                    else {
                        express_1.default.raw({ type: "*/*", limit: "10mb" })(req, res, next);
                    }
                });
                const upload = (0, multer_1.default)({ dest: `${pathToRoot}/${TMP_FILE_STORE_PATH}` });
                app.use(upload.any());
                let hooks;
                app.post("/trace/:traceId/:event", (req, res) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        let traceId = req.params.traceId;
                        let event = req.params.event;
                        let payload = req.body;
                        this.runService(pathToRoot, this.params.port, event, payload, traceId, hooks, req.headers["content-type"]);
                        res.send("Done");
                    }
                    catch (e) {
                        if (e.data !== undefined)
                            console.log("" + e.data);
                        else
                            throw e;
                    }
                }));
                app.get("/rapids/:event", (req, res) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        let event = req.params.event;
                        hooks = new PublicHooks(pathToRoot);
                        let payload = Buffer.from(JSON.stringify(req.query));
                        processFolders(pathToRoot, teams, hooks);
                        let traceId = "s" + Math.random();
                        let response = yield this.runWithReply(pathToRoot, this.params.port, res, event, payload, traceId, hooks, req.headers["content-type"]);
                    }
                    catch (e) {
                        if (e.data !== undefined)
                            reply(res, e, undefined);
                        else
                            throw e;
                    }
                }));
                app.all("/rapids/:event", (req, res) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        let event = req.params.event;
                        hooks = new PublicHooks(pathToRoot);
                        let reqFiles = req.files;
                        let payload = !Buffer.isBuffer(req.body)
                            ? typeof req.body === "object"
                                ? Buffer.from(JSON.stringify(req.body))
                                : Buffer.from(req.body)
                            : req.body;
                        if (reqFiles !== undefined) {
                            let files;
                            if (Array.isArray(reqFiles)) {
                                files = reqFiles;
                            }
                            else {
                                let rf = reqFiles;
                                files = (0, utils_1.typedKeys)(rf).flatMap((x) => rf[x]);
                            }
                            yield hooks.validateFiles(pathToRoot, event, files);
                            payload = Buffer.from(JSON.stringify({
                                files: files.map((x) => ({
                                    originalname: x.originalname,
                                    name: x.filename,
                                    type: x.mimetype,
                                    size: x.size,
                                })),
                                passthrough: payload,
                            }));
                        }
                        processFolders(pathToRoot, teams, hooks);
                        let traceId = "s" + Math.random();
                        let response = yield this.runWithReply(pathToRoot, this.params.port, res, event, payload, traceId, hooks, req.headers["content-type"]);
                    }
                    catch (e) {
                        if (e.data !== undefined)
                            reply(res, e, undefined);
                        else
                            throw e;
                    }
                }));
                app.get("/rapids", (req, res) => {
                    res.send("Running...");
                });
                server.listen(this.params.port, () => {
                    (0, utils_1.output)("");
                    (0, utils_1.output)("              .8.                               8                        8 ");
                    (0, utils_1.output)('              "8"           od8                 8                        8 ');
                    (0, utils_1.output)("                            888                 8                        8 ");
                    (0, utils_1.output)("88d88b.d88b.  888 .d8888b 88888888       .d88b. 8  .d88b.  8     8  .d8888 ");
                    (0, utils_1.output)('888 "888 "88b 888 88K       888         d"    " 8 d"    "b 8     8 d"    8 ');
                    (0, utils_1.output)('888  888  888 888 "Y8888b.  888  888888 8       8 8      8 8     8 8     8 ');
                    (0, utils_1.output)("888  888  888 888      X88  Y8b. .      Y.    . 8 Y.    .P Y.    8 Y.    8 ");
                    (0, utils_1.output)('888  888  888 888  88888P\'  "Y888Y       "Y88P" 8  "Y88P"   "Y88"8  "Y88"8 ');
                    (0, utils_1.output)("");
                    (0, utils_1.output)(`Running local Rapids on http://localhost:${this.params.port}/rapids`);
                    (0, utils_1.output)(`To exit, press ctrl+c`);
                    (0, utils_1.output)("");
                });
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
    runService(pathToRoot, port, event, payload, traceId, hooks, contentType) {
        var _a, _b, _c, _d, _e, _f;
        if (event === "$retrieve") {
            let conf = JSON.parse(payload.toString());
            if (!fs_1.default.existsSync(`${pathToRoot}/${FILE_STORE_PATH}/${conf.file}`))
                throw HTTP.CLIENT_ERROR.FILE_NOT_FOUND(conf.file);
            (0, promises_1.readFile)(`${pathToRoot}/${FILE_STORE_PATH}/${conf.file}`).then((content) => {
                this.runService(pathToRoot, port, conf.emit, Buffer.from(JSON.stringify({ content, passthrough: conf.passthrough })), traceId, hooks, contentType);
            });
        }
        else if (event === "$store") {
            let conf = JSON.parse(payload.toString());
            Promise.all(conf.contents.map((content) => {
                let buffer = Buffer.from(content);
                let uid = (0, uuid_1.v4)();
                return (0, promises_1.writeFile)(`${pathToRoot}/${FILE_STORE_PATH}/${uid}`, buffer).then((x) => uid);
            })).then((uids) => {
                this.runService(pathToRoot, port, conf.emit, Buffer.from(JSON.stringify({
                    files: uids,
                    passthrough: payload,
                })), traceId, hooks, contentType);
            });
        }
        else if (event === "$join") {
            (_b = (_a = this.io) === null || _a === void 0 ? void 0 : _a.sockets.sockets.get(traceId)) === null || _b === void 0 ? void 0 : _b.join("$" + payload);
        }
        else if (event === "$broadcast") {
            let pay = JSON.parse(payload.toString());
            (_c = this.io) === null || _c === void 0 ? void 0 : _c.to("$" + pay.to).emit(pay.event, pay.payload);
        }
        else if (event === "$send") {
            let pay = JSON.parse(payload.toString());
            (_d = this.io) === null || _d === void 0 ? void 0 : _d.to(pay.to).emit(pay.event, pay.payload);
        }
        else if (event === "$reply") {
            let rs = pendingReplies[traceId];
            if (rs !== undefined) {
                delete pendingReplies[traceId];
                reply(rs.resp, HTTP.SUCCESS.SINGLE_REPLY(payload), contentType);
            }
            let soc = (_e = this.io) === null || _e === void 0 ? void 0 : _e.sockets.sockets.get(traceId);
            if (soc !== undefined) {
                soc.emit("$reply", payload);
            }
        }
        let rivers = (_f = hooks.riversFor(event)) === null || _f === void 0 ? void 0 : _f.hooks;
        if (rivers === undefined)
            return;
        let messageId = "m" + Math.random();
        let envelope = `'${JSON.stringify({
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
            ls.stdin.write(payload);
            ls.stdin.end();
            ls.stdout.on("data", (data) => {
                timedOutput(service.dir.substring(pathToRoot.length) + (": " + data).trimEnd());
            });
            ls.stderr.on("data", (data) => {
                timedOutput(FgRed +
                    service.dir.substring(pathToRoot.length) +
                    (": " + data).trimEnd() +
                    Reset);
            });
        });
    }
    runWithReply(pathToRoot, port, resp, event, payload, traceId, hooks, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let rivers = hooks.riversFor(event);
                if (rivers === undefined)
                    return reply(resp, HTTP.CLIENT_ERROR.NO_HOOKS, undefined);
                this.runService(pathToRoot, port, event, payload, traceId, hooks, contentType);
                pendingReplies[traceId] = { resp, replies: [] };
                yield sleep(rivers.waitFor || MAX_WAIT);
                let pending = pendingReplies[traceId];
                if (pending !== undefined) {
                    delete pendingReplies[traceId];
                    reply(resp, HTTP.SUCCESS.QUEUE_JOB, undefined);
                }
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
        var _a;
        let evt = this.hooks[event] ||
            (this.hooks[event] = {
                waitFor: (_a = this.publicEvents[event]) === null || _a === void 0 ? void 0 : _a.waitFor,
                hooks: {},
            });
        let rvr = evt.hooks[river] || (evt.hooks[river] = []);
        rvr.push(hook);
    }
    riversFor(event) {
        return this.hooks[event];
    }
    validateFiles(pathToRoot, event, files) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileCount = this.publicEvents[event].fileCount;
            if (fileCount !== undefined) {
                if (fileCount >= 0 && files.length > fileCount) {
                    throw HTTP.CLIENT_ERROR.TOO_MANY_FILES(fileCount);
                }
                if (fileCount < 0 && files.length < -fileCount) {
                    throw HTTP.CLIENT_ERROR.TOO_FEW_FILES(-fileCount);
                }
            }
            let fileSize = this.publicEvents[event].fileSize;
            if (fileSize !== undefined) {
                let fs = fileSize;
                let tooBig = files.filter((x) => x.size > fs);
                if (tooBig.length > 0) {
                    throw HTTP.CLIENT_ERROR.TOO_LARGE_FILES(fs + "bytes", // TODO print prettier
                    tooBig.map((x) => x.originalname).join(", "));
                }
            }
            let mimeTypes = this.publicEvents[event].mimeTypes;
            if (mimeTypes !== undefined) {
                let mt = mimeTypes.flatMap((x) => commonMimeTypes[x] || x);
                let wrongType = files.filter((x) => !mt.includes(x.mimetype) &&
                    !mt.includes(x.mimetype.substring(0, x.mimetype.indexOf("/")) + "/*"));
                if (wrongType.length > 0) {
                    throw HTTP.CLIENT_ERROR.ILLEGAL_TYPE(wrongType.map((x) => x.originalname).join(", "));
                }
            }
            yield (0, promises_1.mkdir)(`${pathToRoot}/${FILE_STORE_PATH}`, { recursive: true }).then((x) => x);
            yield Promise.all(files.map((f) => (0, promises_1.rename)(`${pathToRoot}/${TMP_FILE_STORE_PATH}/${f.filename}`, `${pathToRoot}/${FILE_STORE_PATH}/${f.filename}`)));
        });
    }
}
const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const DEFAULT_TIMEOUT = 5 * MINUTES;
function processFolder(folder, hooks) {
    if (fs_1.default.existsSync(`${folder}/mist.json`)) {
        let projectType;
        let cmd;
        try {
            projectType = (0, project_type_detect_1.detectProjectType)(folder);
            cmd = project_type_detect_1.RUN_COMMAND[projectType](folder);
        }
        catch (e) {
            console.log(e);
            return;
        }
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
    folders
        .filter((x) => !x.startsWith("(deleted) "))
        .forEach((folder) => processFolder(prefix + folder + "/", hooks));
}
let spacerTimer;
function timedOutput(str) {
    if (spacerTimer !== undefined)
        clearTimeout(spacerTimer);
    (0, utils_1.output)(str);
    spacerTimer = setTimeout(() => (0, utils_1.output)(""), 10000);
}
var HTTP;
(function (HTTP) {
    let SUCCESS;
    (function (SUCCESS) {
        SUCCESS.SINGLE_REPLY = (data) => ({ code: 200, data });
        SUCCESS.QUEUE_JOB = { code: 200, data: Buffer.from("Queued") };
    })(SUCCESS = HTTP.SUCCESS || (HTTP.SUCCESS = {}));
    let CLIENT_ERROR;
    (function (CLIENT_ERROR) {
        CLIENT_ERROR.TIMEOUT_JOB = {
            code: 400,
            data: Buffer.from("Job timed out"),
        };
        CLIENT_ERROR.NO_HOOKS = {
            code: 400,
            data: Buffer.from("Event has no hooks"),
        };
        CLIENT_ERROR.TOO_MANY_FILES = (x) => ({
            code: 400,
            data: Buffer.from(`No more than ${x} files allowed`),
        });
        CLIENT_ERROR.TOO_FEW_FILES = (x) => ({
            code: 400,
            data: Buffer.from(`At least ${x} files required`),
        });
        CLIENT_ERROR.TOO_LARGE_FILES = (x, s) => ({
            code: 400,
            data: Buffer.from(`Files exceed size limit of ${x}: ${s}`),
        });
        CLIENT_ERROR.ILLEGAL_TYPE = (s) => ({
            code: 400,
            data: Buffer.from(`Illegal mime types: ${s}`),
        });
        CLIENT_ERROR.FILE_NOT_FOUND = (s) => ({
            code: 404,
            data: Buffer.from(`File not found: ${s}`),
        });
    })(CLIENT_ERROR = HTTP.CLIENT_ERROR || (HTTP.CLIENT_ERROR = {}));
})(HTTP || (HTTP = {}));
function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}
function reply(res, response, contentType) {
    if (contentType !== undefined)
        res.contentType(contentType);
    res.status(response.code).send(response.data);
}
const CMD = "run";
parser_1.argParser.push(CMD, {
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
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org !== null;
    },
});
