import path from "path";

import type Hermione from "hermione";

import { parseConfig } from "./config";
import readToken from "./read-token";

export = (hermione: Hermione, options: Record<string, unknown>): void => {
    const config = parseConfig(options);

    if (!config.enabled) {
        return;
    }

    const token = path.isAbsolute(config.token) ? readToken(config.token, config.help) : config.token;

    hermione.on(hermione.events.BEGIN, () => {
        hermione.config.getBrowserIds().forEach(browserId => {
            const browserConfig = hermione.config.forBrowser(browserId);

            browserConfig.headers = { Authorization: `OAuth ${token}`, ...browserConfig.headers };
        });
    });
};
