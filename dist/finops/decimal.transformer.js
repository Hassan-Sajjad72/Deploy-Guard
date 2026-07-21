"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalTransformer = void 0;
exports.decimalTransformer = {
    to(value) {
        if (value === undefined || value === null || value === "") {
            return "0";
        }
        return value;
    },
    from(value) {
        if (value === undefined || value === null || value === "") {
            return 0;
        }
        return Number(value);
    },
};
//# sourceMappingURL=decimal.transformer.js.map