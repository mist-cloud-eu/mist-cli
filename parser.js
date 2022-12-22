"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.argParser = void 0;
const typed_cmdargs_1 = require("typed-cmdargs");
class HandleHelpArgument {
    help(command) {
        return `Unknown argument 'help'. Did you mean: mist help ${command}`;
    }
}
exports.argParser = new typed_cmdargs_1.ArgumentParser(new HandleHelpArgument());
