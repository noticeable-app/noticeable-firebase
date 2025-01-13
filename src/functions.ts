export class Functions {
    /**
     * Initializes a set of functions.
     *
     * @param functions A dictionary of functions to export.
     * The key is the function name and the value is the path to the source code of the function to export.
     */
    public static init(
        functions: Record<string, string>,
    ): Record<string, unknown> {
        const exports = {}

        if (process.env.FUNCTION_TARGET) {
            const functionPath = functions[process.env.FUNCTION_TARGET]

            if (functionPath) {
                exports[process.env.FUNCTION_TARGET] = require(
                    `${process.cwd()}/dist/${functionPath}`,
                )
            } else {
                throw new Error(
                    `No matching function found: ${process.env.FUNCTION_TARGET}`,
                )
            }
        } else {
            for (const functionName in functions) {
                const functionPath = functions[functionName]
                exports[functionName] = require(
                    `${process.cwd()}/dist/${functionPath}`,
                )
            }
        }

        return exports
    }
}
