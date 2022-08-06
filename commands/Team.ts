import { Command } from "typed-cmdargs";
import { fetchOrg, sshReq } from "../utils";
import fs from "fs";
import { argParser } from "../parser";

class Team implements Command {
  constructor(
    private name: string,
    private params: { user: string; delete: TeamDeleteArg }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team !== null) throw "Must be in the organization root.";
      this.params.delete.execute(this.name, this.params.user, org.name);
    } catch (e) {
      throw e;
    }
  }
}

interface TeamDeleteArg {
  execute(name: string, user: string, org: string): Promise<void>;
}
class NoDeleteTeam implements TeamDeleteArg {
  async execute(name: string, user: string, org: string) {
    try {
      fs.mkdirSync(name);
      console.log(await sshReq(`team ${name} ${user} --org ${org}`));
    } catch (e) {
      throw e;
    }
  }
}
class DeleteTeam implements TeamDeleteArg {
  async execute(name: string, user: string, org: string) {
    try {
      console.log(await sshReq(`team ${name} --delete --org ${org}`));
      if (fs.existsSync(name)) fs.renameSync(name, `(deleted) ${name}`);
    } catch (e) {
      throw e;
    }
  }
}

argParser.push("team", {
  desc: "Create a team",
  arg: "name",
  construct: (arg, params) => new Team(arg, params),
  flags: {
    user: {
      short: "u",
      arg: "email",
      desc: "Move user to team",
      defaultValue: "",
      overrideValue: (s) => `--user ${s}`,
    },
    delete: {
      desc: "Delete the team",
      defaultValue: new NoDeleteTeam(),
      overrideValue: new DeleteTeam(),
    },
  },
});
