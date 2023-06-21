"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const utils_1 = require("../utils");
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const os_1 = __importDefault(require("os"));
const parser_1 = require("../parser");
class Login {
    constructor(email, params) {
        this.email = email;
        this.params = params;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(`By using this product you agree to let Mistware (https://mistware.eu) store your email, for analytics, notifications, and identification. You can at any time retract this permission with the command "mist purge --delete," but this also excludes you from using the platform.`);
                (0, utils_1.output)("");
                let key = yield this.params.key.getKey();
                (0, utils_1.output)("");
                (0, utils_1.output)(yield (0, utils_1.urlReq)(`${config_1.HTTP_HOST}/admin/user`, "POST", {
                    email: this.email,
                    key,
                }));
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class AskForKey {
    getKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result;
                const readline = readline_1.default.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                if (fs_1.default.existsSync(os_1.default.homedir() + "/.ssh/id_rsa.pub")) {
                    let key = yield ask(readline, "Press enter to fetch key from file, or provide a public key manually: ");
                    if (key !== "") {
                        result = key;
                    }
                    else {
                        result = "" + fs_1.default.readFileSync(os_1.default.homedir() + "/.ssh/id_rsa.pub");
                    }
                }
                else {
                    let key = yield ask(readline, "Press enter to generate an RSA key-pair, or provide a public key manually: ");
                    if (key !== "") {
                        result = key;
                    }
                    else {
                        if (!fs_1.default.existsSync(os_1.default.homedir() + "/.ssh"))
                            fs_1.default.mkdirSync(os_1.default.homedir() + "/.ssh");
                        yield (0, utils_1.execPromise)(`ssh-keygen -t rsa -b 4096 -f "${os_1.default.homedir()}/.ssh/id_rsa" -N ""`);
                        result = "" + fs_1.default.readFileSync(os_1.default.homedir() + "/.ssh/id_rsa.pub");
                    }
                }
                readline.close();
                readline.removeAllListeners();
                return result;
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class ProvidedKey {
    constructor(key) {
        this.key = key;
    }
    getKey() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.key;
        });
    }
}
function ask(readline, q) {
    return new Promise((resolve, reject) => {
        readline.question(q, resolve);
    });
}
const CMD = "login";
parser_1.argParser.push(CMD, {
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
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org === null;
    },
});
