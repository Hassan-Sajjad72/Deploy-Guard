import { ConfigService } from "@nestjs/config";
export type NormalizedCostResource = {
    resourceType: string;
    resourceName: string;
    serviceName?: string | null;
    monthlyCost: number;
    hourlyCost?: number | null;
    unit?: string | null;
    quantity?: number | null;
    metadata?: Record<string, unknown>;
};
export declare class InfracostService {
    private readonly config;
    constructor(config: ConfigService);
    runInfracostBreakdown(planJson: string, workdir: string): Promise<string>;
    parseInfracostResponse(rawJson: string): any;
    normalizeCostBreakdown(raw: Record<string, unknown>): NormalizedCostResource[];
    private mapResourceType;
}
