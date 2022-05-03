import * as colors from "std/fmt/colors";
import { CollieRepository } from "/model/CollieRepository.ts";
import { CmdGlobalOptions } from "/commands/cmd-options.ts";

/**
 * Convenienve format utils we supply to logging methods callbacks. Using these methods simplifies common formatting
 * operations without consumers having to explicitly pull in other modules/dependencies.
 */
export interface FormatUtils {
  kitPath(path: string): string;
}
/**
 * Standardizes concerns relating to CLI logging
 *
 * All "logs" should go to stderr by default, we hence use console.error to write them.
 * Collie reserves stdout for primary output.
 *
 * See https://julienharbulot.com/python-cli-streams.html for rationale.
 */
export class Logger {
  private enableVerbose: boolean;
  private enableDebug: boolean;
  private fmtUtils: FormatUtils;

  constructor(kit: CollieRepository, opts: CmdGlobalOptions) {
    this.enableVerbose = opts.verbose;
    this.enableDebug = opts.debug;

    this.fmtUtils = {
      kitPath(dest: string) {
        return kit.relativePath(dest);
      },
    };
  }

  public verbose(f: (fmt: FormatUtils) => string) {
    if (this.enableVerbose) {
      const msg = f(this.fmtUtils);
      console.error(colors.gray(msg));
    }
  }

  public debug(f: (fmt: FormatUtils) => string) {
    if (this.enableDebug) {
      const msg = f(this.fmtUtils);
      console.error(colors.gray(msg));
    }
  }

  public progress(msg: string) {
    console.error(colors.bold(colors.green(msg)));
  }

  public warn(msg: string) {
    console.error(colors.yellow(msg));
  }
}
