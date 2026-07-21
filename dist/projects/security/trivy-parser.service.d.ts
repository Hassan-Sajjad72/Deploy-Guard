export type NormalizedFinding = {
    vulnerabilityId: string;
    severity: string;
    packageName: string | null;
    installedVersion: string | null;
    fixedVersion: string | null;
    target: string | null;
    type: string | null;
    title: string | null;
    description: string | null;
    primaryUrl: string | null;
};
export type ParsedTrivyResult = {
    findings: NormalizedFinding[];
    counts: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        unknown: number;
    };
    summary: Record<string, unknown>;
};
export declare class TrivyParserService {
    parse(rawJson: string): ParsedTrivyResult;
    private normalizeSeverity;
    private stringOrNull;
}
