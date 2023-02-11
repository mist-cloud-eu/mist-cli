"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.argParser = void 0;
const typed_cmdargs_1 = require("typed-cmdargs");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
class HandleHelpArgument {
    help(command) {
        return `Unknown argument 'help'. Did you mean: mist help ${command}`;
    }
}
const finalStretch = {
    cmd: "key",
    required: true,
    text: "  to create a new api key with the command:\n    \x1b[0;93mmist key 1year\x1b[0m",
    next: [
        {
            cmd: "event",
            required: true,
            text: "  to allow an event through the api key with the command:\n    \x1b[0;93mmist event [event] --key [key]\x1b[0m",
            next: [
                {
                    cmd: "call",
                    required: false,
                    text: "  to call your service with curl or the command:\n    \x1b[0;93mmist call [event] --key [key]\x1b[0m",
                    next: [
                        {
                            cmd: "queue",
                            required: true,
                            text: "  to check how the call went with the command:\n    \x1b[0;93mmist queue 2\x1b[0m",
                            next: [
                                {
                                    cmd: "inspect",
                                    required: true,
                                    text: "  to inspect an event in detail with the command:\n    \x1b[0;93mmist inspect [message id] --river [river]\x1b[0m",
                                    next: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
const payedRoute = {
    cmd: "deploy",
    required: false,
    text: "  to deploy the service and the event-catalogue with git or the command:\n    \x1b[0;93mmist deploy\x1b[0m",
    next: [
        {
            cmd: "deploy",
            required: false,
            text: "  to deploy the service and the event-catalogue with git or the command:\n    \x1b[0;93mmist deploy\x1b[0m",
            next: [
                {
                    cmd: "queue",
                    required: true,
                    text: "  to check how the smoke test went with the command:\n    \x1b[0;93mmist queue 2\x1b[0m",
                    next: [
                        {
                            cmd: "inspect",
                            required: true,
                            text: "  to inspect the smoke test in detail with the command:\n    \x1b[0;93mmist inspect [message id] --river init\x1b[0m",
                            next: [finalStretch],
                        },
                        finalStretch,
                    ],
                },
                finalStretch,
            ],
        },
    ],
};
const simulatorRoute = {
    cmd: "call",
    required: false,
    text: "  to call the simulator with curl or the command:\n    \x1b[0;93mmist call [event] --key [key] --local\x1b[0m",
    next: [
        {
            cmd: "sign-up-for-early-access",
            required: true,
            text: "  to sign up for early access on mist-cloud.eu or with the command:\n    \x1b[0;93mmist sign-up-for-early-access\x1b[0m",
            next: [
                {
                    cmd: "role",
                    required: true,
                    text: "  to assign the Developer role to yourself with the command:\n    \x1b[0;93mmist role Developer --user [email]\x1b[0m",
                    next: [payedRoute],
                },
                {
                    cmd: "capability",
                    required: true,
                    text: "  to add the write_source_code to the Administrator role with the command:\n    \x1b[0;93mmist capability write_source_code --role Administrator\x1b[0m",
                    next: [payedRoute],
                },
            ],
        },
    ],
};
const tutorials = {
    cmd: "login",
    required: true,
    text: "  to login to mist-cloud with the command:\n    \x1b[0;93mmist login [email]\x1b[0m",
    next: [
        {
            cmd: "org",
            required: true,
            text: "  to create an organization with the command:\n    \x1b[0;93mmist org [organization name]\x1b[0m",
            next: [
                {
                    cmd: "in_org",
                    required: true,
                    text: "  to go into an organization folder with the command:\n    \x1b[0;93mcd [organization name]\x1b[0m",
                    next: [
                        {
                            cmd: "team",
                            required: false,
                            text: "  to create a team with the command:\n    \x1b[0;93mmist team [team name]\x1b[0m",
                            next: [
                                {
                                    cmd: "in_team",
                                    required: true,
                                    text: "  to go into a team folder with the command:\n    \x1b[0;93mcd [team name]\x1b[0m",
                                    next: [
                                        {
                                            cmd: "service",
                                            required: true,
                                            text: "  to create a service with the command:\n    \x1b[0;93mmist service [service name]\x1b[0m",
                                            next: [
                                                {
                                                    cmd: "in_service",
                                                    required: true,
                                                    text: "  to go into a service folder with the command:\n    \x1b[0;93mcd [service name]\x1b[0m",
                                                    next: [
                                                        {
                                                            cmd: "run",
                                                            required: true,
                                                            text: "  to run a local simulation of the system with the command:\n    \x1b[0;93mmist run\x1b[0m",
                                                            next: [simulatorRoute],
                                                        },
                                                        {
                                                            cmd: "role",
                                                            required: true,
                                                            text: "  to assign the Developer role to yourself with the command:\n    \x1b[0;93mmist role Developer --user [email]\x1b[0m",
                                                            next: [payedRoute],
                                                        },
                                                        {
                                                            cmd: "capability",
                                                            required: true,
                                                            text: "  to add the write_source_code to the Administrator role with the command:\n    \x1b[0;93mmist capability write_source_code --role Administrator\x1b[0m",
                                                            next: [payedRoute],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
const earlyAccessTutorial = [
    {
        cmd: "login",
        required: true,
        text: "  to login to mist-cloud with the command:\n    \x1b[0;93mmist login [email]\x1b[0m",
    },
    {
        cmd: "org",
        required: true,
        text: "  to create an organization with the command:\n    \x1b[0;93mmist org [organization name]\x1b[0m",
    },
    {
        cmd: "in_org",
        required: true,
        text: "  to go into an organization folder with the command:\n    \x1b[0;93mcd [organization name]\x1b[0m",
    },
    {
        cmd: "team",
        required: false,
        text: "  to create a team with the command:\n    \x1b[0;93mmist team [team name]\x1b[0m",
    },
    {
        cmd: "in_team",
        required: true,
        text: "  to go into a team folder with the command:\n    \x1b[0;93mcd [team name]\x1b[0m",
    },
    {
        cmd: "service",
        required: true,
        text: "  to create a service with the command:\n    \x1b[0;93mmist service [service name]\x1b[0m",
    },
    {
        cmd: "in_service",
        required: true,
        text: "  to go into a service folder with the command:\n    \x1b[0;93mcd [service name]\x1b[0m",
    },
    // {
    //   cmd: "run",
    //   required: false,
    //   text: "  to run a local simulation of the system with the command:\n    \x1b[0;93mmist run\x1b[0m",
    // },
    {
        cmd: "role",
        required: false,
        text: "  to assign the Developer role to yourself with the command:\n    \x1b[0;93mmist role Developer --user [email]\x1b[0m",
    },
    {
        cmd: "capability",
        required: false,
        text: "  to add the write_source_code to the Administrator role with the command:\n    \x1b[0;93mmist capability write_source_code --role Administrator\x1b[0m",
    },
    {
        cmd: "deploy",
        required: false,
        text: "  to deploy the service and the event-catalogue with git or the command:\n    \x1b[0;93mmist deploy\x1b[0m",
    },
    {
        cmd: "deploy",
        required: false,
        text: "  to deploy the service and the event-catalogue with git or the command:\n    \x1b[0;93mmist deploy\x1b[0m",
    },
    {
        cmd: "key",
        required: true,
        text: "  to create a new api key with the command:\n    \x1b[0;93mmist key 1year\x1b[0m",
    },
    {
        cmd: "event",
        required: true,
        text: "  to allow an event through the api key with the command:\n    \x1b[0;93mmist event [event] --key [key]\x1b[0m",
    },
    {
        cmd: "call",
        required: false,
        text: "  to call your service with curl or the command:\n    \x1b[0;93mmist call [event] --key [key]\x1b[0m",
    },
];
class LinearContextHelp {
    toString() {
        let history = (0, utils_1.getHistory)();
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        if (org !== null)
            history.push("in_org");
        if (team !== null)
            history.push("in_team");
        if (fs_1.default.existsSync("mist.json"))
            history.push("in_service");
        history.forEach((x) => {
            let i = earlyAccessTutorial.findIndex((t) => t.cmd === x);
            earlyAccessTutorial.splice(0, i + 1);
        });
        if (earlyAccessTutorial.length === 0)
            return ``;
        let output = "";
        let i = -1;
        do {
            i++;
            if (output !== "")
                output += "or: \n";
            output += earlyAccessTutorial[i].text + "\n";
        } while (i < earlyAccessTutorial.length &&
            !earlyAccessTutorial[i].required);
        return `\nYour next step might be:\n` + output;
    }
}
function findPaths(t, cmd) {
    return t.flatMap((x) => (x.cmd === cmd ? [x] : findPaths(x.next, cmd)));
}
function collectOptional(t) {
    if (t.required)
        return [t];
    return [t, ...t.next.flatMap((x) => collectOptional(x))];
}
function printNextSteps(t) {
    return t
        .flatMap((x) => x.next)
        .flatMap((x) => collectOptional(x))
        .map((x) => x.text + "\n")
        .join("or\n");
}
class ContextHelp {
    toString() {
        let history = (0, utils_1.getHistory)();
        let { org, team } = (0, utils_1.fetchOrgRaw)();
        if (org !== null)
            history.push("in_org");
        if (team !== null)
            history.push("in_team");
        if (fs_1.default.existsSync("mist.json"))
            history.push("in_service");
        let journeys = [
            ...new Set(history.reduce((a, x) => {
                let fp = findPaths(a, x);
                if (fp.length === 0)
                    return a;
                else
                    return fp;
            }, [tutorials])),
        ];
        let output = printNextSteps(journeys);
        if (output === "")
            return ``;
        return `\nYour next step might be:\n` + output;
    }
}
exports.argParser = new typed_cmdargs_1.ArgumentParser(new HandleHelpArgument(), new ContextHelp());
