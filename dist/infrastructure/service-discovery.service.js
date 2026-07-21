"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_service_discovery_record_entity_1 = require("./project-service-discovery-record.entity");
let ServiceDiscoveryService = class ServiceDiscoveryService {
    constructor(recordRepository) {
        this.recordRepository = recordRepository;
    }
    mapCloudMapOutputs(outputs) {
        return {
            namespaceId: String(outputs.cloud_map_namespace_id || ""),
            namespaceName: String(outputs.cloud_map_namespace_name || ""),
            dnsName: String(outputs.cloud_map_service_discovery_domain || ""),
            cloudMapServiceId: outputs.default_cloud_map_service_id
                ? String(outputs.default_cloud_map_service_id)
                : null,
        };
    }
    buildInternalDnsName(serviceName, namespaceName) {
        return `${serviceName}.${namespaceName}`;
    }
    async saveServiceDiscoveryRecord(projectId, infrastructureEnvironmentId, serviceName, outputs) {
        const mapped = this.mapCloudMapOutputs(outputs);
        if (!mapped.namespaceId || !mapped.namespaceName) {
            return null;
        }
        const existing = await this.recordRepository.findOne({
            where: { projectId, infrastructureEnvironmentId, serviceName },
        });
        const record = existing || this.recordRepository.create({ projectId, infrastructureEnvironmentId, serviceName });
        record.namespaceId = mapped.namespaceId;
        record.namespaceName = mapped.namespaceName;
        record.cloudMapServiceId = mapped.cloudMapServiceId;
        record.dnsName = this.buildInternalDnsName(serviceName, mapped.namespaceName);
        record.status = "ready";
        record.metadata = { cloudMapDomain: mapped.dnsName };
        return this.recordRepository.save(record);
    }
};
exports.ServiceDiscoveryService = ServiceDiscoveryService;
exports.ServiceDiscoveryService = ServiceDiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_service_discovery_record_entity_1.ProjectServiceDiscoveryRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServiceDiscoveryService);
//# sourceMappingURL=service-discovery.service.js.map