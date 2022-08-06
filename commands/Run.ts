import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, partition } from "../utils";
import express from "express";
import { Response } from "express";
import fs from "fs";
import { spawn, ExecOptions } from "child_process";

class Run implements Command {
  constructor(private params: { port: number }) {}
  async execute() {
    try {
      const { pathToRoot } = fetchOrg();

      let teams = fs.readdirSync(pathToRoot);
      teams.splice(teams.indexOf(".mist"), 1);
      teams.splice(teams.indexOf("events"), 1);
      processFolders(pathToRoot, teams, new PublicHooks(pathToRoot));

      const app = express();
      app.use(express.json());

      app.post("/trace/:traceId/:event", (req, res) => {
        let traceId = req.params.traceId;
        let event = req.params.event;
        let payload = req.body;
        runService(this.params.port, event, payload, traceId);
        res.send("Done");
      });

      app.post("/rapid/:event", async (req, res) => {
        let event = req.params.event;
        let payload = req.body;
        let traceId = "s" + Math.random();
        let response = await runWithReply(
          this.params.port,
          res,
          event,
          payload,
          traceId
        );
      });

      app.get("/rapid", (req, res) => {
        res.send("Running...");
      });

      app.listen(this.params.port, () => {
        console.log("");
        console.log(
          "              .8.                                8                        8 "
        );
        console.log(
          '              "8"            od8                 8                        8 '
        );
        console.log(
          "                             888                 8                        8 "
        );
        console.log(
          "88d88b.d88b.  888 .d8888b  88888888       .d88b. 8  .d88b.  8     8  .d8888 "
        );
        console.log(
          '888 "888 "88b 888 88K        888         d"    " 8 d"    "b 8     8 d"    8 '
        );
        console.log(
          '888  888  888 888 "Y8888b.   888  888888 8       8 8      8 8     8 8     8 '
        );
        console.log(
          "888  888  888 888      X88   Y8b. .      Y.    . 8 Y.    .P Y.    8 Y.    8 "
        );
        console.log(
          '888  888  888 888  88888P\'   "Y888Y       "Y88P" 8  "Y88P"   "Y88"8  "Y88"8 '
        );
        console.log("");
        console.log(
          `Running local Rapid on http://localhost:${this.params.port}/rapid`
        );
        console.log(`To exit, press ctrl+c`);
        console.log("");
      });
    } catch (e) {
      throw e;
    }
  }
}

const MAX_WAIT = 30000;
const NPM_CMD = process.platform === "win32" ? "npm.cmd" : "npm";
const Reset = "\x1b[0m";
const FgRed = "\x1b[31m";

interface Hook {
  dir: string;
  cmd: string;
  action: string;
}
let hooks: {
  [event: string]: {
    replyCount: number | undefined;
    waitFor: number | undefined;
    hooks: { [river: string]: Hook[] };
  };
} = {};
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
  constructor(pathToRoot: string) {
    this.publicEvents = JSON.parse(
      "" + fs.readFileSync(`${pathToRoot}/events/config.json`)
    );
  }

  register(event: string, river: string, hook: Hook) {
    let evt =
      hooks[event] ||
      (hooks[event] = {
        replyCount: this.publicEvents[event]?.replyCount,
        waitFor: this.publicEvents[event]?.waitFor,
        hooks: {},
      });
    let rvr = evt.hooks[river] || (evt.hooks[river] = []);
    rvr.push(hook);
  }
}

function processFolder(folder: string, hooks: PublicHooks) {
  if (fs.existsSync(`${folder}/config.json`)) {
    let pkg: { scripts: { start: string } } = JSON.parse(
      "" + fs.readFileSync(`${folder}/package.json`)
    );
    let cmd = pkg.scripts.start;
    let config: { hooks: { [key: string]: string } } = JSON.parse(
      "" + fs.readFileSync(`${folder}/config.json`)
    );
    Object.keys(config.hooks).forEach((k) => {
      let [river, event] = k.split("/");
      let action = config.hooks[k];
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
  folders.forEach((folder) => processFolder(prefix + "/" + folder, hooks));
}

let spacerTimer: undefined | NodeJS.Timeout;
function output(str: string) {
  if (spacerTimer !== undefined) clearTimeout(spacerTimer);
  console.log(str);
  spacerTimer = setTimeout(() => console.log(""), 10000);
}

function runService(
  port: number,
  event: string,
  payload: any,
  traceId: string
) {
  let rs = pendingReplies[traceId];
  if (event === "reply" && rs !== undefined) {
    rs.replies.push(payload);
    if (rs.count !== undefined && rs.replies.length >= rs.count) {
      delete pendingReplies[traceId];
      reply(rs.resp, HTTP.SUCCESS.REPLY(rs.replies));
    }
  }
  let rivers = hooks[event]?.hooks;
  if (rivers === undefined) return;
  let messageId = "m" + Math.random();
  let envelope = JSON.stringify({ payload, messageId, traceId });
  Object.keys(rivers).forEach((river) => {
    let services = rivers[river];
    let service = services[~~(Math.random() * services.length)];
    // const args = ["start", "--silent", service.action, envelope];
    let [cmd, ...rest] = partition(service.cmd, " ");
    const args = [...rest, service.action, envelope];
    const options: ExecOptions = {
      cwd: service.dir,
      env: {
        ...process.env,
        RAPID: `http://localhost:${port}/trace/${traceId}`,
      },
    };
    // console.log(service);
    // let ls = spawn(NPM_CMD, args, options);
    let ls = spawn(cmd, args, options);
    ls.stdout.on("data", (data) => {
      output(service.dir + (": " + data).trimEnd());
    });
    ls.stderr.on("data", (data) => {
      output(FgRed + service.dir + (": " + data).trimEnd() + Reset);
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
  traceId: string
) {
  let rivers = hooks[event];
  runService(port, event, payload, traceId);
  if (rivers === undefined) return reply(resp, HTTP.CLIENT_ERROR.NO_HOOKS);
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
}

argParser.push("run", {
  desc: "Run system locally",
  construct: (arg, params) => new Run(params),
  flags: {
    port: {
      short: "p",
      desc: "Set which port to run local rapid on",
      defaultValue: 3000,
      arg: "port",
      overrideValue: (s) => +s,
    },
  },
});
