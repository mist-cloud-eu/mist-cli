import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import {
  output,
  fetchOrg,
  addToHistory,
  fetchOrgRaw,
  typedKeys,
} from "../utils";
import express from "express";
import { Response } from "express";
import fs from "fs";
import { spawn, ExecOptions } from "child_process";
import {
  detectProjectType,
  ProjectType,
  RUN_COMMAND,
} from "@mist-cloud-eu/project-type-detect";
import http from "http";
import { Server } from "socket.io";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
// import multer from "multer";
import { v4 as uuid } from "uuid";
import { allMimeTypesOf } from "@mist-cloud-eu/ext2mime";

const FILE_STORE_PATH = ".mist/filestore";
const TMP_FILE_STORE_PATH = ".mist/tmp";

class Run implements Command {
  private io: Server | undefined;
  constructor(private params: { port: number }) {}
  async execute() {
    try {
      const { pathToRoot } = fetchOrg();

      let teams = fs.readdirSync(pathToRoot);
      teams.splice(teams.indexOf(".mist"), 1);
      teams.splice(teams.indexOf("event-catalogue"), 1);

      const app = express();
      const server = http.createServer(app);

      this.io = new Server(server);
      this.io.on("connection", (socket) => {
        let traceId = socket.id;
        this.runService(
          pathToRoot,
          this.params.port,
          "connected",
          Buffer.alloc(0),
          traceId,
          hooks,
          undefined
        );
        socket.onAny((event, payload) => {
          this.runService(
            pathToRoot,
            this.params.port,
            event,
            payload,
            traceId,
            hooks,
            undefined
          );
        });
      });

      app.use((req, res, next) => {
        if (
          req.is("multipart/form-data") ||
          req.is("application/x-www-form-urlencoded")
        ) {
          express.urlencoded({ extended: true })(req, res, next);
        } else {
          express.raw({ type: "*/*", limit: "10mb" })(req, res, next);
        }
      });
      // const upload = multer({ dest: `${pathToRoot}/${TMP_FILE_STORE_PATH}` });
      // app.use(upload.any());

      let hooks: PublicHooks;

      app.post("/trace/:traceId/:event", async (req, res) => {
        try {
          let traceId = req.params.traceId;
          let event = req.params.event;
          let payload: Buffer = req.body;
          this.runService(
            pathToRoot,
            this.params.port,
            event,
            payload,
            traceId,
            hooks,
            req.headers["content-type"]
          );
          res.send("Done");
        } catch (e: any) {
          if (e.data !== undefined) console.log("" + e.data);
          else throw e;
        }
      });

      app.get("/rapids/:event", async (req, res) => {
        try {
          let event = req.params.event;
          hooks = new PublicHooks(pathToRoot);
          let payload: Buffer = Buffer.from(JSON.stringify(req.query));
          processFolders(pathToRoot, teams, hooks);
          let traceId = "s" + Math.random();
          let response = await this.runWithReply(
            pathToRoot,
            this.params.port,
            res,
            event,
            payload,
            traceId,
            hooks,
            req.headers["content-type"]
          );
        } catch (e: any) {
          if (e.data !== undefined) reply(res, e, undefined);
          else throw e;
        }
      });

      app.all("/rapids/:event", async (req, res) => {
        try {
          let event = req.params.event;
          hooks = new PublicHooks(pathToRoot);
          let payload: Buffer = !Buffer.isBuffer(req.body)
            ? typeof req.body === "object"
              ? Buffer.from(JSON.stringify(req.body))
              : Buffer.from(req.body)
            : req.body;
          // let reqFiles = req.files;
          // if (reqFiles !== undefined) {
          //   let files: Express.Multer.File[];
          //   if (Array.isArray(reqFiles)) {
          //     files = reqFiles;
          //   } else {
          //     let rf = reqFiles;
          //     files = typedKeys(rf).flatMap((x) => rf[x]);
          //   }
          //   await hooks.validateFiles(pathToRoot, event, files);
          //   payload = Buffer.from(
          //     JSON.stringify({
          //       files: files.map((x) => ({
          //         originalname: x.originalname,
          //         name: x.filename,
          //         type: x.mimetype,
          //         size: x.size,
          //       })),
          //       passthrough: payload,
          //     })
          //   );
          // }
          processFolders(pathToRoot, teams, hooks);
          let traceId = "s" + Math.random();
          let response = await this.runWithReply(
            pathToRoot,
            this.params.port,
            res,
            event,
            payload,
            traceId,
            hooks,
            req.headers["content-type"]
          );
        } catch (e: any) {
          if (e.data !== undefined) reply(res, e, undefined);
          else throw e;
        }
      });

      app.get("/rapids", (req, res) => {
        res.send("Running...");
      });

      server.listen(this.params.port, () => {
        output("");
        output(
          "              .8.                               8                        8 "
        );
        output(
          '              "8"           od8                 8                        8 '
        );
        output(
          "                            888                 8                        8 "
        );
        output(
          "88d88b.d88b.  888 .d8888b 88888888       .d88b. 8  .d88b.  8     8  .d8888 "
        );
        output(
          '888 "888 "88b 888 88K       888         d"    " 8 d"    "b 8     8 d"    8 '
        );
        output(
          '888  888  888 888 "Y8888b.  888  888888 8       8 8      8 8     8 8     8 '
        );
        output(
          "888  888  888 888      X88  Y8b. .      Y.    . 8 Y.    .P Y.    8 Y.    8 "
        );
        output(
          '888  888  888 888  88888P\'  "Y888Y       "Y88P" 8  "Y88P"   "Y88"8  "Y88"8 '
        );
        output("");
        output(
          `Running local Rapids on http://localhost:${this.params.port}/rapids`
        );
        output(`To exit, press ctrl+c`);
        output("");
      });
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }

  runService(
    pathToRoot: string,
    port: number,
    event: string,
    payload: Buffer,
    traceId: string,
    hooks: PublicHooks,
    contentType: string | undefined
  ) {
    if (event === "$retrieve") {
      let conf: { file: string; emit: string; passthrough?: any } = JSON.parse(
        payload.toString()
      );
      if (!fs.existsSync(`${pathToRoot}/${FILE_STORE_PATH}/${conf.file}`))
        throw HTTP.CLIENT_ERROR.FILE_NOT_FOUND(conf.file);
      readFile(`${pathToRoot}/${FILE_STORE_PATH}/${conf.file}`).then(
        (content) => {
          this.runService(
            pathToRoot,
            port,
            conf.emit,
            Buffer.from(
              JSON.stringify({ content, passthrough: conf.passthrough })
            ),
            traceId,
            hooks,
            contentType
          );
        }
      );
    } else if (event === "$store") {
      let conf: { contents: Buffer[]; emit: string; passthrough?: any } =
        JSON.parse(payload.toString());
      Promise.all(
        conf.contents.map((content) => {
          let buffer = Buffer.from(content);
          let uid = uuid();
          return writeFile(
            `${pathToRoot}/${FILE_STORE_PATH}/${uid}`,
            buffer
          ).then((x) => uid);
        })
      ).then((uids) => {
        this.runService(
          pathToRoot,
          port,
          conf.emit,
          Buffer.from(
            JSON.stringify({
              files: uids,
              passthrough: payload,
            })
          ),
          traceId,
          hooks,
          contentType
        );
      });
    } else if (event === "$join") {
      this.io?.sockets.sockets.get(traceId)?.join("$" + payload);
    } else if (event === "$broadcast") {
      let pay: { to: string; event: string; payload: any } = JSON.parse(
        payload.toString()
      );
      this.io?.to("$" + pay.to).emit(pay.event, pay.payload);
    } else if (event === "$send") {
      let pay: { to: string; event: string; payload: any } = JSON.parse(
        payload.toString()
      );
      this.io?.to(pay.to).emit(pay.event, pay.payload);
    } else if (event === "$reply") {
      let rs = pendingReplies[traceId];
      if (rs !== undefined) {
        delete pendingReplies[traceId];
        reply(rs.resp, HTTP.SUCCESS.SINGLE_REPLY(payload), contentType);
      }
      let soc = this.io?.sockets.sockets.get(traceId);
      if (soc !== undefined) {
        soc.emit("$reply", payload);
      }
    }
    let rivers = hooks.riversFor(event)?.hooks;
    if (rivers === undefined) return;
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
      const options: ExecOptions = {
        cwd: service.dir,
        env: {
          ...process.env,
          RAPIDS: `http://localhost:${port}/trace/${traceId}`,
        },
        shell: "sh",
      };
      if (process.env["DEBUG"]) console.log(cmd, args);
      let ls = spawn(cmd, args, options);
      ls.stdin.write(payload);
      ls.stdin.end();
      ls.stdout.on("data", (data) => {
        timedOutput(
          service.dir.substring(pathToRoot.length) + (": " + data).trimEnd()
        );
      });
      ls.stderr.on("data", (data) => {
        timedOutput(
          FgRed +
            service.dir.substring(pathToRoot.length) +
            (": " + data).trimEnd() +
            Reset
        );
      });
    });
  }

  async runWithReply(
    pathToRoot: string,
    port: number,
    resp: Response,
    event: string,
    payload: Buffer,
    traceId: string,
    hooks: PublicHooks,
    contentType: string | undefined
  ) {
    try {
      let rivers = hooks.riversFor(event);
      if (rivers === undefined)
        return reply(resp, HTTP.CLIENT_ERROR.NO_HOOKS, undefined);
      this.runService(
        pathToRoot,
        port,
        event,
        payload,
        traceId,
        hooks,
        contentType
      );

      pendingReplies[traceId] = { resp, replies: [] };
      await sleep(rivers.waitFor || MAX_WAIT);
      let pending = pendingReplies[traceId];
      if (pending !== undefined) {
        delete pendingReplies[traceId];
        reply(resp, HTTP.SUCCESS.QUEUE_JOB, undefined);
      }
    } catch (e) {
      throw e;
    }
  }
}

