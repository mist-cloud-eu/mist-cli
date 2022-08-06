import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class ListUsers implements Command {
  constructor(private params: { pending: string }) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(
        await sshReq(`list-users ${this.params.pending} --org ${org.name}`)
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("list-users", {
  desc: "List the users of an organization",
  construct: (arg, params) => new ListUsers(params),
  flags: {
    pending: {
      desc: "Show only pending users",
      defaultValue: "",
      overrideValue: "--pending",
    },
  },
});
