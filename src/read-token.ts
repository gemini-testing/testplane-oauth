import fs from "fs";

import { PluginTokenReadError, PluginTokenAbsenceError } from "./errors";

export default function (filepath: string, help: string): string {
    let token: string;

    try {
        token = fs.readFileSync(filepath, { encoding: "utf-8" }).trim();
    } catch (e) {
        throw new PluginTokenReadError(filepath, help);
    }

    if (token === "") {
        throw new PluginTokenAbsenceError(filepath, help);
    }

    return token;
}
