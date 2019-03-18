/**
 * @fileoverview ConfigSchema
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { ObjectSchema } = require("@humanwhocodes/object-schema");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function assignThrough(value1, value2) {
    if (value1 === undefined) {
        return value2;
    }

    return (value1 === undefined) ? value2 : value1;
}

function assignObjectThrough(value1, value2) {
    if (value1 === undefined) {
        return value2;
    }

    if (value2 === undefined) {
        return value1;
    }

    return Object.assign({}, value1, value2);
}

function assertIsArray(value, name) {
    if (!Array.isArray(value)) {
        throw new TypeError(`Expected key "${name}" to be an array.`);
    }
}

function assertIsNotArray(value, name) {
    if (Array.isArray(value)) {
        throw new TypeError(`Expected key "${name}" to not be an array.`);
    }
}

function assertIsObject(value, name) {
    if (value == null || typeof value !== "object") {
        throw new TypeError(`Expected key "${name}" to be an object.`);
    }

}

function assertIsArrayOfStrings(value, name) {
    assertIsArray(value, name);

    if (value.some(item => typeof item !== "string")) {
        throw new TypeError(`Expected "${name}" to only contain strings.`);
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = new ObjectSchema({
    files: {
        required: false,
        merge() {
            return undefined;
        },
        validate(value) {
            if (value !== undefined) {
                // assertIsArrayOfStrings(value, this.name);
            }
        }
    },
    ignores: {
        required: false,
        requires: ["files"],
        merge() {
            return undefined;
        },
        validate(value) {
            if (value !== undefined) {
                // assertIsArrayOfStrings(value, this.name);
            }
        }
    },
    globals: {
        required: false,
        merge: assignObjectThrough,
        validate(value) {
            assertIsObject(value, this.name);
        }
    },
    settings: {
        required: false,
        merge: assignObjectThrough,
        validate(value) {
            assertIsObject(value, this.name);
        }
    },
    parserOptions: {
        required: false,
        merge(value1, value2) {
            return Object.assign({}, value1, value2);
        },
        validate(value) {
            assertIsObject(value, this.name);
        }
    },
    rules: {
        required: false,
        merge(value1, value2) {
            // TODO: Fix
            return Object.assign({}, value1, value2);
        },
        validate(value) {
            assertIsObject(value, this.name);
        }
    },
    defs: {
        required: false,
        merge(value1, value2) {
            // TODO: Fix
            return assignObjectThrough(value1, value2);
        },
        validate(value) {
            assertIsObject(value, this.name);
        }
    },
    processor: {
        required: false,
        merge: assignThrough,
        validate(value) {
            assertIsObject(value, this.name);
        }
    }

});
