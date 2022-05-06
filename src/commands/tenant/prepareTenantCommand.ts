import { QueryStatistics } from "../../mesh/QueryStatistics.ts";
import { MeshTableFactory } from "../../presentation/mesh-table-factory.ts";
import { CmdGlobalOptions } from "../cmd-options.ts";
import { isatty } from "../tty.ts";
import { CollieRepository } from "/model/CollieRepository.ts";
import { FoundationRepository } from "../../model/FoundationRepository.ts";
import { MeshFoundationAdapterFactory } from "../../mesh/MeshFoundationAdapterFactory.ts";
import { Logger } from "../../cli/Logger.ts";
import { CliApiFacadeFactory } from "../../api/CliApiFacadeFactory.ts";
import { TenantCommandOptions } from "./TenantCommandOptions.ts";
import { ModelValidator } from "../../model/schemas/ModelValidator.ts";

export async function prepareTenantCommand(
  options: CmdGlobalOptions & TenantCommandOptions,
  foundation: string,
) {
  const collieRepo = await CollieRepository.load("./");

  const logger = new Logger(collieRepo, options);

  const validator = new ModelValidator(logger);

  const foundationRepo = await FoundationRepository.load(
    collieRepo,
    foundation,
    validator,
  );

  const facadeFactory = new CliApiFacadeFactory(logger);
  const meshAdapterFactory = new MeshFoundationAdapterFactory(
    collieRepo,
    foundationRepo,
    facadeFactory,
    logger,
  );

  const platforms = options.platform
    ? [foundationRepo.findPlatform(options.platform)]
    : foundationRepo.platforms;

  const queryStatistics = new QueryStatistics();
  const meshAdapter = await meshAdapterFactory.buildMeshAdapter(
    platforms,
    queryStatistics,
    options.refresh,
  );

  const tableFactory = new MeshTableFactory(isatty);

  return { meshAdapter, tableFactory, queryStatistics };
}
