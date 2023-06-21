import { Command } from "typed-cmdargs";
import { HTTP_HOST } from "../config";
import {
  output,
  execPromise,
  urlReq,
  addToHistory,
  fetchOrgRaw,
} from "../utils";
import fs from "fs";
import RL from "readline";
import os from "os";
import { argParser } from "../parser";

class Login implements Command {
  constructor(private email: string, private params: { key: KeyParameter }) {}
  async execute() {
    try {
      output(
        `By using this product you agree to let Mistware (https://mistware.eu) store your email, for analytics, notifications, and identification. You can at any time retract this permission with the command "mist purge --delete," but this also excludes you from using the platform.`
      );
      output("");
      let key = await this.params.key.getKey();
      output("");
      output(
        await urlReq(`${HTTP_HOST}/admin/user`, "POST", {
          email: this.email,
          key,
        })
      );
      addToHistory(CMD);
    } catch (e) {
      throw e;
    }
  }
}

interface KeyParameter {
  getKey(): Promise<string>;
}
class AskForKey implements KeyParameter {
  async getKey() {
    try {
      let result: string;
      const readline = RL.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      if (fs.existsSync(os.homedir() + "/.ssh/id_rsa.pub")) {
        let key = await ask(
          readline,
          "Press enter to fetch key from file, or provide a public key manually: "
        );
        if (key !== "") {
          result = key;
        } else {
          result = "" + fs.readFileSync(os.homedir() + "/.ssh/id_rsa.pub");
        }
      } else {
        let key = await ask(
          readline,
          "Press enter to generate an RSA key-pair, or provide a public key manually: "
        );
        if (key !== "") {
          result = key;
        } else {
          if (!fs.existsSync(os.homedir() + "/.ssh"))
            fs.mkdirSync(os.homedir() + "/.ssh");
          await execPromise(
            `ssh-keygen -t rsa -b 4096 -f "${os.homedir()}/.ssh/id_rsa" -N ""`
          );
          result = "" + fs.readFileSync(os.homedir() + "/.ssh/id_rsa.pub");
        }
      }
      readline.close();
      readline.removeAllListeners();
      return result;
    } catch (e) {
      throw e;
    }
  }
}
class ProvidedKey implements KeyParameter {
  constructor(private key: string) {}
  async getKey() {
    return this.key;
  }
}

function ask(readline: RL.Interface, q: string) {
  return new Promise<string>((resolve, reject) => {
    readline.question(q, resolve);
  });
}

const CMD = "login";
argParser.push(CMD, {
  desc: "Sign up an email account",
  arg: "email",
  construct: (arg, params) => new Login(arg, params),
  flags: {
    key: {
      short: "k",
      desc: "Specify public key inline",
      arg: "public key",
      defaultValue: new AskForKey(),
      overrideValue: (s) => new ProvidedKey(s),
    },
  },
  isRelevant: () => {
    let { org, team } = fetchOrgRaw();
    return org === null;
  },
});
