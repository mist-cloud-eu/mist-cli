import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import fs from "fs";
import { addToHistory, execPromise, output, sshReq } from "../utils";
import {
  BUILD_SCRIPT_MAKERS,
  detectProjectType,
} from "@mist-cloud-eu/project-type-detect";
import { ExecOptions, spawn, spawnSync } from "child_process";

class Build implements Command {
  constructor(private params: { all: AllArg }) {}
  async execute() {
    try {
      this.params.all.execute();
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

interface AllArg {
  execute(): void;
}
class All implements AllArg {
  execute() {
    output("Todo");
  }
}
class One implements AllArg {
  execute() {
    if (!fs.existsSync("mist.json"))
      throw "Either go into a service folder or use --all flag";
    let projectType = detectProjectType(".");
    BUILD_SCRIPT_MAKERS[projectType](".").forEach((x) => {
      let [cmd, ...args] = x.split(" ");
      const options: ExecOptions = {
        shell: "sh",
      };
      if (process.env["DEBUG"]) console.log(cmd, args);
      output(`Building ${projectType} project...`);
      let ls = spawn(cmd, args, options);
      ls.stdout.on("data", (data: Buffer | string) => {
        output(data.toString());
      });
      ls.stderr.on("data", (data: Buffer | string) => {
        output(data.toString());
      });
    });
  }
}

const CMD = "build";
argParser.push(CMD, {
  desc: "Build a service like it will be built on mist-cloud",
  construct: (arg, params: { all: AllArg }) => new Build(params),
  flags: {
    all: {
      short: "a",
      defaultValue: new One(),
      overrideValue: new All(),
    },
  },
  isRelevant: () => fs.existsSync("mist.json"),
});
