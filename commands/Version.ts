import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import * as conf from "../package.json";
import { addToHistory, output } from "../utils";

class Version implements Command {
  constructor() {}
  async execute() {
    try {
      output(conf.version);
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "version";
argParser.push(CMD, {
  desc: "Print the version of the CLI",
  construct: (arg, params) => new Version(),
  flags: {},
  isRelevant: () => false,
});
