import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import fs from "fs";
import { addToHistory, execPromise, output, sshReq } from "../utils";

class Call implements Command {
  constructor(private event: string, private params: { key: string }) {}
  async execute() {
    try {
      output("Todo");
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "call";
argParser.push(CMD, {
  desc: "Call a service",
  arg: "event",
  construct: (arg, params: { key: string }) => new Call(arg, params),
  flags: {
    key: {
      short: "k",
      arg: "key",
      overrideValue: (s) => s,
    },
  },
});
