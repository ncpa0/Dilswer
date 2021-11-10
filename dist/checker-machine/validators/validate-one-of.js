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
exports.validateOneOf = void 0;
var validation_error_1 = require("../validation-error/validation-error");
var validate_type_1 = require("./validate-type");
var validateOneOf = function (path, type, data) {
    var e_1, _a;
    var passed = false;
    try {
        for (var _b = __values(type.oneOf), _c = _b.next(); !_c.done; _c = _b.next()) {
            var dataType = _c.value;
            try {
                (0, validate_type_1.validateType)(path, dataType, data);
                passed = true;
                break;
            }
            catch (e) { }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (passed)
        return;
    throw new validation_error_1.ValidationError(path, type, data);
};
exports.validateOneOf = validateOneOf;
