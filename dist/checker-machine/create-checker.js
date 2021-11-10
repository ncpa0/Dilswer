"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChecker = void 0;
var validate_type_1 = require("./validators/validate-type");
var createChecker = function (dataType) {
    return function (data) {
        try {
            (0, validate_type_1.validateType)("$", dataType, data);
            return true;
        }
        catch (e) {
            return false;
        }
    };
};
exports.createChecker = createChecker;
