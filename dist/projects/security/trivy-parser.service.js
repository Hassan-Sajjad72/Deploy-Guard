"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrivyParserService = void 0;
const common_1 = require("@nestjs/common");
const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];
let TrivyParserService = class TrivyParserService {
    parse(rawJson) {
        let parsed;
        try {
            parsed = JSON.parse(rawJson || "{}");
        }
        catch {
            throw new Error("Invalid Trivy JSON output.");
        }
        const findings = [];
        const results = Array.isArray(parsed.Results) ? parsed.Results : [];
        for (const result of results) {
            const vulnerabilities = Array.isArray(result.Vulnerabilities)
                ? result.Vulnerabilities
                : [];
            for (const vulnerability of vulnerabilities) {
                findings.push({
                    vulnerabilityId: String(vulnerability.VulnerabilityID || "UNKNOWN"),
                    severity: this.normalizeSeverity(vulnerability.Severity),
                    packageName: this.stringOrNull(vulnerability.PkgName),
                    installedVersion: this.stringOrNull(vulnerability.InstalledVersion),
                    fixedVersion: this.stringOrNull(vulnerability.FixedVersion),
                    target: this.stringOrNull(result.Target),
                    type: this.stringOrNull(result.Type),
                    title: this.stringOrNull(vulnerability.Title),
                    description: this.stringOrNull(vulnerability.Description),
                    primaryUrl: this.stringOrNull(vulnerability.PrimaryURL),
                });
            }
        }
        const counts = {
            total: findings.length,
            critical: findings.filter((finding) => finding.severity === "CRITICAL").length,
            high: findings.filter((finding) => finding.severity === "HIGH").length,
            medium: findings.filter((finding) => finding.severity === "MEDIUM").length,
            low: findings.filter((finding) => finding.severity === "LOW").length,
            unknown: findings.filter((finding) => finding.severity === "UNKNOWN").length,
        };
        return {
            findings,
            counts,
            summary: {
                artifactName: parsed["ArtifactName"] || null,
                artifactType: parsed["ArtifactType"] || null,
                resultsCount: results.length,
            },
        };
    }
    normalizeSeverity(value) {
        const severity = String(value || "UNKNOWN").toUpperCase();
        return SEVERITIES.includes(severity) ? severity : "UNKNOWN";
    }
    stringOrNull(value) {
        return value === undefined || value === null || value === ""
            ? null
            : String(value);
    }
};
exports.TrivyParserService = TrivyParserService;
exports.TrivyParserService = TrivyParserService = __decorate([
    (0, common_1.Injectable)()
], TrivyParserService);
//# sourceMappingURL=trivy-parser.service.js.map