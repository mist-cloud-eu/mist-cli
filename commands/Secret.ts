import { Command } from "typed-cmdargs";
import { argParser } from "../parser";
import { output, fetchOrg, sshReq, addToHistory, fetchOrgRaw } from "../utils";

class Secret implements Command {
  constructor(
    private key: string,
    private params: {
      value: string;
      overwrite: string;
      prod: string;
      test: string;
    }
  ) {}
  async execute() {
    try {
      let { org, team } = fetchOrg();
      if (team === null)
        throw "Cannot manage secrets in organization root. First create a team.";
      if (this.params.prod === "" && this.params.test === "")
        throw "Secret should be set in --prod, --test, or both.";
      output(
        await sshReq(
          `secret`,
          this.key,
          this.params.overwrite,
          this.params.prod,
          this.params.test,
          `--org`,
          org.name,
          `--team`,
          team,
          `--value`,
          this.params.value
        )
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

const CMD = "secret";
argParser.push(CMD, {
  desc: "Set a secret environment variable accessible to the team's services",
  arg: "key",
  construct: (
    arg,
    params: {
      value: string;
      overwrite: string;
      prod: string;
      test: string;
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
    prod: {
      defaultValue: "",
      overrideValue: "--prod",
    },
    test: {
      defaultValue: "",
      overrideValue: "--test",
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return team !== null;
  },
});
