import { DevOpsTemplateDefinition } from "./devops-templates";
export declare class TemplateRegistryService {
    listTemplates(): DevOpsTemplateDefinition[];
    getTemplate(templateKey: string): DevOpsTemplateDefinition | null;
    isSupported(templateKey: string): boolean;
}
