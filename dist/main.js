"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NestJS Backend running!
  URL: http://localhost:${port}
  Auth endpoint: POST /auth/github/callback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map