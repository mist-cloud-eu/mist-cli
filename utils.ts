import http from "http";
import https from "https";
import fs from "fs";
import { exec } from "child_process";
import { SSH_HOST } from "./config";

export function execPromise(cmd: string, cwd?: string) {
  // console.log("Executing", cmd);
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

export function sshReq(cmd: string) {
  return execPromise(`ssh mist@${SSH_HOST} "${cmd}"`);
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

export function fetchOrg() {
  if (fs.existsSync(".mist")) {
    if (!fs.existsSync(".mist/conf.json")) throw "Bad .mist folder";
    let org: OrgFile = JSON.parse("" + fs.readFileSync(`.mist/conf.json`));
    return { org, team: null, pathToRoot: "./" };
  }

  let cwd = process.cwd().split(/\/|\\/);
  let out = "";
  let folder = "/";
  let team: string | null = null;
  for (let i = cwd.length - 1; i >= 0; i--) {
    if (fs.existsSync(out + "../.mist")) {
      team = cwd[i];
      if (!fs.existsSync(`${out}../.mist/conf.json`)) throw "Bad .mist folder";
      let org = <OrgFile>(
        JSON.parse("" + fs.readFileSync(`${out}../.mist/conf.json`))
      );
      return { org, team, pathToRoot: out + "../" };
    }
    folder = "/" + cwd[i] + folder;
    out += "../";
  }
  throw "Not inside a mist organization";
}
