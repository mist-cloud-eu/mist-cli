import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import * as conf from "../package.json";

class Version implements Command {
  constructor() {}
  async execute() {
    try {
      console.log(conf.version);
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("version", {
  desc: "Print the version of the CLI",
  construct: (arg, params) => new Version(),
  flags: {},
});
