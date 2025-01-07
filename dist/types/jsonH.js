"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json = (param) => {
    return JSON.stringify(param, (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
};
exports.default = json;
