import { option, root, section } from "gemini-configparser";
import type { Parser } from "gemini-configparser";

import { PluginOptionTypeError, PluginTokenOptionAbsenceError } from "./errors";

export type PluginConfig =
    | { enabled: true; token: string; help: string }
    | { enabled: false; token?: string; help?: string };

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

export function parseConfig(options: Record<string, unknown>): PluginConfig {
    const { env, argv } = process;

    const parseOptions = root<PluginConfig>(
        section({
            enabled: boolean("enabled"),
            token: option({
                defaultValue: "",
                validate: (v, config) => {
                    if (!isNonEmptyString(v) && config.enabled) {
                        throw new PluginTokenOptionAbsenceError(config.help);
                    }
                },
            }),
            help: option({
                defaultValue: "",
                validate: (v, config) => {
                    if (config.enabled) {
                        assertType("help", isNonEmptyString, "non empty string")(v);
                    }
                },
            }),
        }),
        { envPrefix: "testplane_oauth_", cliPrefix: "--oauth-" },
    );

    return parseOptions({ options, env, argv });
}
