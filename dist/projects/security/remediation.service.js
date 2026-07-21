"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationService = void 0;
const common_1 = require("@nestjs/common");
let RemediationService = class RemediationService {
    remediate(finding, profile) {
        if (this.isBaseImageFinding(finding)) {
            return "Update the base image to a newer supported tag and rebuild the image.";
        }
        if (!finding.packageName) {
            return "Review the upstream advisory for remediation guidance.";
        }
        if (!finding.fixedVersion) {
            return "No fixed version is currently available. Monitor upstream advisory.";
        }
        const packageManager = profile?.packageManager || "";
        const ecosystem = profile?.ecosystem || "";
        if (ecosystem === "node" || ["npm", "yarn", "pnpm"].includes(packageManager)) {
            if (packageManager === "yarn") {
                return `yarn upgrade ${finding.packageName}@${finding.fixedVersion}`;
            }
            if (packageManager === "pnpm") {
                return `pnpm update ${finding.packageName}@${finding.fixedVersion}`;
            }
            return `npm update ${finding.packageName}@${finding.fixedVersion}`;
        }
        if (ecosystem === "python" ||
            ["pip", "poetry"].includes(packageManager) ||
            finding.type === "python-pkg") {
            if (packageManager === "poetry") {
                return `poetry add ${finding.packageName}@${finding.fixedVersion}`;
            }
            return `pip install ${finding.packageName}==${finding.fixedVersion}`;
        }
        return `Update ${finding.packageName} to ${finding.fixedVersion}.`;
    }
    isBaseImageFinding(finding) {
        return (finding.type === "os" ||
            finding.type === "alpine" ||
            finding.type === "debian" ||
            finding.type === "ubuntu" ||
            /debian|alpine|ubuntu|centos|redhat|oracle/i.test(finding.target || ""));
    }
};
exports.RemediationService = RemediationService;
exports.RemediationService = RemediationService = __decorate([
    (0, common_1.Injectable)()
], RemediationService);
//# sourceMappingURL=remediation.service.js.map