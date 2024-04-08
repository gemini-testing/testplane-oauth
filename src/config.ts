import { option, root, section } from "gemini-configparser";
import type { Parser } from "gemini-configparser";

import { PluginOptionTypeError, PluginTokenOptionAbsenceError } from "./errors";

export type PluginConfig = {
    enabled: boolean;
    token: string;
    help: string;
};

const isNonEmptyString = (v: unknown): boolean => typeof v === "string" && v !== "";

const assertType = <T>(name: string, validate: (v: unknown) => boolean, type: string) => {
    return (v: T) => {
        if (!validate(v)) {
            throw new PluginOptionTypeError(name, type);
        }
    };
};

const boolean = (name: string): Parser<boolean> =>
    option({
        parseEnv: v => Boolean(JSON.parse(v)),
        parseCli: v => Boolean(JSON.parse(v)),
        defaultValue: true,
        validate: assertType(name, v => typeof v === "boolean", "boolean"),
    });

const nonEmptyString = (name: string): Parser<string> =>
    option({
        defaultValue: "",
        validate: assertType(name, isNonEmptyString, "non empty string"),
    });

export function parseConfig(options: Record<string, unknown>): PluginConfig {
    const { env, argv } = process;

    const parseOptions = root<PluginConfig>(
        section({
            enabled: boolean("enabled"),
            token: option({
                defaultValue: "",
                validate: (v, config) => {
                    if (!isNonEmptyString(v)) {
                        throw new PluginTokenOptionAbsenceError(config.help);
                    }
                },
            }),
            help: nonEmptyString("help"),
        }),
        { envPrefix: "testplane_oauth_", cliPrefix: "--oauth-" },
    );

    return parseOptions({ options, env, argv });
}
