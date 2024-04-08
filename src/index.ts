import path from "path";

import type Testplane from "testplane";

import { parseConfig } from "./config";
import readToken from "./read-token";

export = (testplane: Testplane, options: Record<string, unknown>): void => {
    const config = parseConfig(options);

    if (!config.enabled) {
        return;
    }

    const token = path.isAbsolute(config.token) ? readToken(config.token, config.help) : config.token;

    testplane.on(testplane.events.BEGIN, () => {
        testplane.config.getBrowserIds().forEach(browserId => {
            const browserConfig = testplane.config.forBrowser(browserId);

            browserConfig.headers = { Authorization: `OAuth ${token}`, ...browserConfig.headers };
        });
    });
};
