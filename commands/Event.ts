import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { sshReq } from "../utils";

class Event implements Command {
  constructor(
    private event: string,
    private params: {
      key: string;
      delete: string;
    }
  ) {}
  async execute() {
    try {
      console.log(
        await sshReq(
          `event ${this.event} ${this.params.delete} --key ${this.params.key}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("event", {
  desc: "Give api key permission to receive specific event type",
  arg: "event",
  construct: (
    arg,
    params: {
      key: string;
      delete: string;
    }
  ) => new Event(arg, params),
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
