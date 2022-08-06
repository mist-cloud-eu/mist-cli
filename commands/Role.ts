import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { fetchOrg, sshReq } from "../utils";

class Role implements Command {
  constructor(
    private role: string,
    private params: {
      user: string;
      delete: string;
    }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      console.log(
        await sshReq(
          `role ${this.role} ${this.params.delete} --user ${this.params.user} --org ${org.name}`
        )
      );
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("role", {
  desc: "Create a role",
  arg: "role",
  construct: (
    arg,
    params: {
      user: string;
      delete: string;
    }
  ) => new Role(arg, params),
  flags: {
    user: {
      arg: "user",
      short: "u",
      desc: "Assign the role to a user",
      overrideValue: (s) => s,
    },
    delete: {
      desc: "Delete the role",
      defaultValue: "",
      overrideValue: "--delete",
    },
  },
});
