import type { OneOf } from "../types";
import type { ExcludeOneOf } from "./types";
/**
 * Excludes given basic Data Types from the OneOf Data Type.
 * Similar to the Typescript's `Exclude<>` utility type.
 */
export declare const Exclude: <U extends OneOf<any[]>, E extends "string" | "number" | "boolean" | "symbol" | "undefined" | "function" | "unknown" | "integer" | "null" | "stringnumeral" | "stringinteger">(union: U, ...excludeTypes: E[]) => ExcludeOneOf<U, E>;
