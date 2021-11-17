"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnum = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validateEnum = function (path, type, data) {
    var isDataEqualToAnyMember = Object.entries(type.enumInstance).some(function (_a) {
        var _b = __read(_a, 2), key = _b[0], member = _b[1];
        return isNaN(Number(key)) && member === data;
    });
    if (!isDataEqualToAnyMember) {
        throw new validation_error_1.ValidationError(path, type, data);
    }
};
exports.validateEnum = validateEnum;
