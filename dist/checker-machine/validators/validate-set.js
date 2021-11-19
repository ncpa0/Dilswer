"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSet = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validate_one_of_1 = require("./validate-one-of");
var isSet = function (data) {
    return (typeof data === "object" &&
        data !== null &&
        // @ts-expect-error
        data[Symbol.toStringTag] === "Set");
};
var validateSet = function (path, type, data) {
    var e_1, _a;
    if (!isSet(data))
        throw new validation_error_1.ValidationError(path, type, data);
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var elem = data_1_1.value;
            (0, validate_one_of_1.validateOneOf)("".concat(path, ".SET"), { oneOf: type.setOf }, elem);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
};
exports.validateSet = validateSet;