const MAX_WAIT = 30000;
const Reset = "\x1b[0m";
const FgRed = "\x1b[31m";

interface Hook {
  dir: string;
  cmd: string;
  action: string;
}
let pendingReplies: {
  [traceId: string]: { resp: Response; count?: number; replies: string[] };
} = {};

class PublicHooks {
  private publicEvents: {
    [event: string]: {
      waitFor: number | undefined;
      fileCount: number | undefined;
      fileSize: number | undefined;
      mimeTypes: string[] | undefined;
    };
  };
  private hooks: {
    [event: string]: {
      waitFor: number | undefined;
      hooks: { [river: string]: Hook[] };
    };
  } = {};
  constructor(pathToRoot: string) {
    this.publicEvents = JSON.parse(
      "" + fs.readFileSync(`${pathToRoot}/event-catalogue/api.json`)
    );
  }

  register(event: string, river: string, hook: Hook) {
    let evt =
      this.hooks[event] ||
      (this.hooks[event] = {
        waitFor: this.publicEvents[event]?.waitFor,
        hooks: {},
      });
    let rvr = evt.hooks[river] || (evt.hooks[river] = []);
    rvr.push(hook);
  }

  riversFor(event: string) {
    return this.hooks[event];
  }

  // async validateFiles(
  //   pathToRoot: string,
  //   event: string,
  //   files: Express.Multer.File[]
  // ) {
  //   let fileCount = this.publicEvents[event].fileCount;
  //   if (fileCount !== undefined) {
  //     if (fileCount >= 0 && files.length > fileCount) {
  //       throw HTTP.CLIENT_ERROR.TOO_MANY_FILES(fileCount);
  //     }
  //     if (fileCount < 0 && files.length < -fileCount) {
  //       throw HTTP.CLIENT_ERROR.TOO_FEW_FILES(-fileCount);
  //     }
  //   }
  //   let fileSize = this.publicEvents[event].fileSize;
  //   if (fileSize !== undefined) {
  //     let fs = fileSize;
  //     let tooBig = files.filter((x) => x.size > fs);
  //     if (tooBig.length > 0) {
  //       throw HTTP.CLIENT_ERROR.TOO_LARGE_FILES(
  //         fs + "bytes", // TODO print prettier
  //         tooBig.map((x) => x.originalname).join(", ")
  //       );
  //     }
  //   }
  //   let mimeTypes = this.publicEvents[event].mimeTypes;
  //   if (mimeTypes !== undefined) {
  //     let mt = mimeTypes
  //       .flatMap((x) => allMimeTypesOf(x))
  //       .map((x) => x.toString());
  //     let wrongType = files.filter(
  //       (x) =>
  //         !mt.includes(x.mimetype) &&
  //         !mt.includes(x.mimetype.substring(0, x.mimetype.indexOf("/")) + "/*")
  //     );
  //     if (wrongType.length > 0) {
  //       throw HTTP.CLIENT_ERROR.ILLEGAL_TYPE(
  //         wrongType.map((x) => x.originalname).join(", ")
  //       );
  //     }
  //   }
  //   await mkdir(`${pathToRoot}/${FILE_STORE_PATH}`, { recursive: true }).then(
  //     (x) => x
  //   );
  //   await Promise.all(
  //     files.map((f) =>
  //       rename(
  //         `${pathToRoot}/${TMP_FILE_STORE_PATH}/${f.filename}`,
  //         `${pathToRoot}/${FILE_STORE_PATH}/${f.filename}`
  //       )
  //     )
  //   );
  // }
}

