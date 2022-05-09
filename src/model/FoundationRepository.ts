import * as fs from "std/fs";
import * as path from "std/path";
import {
  FoundationConfig,
  FoundationFrontmatter,
} from "../model/FoundationConfig.ts";
import { CollieRepository } from "./CollieRepository.ts";
import { MarkdownDocument } from "./MarkdownDocument.ts";
import { PlatformConfig } from "./PlatformConfig.ts";
import {
  CollieModelValidationError,
  ModelValidator,
} from "./schemas/ModelValidator.ts";

export class FoundationRepository {
  constructor(
    private readonly foundationDir: string,
    private readonly config: FoundationConfig,
  ) {}

  public get name(): string {
    return this.config.name;
  }

  public get platforms(): PlatformConfig[] {
    return this.config.platforms;
  }

  findPlatform(platform: string) {
    const p = this.config.platforms.find((x) => x.name === platform);
    if (!p) {
      throw new Error(
        `Could not find platform named "${platform}" in configuration.`,
      );
    }

    return p;
  }

  /**
   * Resolve a path relative to the foundation
   */
  resolvePath(...pathSegments: string[]) {
    return path.resolve(this.foundationDir, ...pathSegments);
  }

  /**
   * Resolve a path relative to a platform
   */
  resolvePlatformPath(platform: PlatformConfig, ...pathSegments: string[]) {
    return this.resolvePath("platforms", platform.name, ...pathSegments);
  }

  static async load(
    kit: CollieRepository,
    foundation: string,
    validator: ModelValidator,
  ): Promise<FoundationRepository> {
    const foundationDir = kit.resolvePath("foundations", foundation);

    const foundationReadme = await FoundationRepository.parseFoundationReadme(
      kit,
      foundationDir,
      validator,
    );

    const platforms = await FoundationRepository.parsePlatformReadmes(
      kit,
      foundationDir,
      validator,
    );

    const config: FoundationConfig = {
      name: foundation,
      meshStack: foundationReadme.meshStack,
      platforms,
    };

    return new FoundationRepository(foundationDir, config);
  }

  private static async parseFoundationReadme(
    kit: CollieRepository,
    foundationDir: string,
    validator: ModelValidator,
  ) {
    const readmePath = path.join(foundationDir, "README.md");
    const text = await Deno.readTextFile(readmePath);
    const md = await MarkdownDocument.parse<FoundationFrontmatter>(text);

    if (!md?.frontmatter) {
      throw new Error(
        "Failed to parse foundation README at " + kit.relativePath(readmePath),
      );
    }

    const config = {
      name: path.basename(foundationDir), // default the name to the directory name
      ...md.frontmatter,
    };

    const { data, errors } = validator.validateFoundationFrontmatter(config);

    // todo: this is not a proper error handling strategy - throw exceptions instead?
    if (errors) {
      throw new CollieModelValidationError(
        "Invalid foundation configuration at " + kit.relativePath(readmePath),
        errors,
      );
    }

    return data;
  }

  private static async parsePlatformReadmes(
    kit: CollieRepository,
    foundationDir: string,
    validator: ModelValidator,
  ): Promise<PlatformConfig[]> {
    const platforms: PlatformConfig[] = [];

    for await (
      const file of fs.expandGlob("platforms/*/README.md", {
        root: foundationDir,
      })
    ) {
      const text = await Deno.readTextFile(file.path);
      const md = await MarkdownDocument.parse<PlatformConfig>(text);

      if (!md?.frontmatter) {
        throw new Error(
          "Failed to parse foundation at " + kit.relativePath(file.path),
        );
      }

      const config = {
        name: path.basename(path.dirname(file.path)), // default the name to the directory name
        ...md.frontmatter,
      };

      const { data, errors } = validator.validatePlatformConfig(config);

      if (errors) {
        throw new CollieModelValidationError(
          "Invalid foundation at " + kit.relativePath(file.path),
          errors,
        );
      }

      platforms.push(data);
    }

    return platforms;
  }
}
