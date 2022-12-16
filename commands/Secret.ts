import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class Secret implements Command {
  constructor(
    private key: string,
    private params: {
      value: string;
      overwrite: string;
    }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team === null)
        throw "Cannot manage secrets in organization root. First create a team.";
      console.log(
        await sshReq(
          `secret ${this.key} ${this.params.overwrite} --org ${org.name} --team ${team} --value ${this.params.value}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("secret", {
  desc: "Set a secret accessible to our team's services",
  arg: "key",
  construct: (
    arg,
    params: {
      value: string;
      overwrite: string;
    }
  ) => new Secret(arg, params),
  flags: {
    value: {
      short: "v",
      arg: "value",
      defaultValue: "",
      overrideValue: (s) => s,
    },
    overwrite: {
      defaultValue: "",
      overrideValue: "--overwrite",
    },
  },
});
