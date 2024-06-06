export const log = (...args: unknown[]): void => {
    // eslint-disable-next-line no-console -- logger
    console.log("LOGGER: ", ...args);
};
export const error = (...args: unknown[]): void => {
    // eslint-disable-next-line no-console -- logger
    console.error("ERROR: ", ...args);
}
