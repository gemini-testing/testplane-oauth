class PluginError extends Error {
    constructor(message: string) {
        super(`@testplane/oauth: ${message}`);
    }
}

export class PluginOptionTypeError extends PluginError {
    constructor(name: string, type: string) {
        super(`'${name}' option must be of a ${type} type`);
    }
}

export class PluginTokenError extends PluginError {
    constructor(message: string, help: string) {
        super(`${message}, see ${help} to get it`);
    }
}

export class PluginTokenReadError extends PluginTokenError {
    constructor(path: string, help: string) {
        super(`unable to read token from file ${path}`, help);
    }
}

export class PluginTokenOptionAbsenceError extends PluginTokenError {
    constructor(help: string) {
        super("'token' option must be of a non empty string type", help);
    }
}

export class PluginTokenAbsenceError extends PluginTokenError {
    constructor(filepath: string, help: string) {
        super(`token is absence at file ${filepath}`, help);
    }
}
