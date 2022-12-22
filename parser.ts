import { ArgumentParser, HelpArgumentText } from "typed-cmdargs";
class HandleHelpArgument implements HelpArgumentText {
  help(command: string) {
    return `Unknown argument 'help'. Did you mean: mist help ${command}`;
  }
}
export const argParser = new ArgumentParser(new HandleHelpArgument());