const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const DEFAULT_TIMEOUT = 5 * MINUTES;

function processFolder(folder: string, hooks: PublicHooks) {
  if (fs.existsSync(`${folder}/mist.json`)) {
    let projectType: ProjectType;
    let cmd: string;
    try {
      projectType = detectProjectType(folder);
      cmd = RUN_COMMAND[projectType](folder);
    } catch (e) {
      console.log(e);
      return;
    }
    let config: {
      hooks: { [key: string]: string | { action: string; timeout?: number } };
    } = JSON.parse("" + fs.readFileSync(`${folder}/mist.json`));
    Object.keys(config.hooks).forEach((k) => {
      let [river, event] = k.split("/");
      let hook = config.hooks[k];
      let action: string, timeout_milliseconds: number;
      if (typeof hook === "object") {
        action = hook.action;
        timeout_milliseconds = hook.timeout || DEFAULT_TIMEOUT;
      } else {
        action = hook;
        timeout_milliseconds = DEFAULT_TIMEOUT;
      }
      hooks.register(event, river, {
        action,
        dir: folder.replace(/\/\//g, "/"),
        cmd,
      });
    });
  } else if (
    !folder.endsWith(".DS_Store") &&
    fs.lstatSync(folder).isDirectory()
  ) {
    processFolders(folder, fs.readdirSync(folder), hooks);
  }
}

function processFolders(prefix: string, folders: string[], hooks: PublicHooks) {
  folders
    .filter((x) => !x.startsWith("(deleted) "))
    .forEach((folder) => processFolder(prefix + folder + "/", hooks));
}

let spacerTimer: undefined | NodeJS.Timeout;
function timedOutput(str: string) {
  if (spacerTimer !== undefined) clearTimeout(spacerTimer);
  output(str);
  spacerTimer = setTimeout(() => output(""), 10000);
}

module HTTP {
  export module SUCCESS {
    export const SINGLE_REPLY = (data: Buffer) => ({ code: 200, data });
    export const QUEUE_JOB = { code: 200, data: Buffer.from("Queued") };
  }
  export module CLIENT_ERROR {
    export const TIMEOUT_JOB = {
      code: 400,
      data: Buffer.from("Job timed out"),
    };
    export const NO_HOOKS = {
      code: 400,
      data: Buffer.from("Event has no hooks"),
    };
    export const TOO_MANY_FILES = (x: number) => ({
      code: 400,
      data: Buffer.from(`No more than ${x} files allowed`),
    });
    export const TOO_FEW_FILES = (x: number) => ({
      code: 400,
      data: Buffer.from(`At least ${x} files required`),
    });
    export const TOO_LARGE_FILES = (x: string, s: string) => ({
      code: 400,
      data: Buffer.from(`Files exceed size limit of ${x}: ${s}`),
    });
    export const ILLEGAL_TYPE = (s: string) => ({
      code: 400,
      data: Buffer.from(`Illegal mime types: ${s}`),
    });
    export const FILE_NOT_FOUND = (s: string) => ({
      code: 404,
      data: Buffer.from(`File not found: ${s}`),
    });
  }
}

function sleep(duration: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

function reply(
  res: Response,
  response: {
    code: number;
    data: Buffer;
  },
  contentType: string | undefined
) {
  if (contentType !== undefined) res.contentType(contentType);
  res.status(response.code).send(response.data);
}

const CMD = "run";
argParser.push(CMD, {
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
    let { org, team } = fetchOrgRaw();
    return org !== null;
  },
});
