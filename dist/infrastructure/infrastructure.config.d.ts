import { ConfigService } from "@nestjs/config";
export type InfrastructureConfig = {
    awsRegion: string;
    terraformBin: string;
    terraformWorkingBaseDir: string;
    terraformNetworkTemplateDir: string;
    terraformAutoApprove: boolean;
    terraformApplyEnabled: boolean;
    defaultVpcCidr: string;
    publicSubnetCidrs: string[];
    privateSubnetCidrs: string[];
    singleNatGateway: boolean;
    cloudMapNamespace: string;
    enableHttps: boolean;
    defaultAppPort: number;
};
export declare function getInfrastructureConfig(config: ConfigService): InfrastructureConfig;
