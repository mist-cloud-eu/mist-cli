import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, addToHistory, fetchOrgRaw } from "../utils";
import express from "express";
import { Request, Response } from "express";
import fs from "fs";
import { spawn, ExecOptions } from "child_process";
import {
  detectProjectType,
  ProjectType,
  RUN_COMMAND,
} from "@mist-cloud-eu/project-type-detect";

class Run implements Command {
  constructor(private params: { port: number }) {}
  async execute() {
    try {
      const { pathToRoot } = fetchOrg();

      let teams = fs.readdirSync(pathToRoot);
      teams.splice(teams.indexOf(".mist"), 1);
      teams.splice(teams.indexOf("event-catalogue"), 1);

      const app = express();
      // app.use(express.json());
      // app.use(express.urlencoded());
      app.use(express.text({ type: "*/*" }));

      let hooks: PublicHooks;

      app.post("/trace/:traceId/:event", async (req, res) => {
        let traceId = req.params.traceId;
        let event = req.params.event;
        let payload = req.body;
        runService(this.params.port, event, payload, traceId, hooks);
        res.send("Done");
      });

      app.post("/rapids/:event", async (req, res) => {
        try {
          hooks = new PublicHooks(pathToRoot);
          processFolders(pathToRoot, teams, hooks);
          let event = req.params.event;
          let payload = req.body;
          let traceId = "s" + Math.random();
          let response = await runWithReply(
            this.params.port,
            res,
            event,
            payload,
            traceId,
            hooks
          );
        } catch (e) {
          throw e;
        }
      });

      app.get("/rapids", (req, res) => {
        res.send("Running...");
      });

      app.listen(this.params.port, () => {
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
  [traceId: string]: { resp: Response; count?: number; replies: any[] };
} = {};

class PublicHooks {
  private publicEvents: {
    [event: string]: {
      replyCount: number | undefined;
      waitFor: number | undefined;
    };
  };
  private hooks: {
    [event: string]: {
      replyCount: number | undefined;
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
        replyCount: this.publicEvents[event]?.replyCount,
        waitFor: this.publicEvents[event]?.waitFor,
        hooks: {},
      });
    let rvr = evt.hooks[river] || (evt.hooks[river] = []);
    rvr.push(hook);
  }

  riversFor(event: string) {
    return this.hooks[event];
  }
}

const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;
const MINUTES = 60 * SECONDS;
const DEFAULT_TIMEOUT = 5 * MINUTES;

function processFolder(folder: string, hooks: PublicHooks) {
  if (fs.existsSync(`${folder}/mist.json`)) {
    let projectType: ProjectType;
    try {
      projectType = detectProjectType(folder);
    } catch (e) {
      console.log(e);
      return;
    }
    let cmd = RUN_COMMAND[projectType](folder);
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
  } else if (fs.lstatSync(folder).isDirectory()) {
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

function runService(
  port: number,
  event: string,
  payload: string,
  traceId: string,
  hooks: PublicHooks
) {
  let rs = pendingReplies[traceId];
  if (event === "reply" && rs !== undefined) {
    rs.replies.push(payload);
    if (rs.count !== undefined && rs.replies.length >= rs.count) {
      delete pendingReplies[traceId];
      reply(rs.resp, HTTP.SUCCESS.REPLY(rs.replies));
    }
  }
  let rivers = hooks.riversFor(event)?.hooks;
  if (rivers === undefined) return;
  let messageId = "m" + Math.random();
  let envelope = `'${JSON.stringify({
    payload,
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
    ls.stdout.on("data", (data) => {
      timedOutput(service.dir + (": " + data).trimEnd());
    });
    ls.stderr.on("data", (data) => {
      timedOutput(FgRed + service.dir + (": " + data).trimEnd() + Reset);
    });
  });
}

module HTTP {
  export module SUCCESS {
    export const REPLY = (data: any[]) => ({ code: 200, data });
    export const QUEUE_JOB = { code: 200, data: "Queued" };
  }
  export module CLIENT_ERROR {
    export const TIMEOUT_JOB = { code: 400, data: "Job timed out" };
    export const NO_HOOKS = { code: 400, data: "Event has no hooks" };
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
    data: any;
  }
) {
  res.status(response.code).send(response.data);
}

async function runWithReply(
  port: number,
  resp: Response,
  event: string,
  payload: any,
  traceId: string,
  hooks: PublicHooks
) {
  try {
    let rivers = hooks.riversFor(event);
    if (rivers === undefined) return reply(resp, HTTP.CLIENT_ERROR.NO_HOOKS);
    runService(port, event, payload, traceId, hooks);
    pendingReplies[traceId] = { resp, replies: [], count: rivers.replyCount };
    if (rivers.replyCount !== undefined) {
      await sleep(rivers.waitFor || MAX_WAIT);
      let rs = pendingReplies[traceId];
      if (rs !== undefined) {
        delete pendingReplies[traceId];
        reply(resp, HTTP.SUCCESS.REPLY(rs.replies));
      }
    } else if (rivers.waitFor !== undefined) {
      await sleep(rivers.waitFor);
      let rs = pendingReplies[traceId];
      delete pendingReplies[traceId];
      reply(resp, HTTP.SUCCESS.REPLY(rs.replies));
    } else {
      delete pendingReplies[traceId];
      reply(resp, HTTP.SUCCESS.QUEUE_JOB);
    }
  } catch (e) {
    throw e;
  }
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
