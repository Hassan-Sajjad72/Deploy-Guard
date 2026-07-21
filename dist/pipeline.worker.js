"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const pipeline_worker_service_1 = require("./projects/pipeline/pipeline-worker.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const worker = app.get(pipeline_worker_service_1.PipelineWorkerService);
    worker.start();
}
bootstrap();
//# sourceMappingURL=pipeline.worker.js.map