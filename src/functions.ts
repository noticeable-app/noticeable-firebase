import * as camelCase from 'lodash/camelCase';

export class Functions {
    /**
     * A dictionary of functions to export.
     *
     * The key is the path to the source code of the function to export
     * and the value is a boolean that says whether the function must be
     * exported or not.
     */
    public static init(functions) {
        const exports = {};

        for (const path in functions) {
            // exports enabled functions only
            if (functions[path]) {
                // removes file extension
                const chunks = path.slice(0, -3).split('/');
                chunks.shift();
                // coerces file name to valid function name
                const functionName = camelCase(chunks);

                // export code for the current process function only
                if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
                    exports[functionName] = require(`${process.cwd()}/dist/${path}`);

                    if (process.env.FUNCTION_NAME === functionName) {
                        break;
                    }
                }
            }
        }

        return exports;
    }
}
