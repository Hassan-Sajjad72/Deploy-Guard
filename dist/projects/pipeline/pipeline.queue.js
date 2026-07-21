"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelineQueueProvider = void 0;
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const redis_config_1 = require("./redis.config");
const pipeline_types_1 = require("./pipeline.types");
exports.pipelineQueueProvider = {
    provide: pipeline_types_1.PIPELINE_QUEUE,
    inject: [config_1.ConfigService],
    useFactory: (config) => new bullmq_1.Queue(pipeline_types_1.PIPELINE_QUEUE_NAME, {
        connection: (0, redis_config_1.createRedisConnection)(config),
        defaultJobOptions: {
            removeOnComplete: { age: 86400, count: 100 },
            removeOnFail: { age: 604800, count: 250 },
        },
    }),
};
//# sourceMappingURL=pipeline.queue.js.map