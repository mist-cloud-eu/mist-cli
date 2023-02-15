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
Object.defineProperty(exports, "__esModule", { value: true });
const clone_utils_1 = require("../clone_utils");
const parser_1 = require("../parser");
const utils_1 = require("../utils");
class Org {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }
    execute() {
        return this.params.delete.execute(this.name, this.params.join);
    }
}
class CreateOrganization {
    execute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { org, team } = (0, utils_1.fetchOrgRaw)();
                if (org !== null)
                    throw "Cannot create a new organization inside another organization.";
                let reply = yield (0, utils_1.sshReq)(`org`, name);
                if (!reply.startsWith("{")) {
                    (0, utils_1.output)(reply);
                    return;
                }
                let structure = JSON.parse(reply);
                yield (0, clone_utils_1.clone)(structure, name);
                (0, utils_1.addToHistory)(CMD);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class JoinOrganization {
    execute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`org ${name} --join`));
            }
            catch (e) {
                throw e;
            }
        });
    }
}
class NoDeleteOrganization {
    execute(name, join) {
        return join.execute(name);
    }
}
class DeleteOrganization {
    execute(name, join) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, utils_1.output)(yield (0, utils_1.sshReq)(`org ${name} --delete`));
            }
            catch (e) {
                throw e;
            }
        });
    }
}
const CMD = "org";
parser_1.argParser.push(CMD, {
    desc: "Create an organization",
    arg: "name",
    construct: (arg, params) => new Org(arg, params),
    flags: {
        join: {
            short: "j",
            desc: "Join an existing organization",
            defaultValue: new CreateOrganization(),
            overrideValue: new JoinOrganization(),
        },
        delete: {
            desc: "Delete the organization",
            defaultValue: new NoDeleteOrganization(),
            overrideValue: new DeleteOrganization(),
        },
    },
    isRelevant: () => {
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        return org === null;
    },
});
