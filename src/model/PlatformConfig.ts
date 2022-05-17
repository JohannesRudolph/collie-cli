import { CliToolEnv } from "./CliToolEnv.ts";

export interface PlatformConfigBase {
  id: string;
  name: string;
  cli?: CliToolEnv;
}

type AwsConfig = {
  aws: {
    accountId: string;
    accountAccessRole: string;
  };
};

export type PlatformConfigAws = PlatformConfigBase & AwsConfig;

type GcpConfig = {
  gcp: {
    project: string; // project name
    // todo: billing settings
  };
};

export type PlatformConfigGcp = PlatformConfigBase & GcpConfig;

type AzureConfig = {
  azure: {
    aadTenantId: string;
    subscriptionId: string;
  };
};
export type PlatformConfigAzure = PlatformConfigBase & AzureConfig;

export type PlatformConfig =
  | PlatformConfigAws
  | PlatformConfigGcp
  | PlatformConfigAzure;

/**
 * The frontmatter stored in a foundation/x/platforms/y/README.md file
 */

export type PlatformFrontmatter =
  & {
    name?: string;
    cli?: CliToolEnv;
  }
  & Partial<AwsConfig>
  & Partial<GcpConfig>
  & Partial<AzureConfig>;

export function configToFrontmatter(
  config: PlatformConfig,
): PlatformFrontmatter {
  const frontmatter: PlatformFrontmatter & { id?: string } = { ...config };

  delete frontmatter.id;

  return frontmatter;
}
