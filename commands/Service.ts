import { Command } from "typed-cmdargs";
import { GIT_HOST } from "../config";
import {
  output,
  execPromise,
  fetchOrg,
  sshReq,
  addToHistory,
  fetchOrgRaw,
} from "../utils";
import fs from "fs";
import { argParser } from "../parser";

class Service implements Command {
  constructor(
    private name: string,
    private params: {
      private: string;
      template: TemplateArg;
      delete: ServiceDeleteArg;
    }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team === null)
        throw "Cannot manage services in organization root. First create a team.";
      await this.params.delete.execute(
        this.name,
        team,
        this.params.private,
        org,
        this.params.template
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

interface TemplateArg {
  execute(repoBase: string, name: string): Promise<void>;
}
class NoTemplate implements TemplateArg {
  async execute(repoBase: string, name: string) {
    try {
      await execPromise(`git clone -q "${repoBase}/${name}" ${name}`);
    } catch (e) {
      throw e;
    }
  }
}
class Template implements TemplateArg {
  constructor(private name: string) {}
  async execute(repoBase: string, name: string) {
    try {
      await execPromise(`git clone -q "${repoBase}/${this.name}" ${name}`);
      await execPromise(`git remote set-url origin ${repoBase}/${name}`, name);
    } catch (e) {
      throw e;
    }
  }
}

interface ServiceDeleteArg {
  execute(
    name: string,
    team: string,
    priv: string,
    org: OrgFile,
    template: TemplateArg
  ): Promise<void>;
}
class NoDeleteService implements ServiceDeleteArg {
  async execute(
    name: string,
    team: string,
    priv: string,
    org: OrgFile,
    template: TemplateArg
  ) {
    try {
      output(
        await sshReq(`service`, name, `--team`, team, `--org`, org.name, priv)
      );
      let repoBase = `${GIT_HOST}/${org.name}/${team}`;
      await template.execute(repoBase, name);
    } catch (e) {
      throw e;
    }
  }
}
class DeleteService implements ServiceDeleteArg {
  async execute(
    name: string,
    team: string,
    priv: string,
    org: OrgFile,
    template: TemplateArg
  ) {
    try {
      output(
        await sshReq(
          `service`,
          name,
          `--team`,
          team,
          `--org`,
          org.name,
          `--delete`
        )
      );
      // fs.rmSync(name, { recursive: true, force: true });
      if (fs.existsSync(name)) fs.renameSync(name, `(deleted) ${name}`);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "service";
argParser.push(CMD, {
  desc: "Create a service",
  arg: "name",
  construct: (arg, params) => new Service(arg, params),
  flags: {
    private: {
      short: "p",
      desc: "Make the service team private",
      defaultValue: "",
      overrideValue: "--private",
    },
    template: {
      short: "t",
      desc: "Initialize repo based on template",
      arg: "template",
      defaultValue: new NoTemplate(),
      overrideValue: (s) => new Template(s),
    },
    delete: {
      desc: "Delete the service",
      defaultValue: new NoDeleteService(),
      overrideValue: new DeleteService(),
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return team !== null && !fs.existsSync("mist.json");
  },
});
