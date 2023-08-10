import http from "http";
import https from "https";
import fs from "fs";
import os from "os";
import { exec, spawn } from "child_process";
import { SSH_HOST } from "./config";
import * as conf from "./package.json";

export function typedKeys<T extends object>(o: T): Array<keyof T> {
  return Object.keys(o) as any;
}

export function execPromise(cmd: string, cwd?: string) {
  // output("Executing", cmd);
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      let err = error?.message || stderr;
      if (err) {
        reject(stderr || stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function execStreamPromise(
  full: string,
  onData: (_: string) => void,
  cwd?: string
) {
  return new Promise<void>((resolve, reject) => {
    let [cmd, ...args] = full.split(" ");
    let p = spawn(cmd, args, { cwd, shell: "sh" });
    p.stdout.on("data", (data) => {
      onData(data.toString());
    });
    p.stderr.on("data", (data) => {
      console.log(data.toString());
    });
    p.on("exit", (code) => {
      if (code !== 0) reject();
      else resolve();
    });
  });
}

function sshReqInternal(cmd: string) {
  return execPromise(`ssh mist@${SSH_HOST} "${cmd}"`);
}
export function sshReq(...cmd: string[]) {
  return sshReqInternal(
    cmd
      .map((x) => (x.length === 0 || x.includes(" ") ? `\\"${x}\\"` : x))
      .join(" ")
  );
}

export function partition(str: string, radix: string) {
  let index = str.indexOf(radix);
  if (index < 0) return [str, ""];
  return [str.substring(0, index), str.substring(index + radix.length)];
}

export function urlReq(
  url: string,
  method: "POST" | "GET" = "GET",
  body?: any
) {
  return new Promise<string>((resolve, reject) => {
    let [protocol, fullPath] =
      url.indexOf("://") >= 0 ? partition(url, "://") : ["http", url];
    let [base, path] = partition(fullPath, "/");
    let [host, port] = partition(base, ":");
    let data = JSON.stringify(body);
    let headers;
    if (body !== undefined)
      headers = {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      };
    let sender = protocol === "http" ? http : https;
    let req = sender.request(
      {
        host,
        port,
        path: "/" + path,
        method,
        headers,
      },
      (resp) => {
        let str = "";
        resp.on("data", (chunk) => {
          str += chunk;
        });
        resp.on("end", () => {
          resolve(str);
        });
      }
    );
    req.on("error", (e) => {
      reject(
        `Unable to connect to ${host}. Please verify your internet connection.`
      );
    });
    if (data !== undefined) req.write(data);
    req.end();
  });
}

let fetchOrgRaw_cache:
  | {
      org: OrgFile;
      team: string | null;
      pathToRoot: string;
    }
  | {
      org: null;
      team: null;
      pathToRoot: null;
    }
  | null = null;
export function fetchOrgRaw() {
  if (fetchOrgRaw_cache === null) {
    fetchOrgRaw_cache = fetchOrgRaw_internal();
  }
  return fetchOrgRaw_cache;
}
export function fetchOrgRaw_internal() {
  if (fs.existsSync(".mist/conf.json")) {
    let org: OrgFile = JSON.parse("" + fs.readFileSync(`.mist/conf.json`));
    return { org, team: null, pathToRoot: "./" };
  }

  let cwd = process.cwd().split(/\/|\\/);
  let out = "";
  let folder = "/";
  let team: string | null = null;
  for (let i = cwd.length - 1; i >= 0; i--) {
    if (fs.existsSync(out + "../.mist/conf.json")) {
      team = cwd[i];
      let org = <OrgFile>(
        JSON.parse("" + fs.readFileSync(`${out}../.mist/conf.json`))
      );
      return { org, team, pathToRoot: out + "../" };
    }
    folder = "/" + cwd[i] + folder;
    out += "../";
  }
  return { org: null, team: null, pathToRoot: null };
}
export function fetchOrg() {
  let res = fetchOrgRaw();
  if (res.org === null) throw "Not inside a mist organization";
  return res;
}
export function output(str: string) {
  console.log(
    (str || "")
      .trimEnd()
      .split("\n")
      .map((x) => x.trimEnd())
      .join("\n")
  );
}

export function printTable<T>(
  data: T[],
  transform: { [header: string]: (_: T) => string }
) {
  let widths: { [header: string]: number } = {};
  Object.keys(transform).forEach((k) => {
    widths[k] = k.trim().length;
  });
  let mapped = data.map((row) => {
    let result: { [header: string]: string } = {};
    Object.keys(transform).forEach((k) => {
      result[k] = transform[k](row);
      widths[k] = Math.max(widths[k], result[k].length);
    });
    return result;
  });
  let header = "";
  Object.keys(widths).forEach((k) => {
    header += k.trim().padEnd(widths[k]) + " │ ";
  });
  output(header);
  let divider = "";
  Object.keys(widths).forEach((k) => {
    divider += "─".repeat(widths[k]) + "─┼─";
  });
  output(divider);
  mapped.forEach((row) => {
    let result = "";
    Object.keys(widths).forEach((k) => {
      if (k.startsWith(" ")) result += row[k].padStart(widths[k]) + " │ ";
      else result += row[k].padEnd(widths[k]) + " │ ";
    });
    output(result);
  });
}
export function fastPrintTable(
  data: { [k: string]: unknown }[],
  headers?: { [key: string]: string }
) {
  if (data.length > 0) {
    let widths: { [key: string]: number } = {};
    Object.keys(headers !== undefined ? headers : data[0]).forEach(
      (k) => (widths[k] = (headers !== undefined ? headers[k] : k).length)
    );
    const SAMPLES = 5;
    for (let i = 0; i < SAMPLES; i++) {
      let x = ~~(Math.random() * data.length);
      Object.keys(data[x]).forEach(
        (k) => (widths[k] = Math.max(widths[k], ("" + data[x][k]).length))
      );
    }
    output(
      Object.keys(headers !== undefined ? headers : data[0])
        .map((k) => (headers !== undefined ? headers[k] : k).padEnd(widths[k]))
        .join(" │ ")
    );
    output(
      Object.keys(headers !== undefined ? headers : data[0])
        .map((k) => "─".repeat(widths[k]))
        .join("─┼─")
    );
    data.forEach((x) =>
      output(
        Object.keys(headers !== undefined ? headers : x)
          .map((k) => formatToWidth("" + x[k], widths[k]))
          .join(" │ ")
      )
    );
  }
  output(`Rows: ${data.length}`);
}
const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;
function formatToWidth(str: string, width: number) {
  var timestamp = Date.parse(str);
  if (!isNaN(timestamp) && Math.abs(Date.now() - timestamp) < YEAR)
    return new Date(str).toLocaleString().padEnd(width);
  else if (str === null) return " ".repeat(width);
  else if (str.length > width) return str.substring(0, width - 3) + "...";
  else if (Number.isNaN(+str)) return str.padEnd(width);
  else return str.padStart(width);
}

const historyFolder = os.homedir() + "/.mist/";
const historyFile = "history";
const updateFile = "last_update_check";
export function addToHistory(str: string) {
  if (!fs.existsSync(historyFolder)) fs.mkdirSync(historyFolder);
  fs.appendFileSync(historyFolder + historyFile, str.trimEnd() + "\n");
}
export function getHistory() {
  if (!fs.existsSync(historyFolder + historyFile)) return [];
  return ("" + fs.readFileSync(historyFolder + historyFile)).split("\n");
}

function versionIsOlder(old: string, new_: string) {
  let os = old.split(".");
  let ns = new_.split(".");
  if (+os[0] < +ns[0]) return true;
  else if (+os[0] > +ns[0]) return false;
  else if (+os[1] < +ns[1]) return true;
  else if (+os[1] > +ns[1]) return false;
  else if (+os[2] < +ns[2]) return true;
  return false;
}

export async function checkVersion() {
  if (!fs.existsSync(historyFolder)) fs.mkdirSync(historyFolder);
  let lastCheck = fs.existsSync(historyFolder + updateFile)
    ? +fs.readFileSync(historyFolder + updateFile).toString()
    : 0;
  if (Date.now() - lastCheck > 4 * 60 * 60 * 1000) {
    try {
      let call = await execPromise(
        "npm show @mist-cloud-eu/mist-cli dist-tags --json"
      );
      let version: { latest: string } = JSON.parse(call);
      if (versionIsOlder(conf.version, version.latest)) {
        output("New version of mist-cli available, to update run the command:");
        output("    npm update -g @mist-cloud-eu/mist-cli");
      }
    } catch (e) {}
    fs.writeFileSync(historyFolder + updateFile, "" + Date.now());
  }
}
