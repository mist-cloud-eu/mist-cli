import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class Secret implements Command {
  constructor(
    private set: string,
    private params: {
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
          `secret ${this.set} ${this.params.overwrite} --org ${org.name} --team ${team}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("secret", {
  desc: "Set a secret accessible to our team's services",
  arg: "key:value",
  construct: (
    arg,
    params: {
      overwrite: string;
    }
  ) => new Secret(arg, params),
  flags: {
    overwrite: {
      defaultValue: "",
      overrideValue: "--overwrite",
    },
  },
});
