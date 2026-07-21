import { TemplateRegistryService } from "./template-registry.service";
export declare class TemplatesController {
    private readonly templateRegistryService;
    constructor(templateRegistryService: TemplateRegistryService);
    listTemplates(): {
        templates: import("./devops-templates").DevOpsTemplateDefinition[];
    };
}
