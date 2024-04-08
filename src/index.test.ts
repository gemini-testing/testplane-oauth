import { EventEmitter } from "events";

import type Testplane from "testplane";
import type { Config } from "testplane";

import plugin from "./";
import * as readToken from "./read-token";

type BrowserConfig = Config["browsers"][string];

jest.mock("./config", () => ({ parseConfig: jest.fn(opts => opts) }));

jest.mock("./read-token");
const readTokenMock = readToken as jest.Mocked<typeof readToken>;

describe("@testplane/oauth", () => {
    const browser = (config: object = {}): BrowserConfig => config as unknown as BrowserConfig;

    const testplaneMock = (browsers: Record<string, BrowserConfig>): Testplane => {
        const emitter = new EventEmitter() as any;

        emitter.events = { BEGIN: "begin" }
        emitter.config = {
            forBrowser: (id: string) => browsers[id],
            getBrowserIds: () => Object.keys(browsers),
        } as Config;

        return emitter;
    };

    test("should do nothing if plugin is disabled", () => {
        const config = { headers: { "<foo>": "<bar>" } };
        const testplane = testplaneMock({ "<bro-id>": browser(config) });

        plugin(testplane, { enabled: false });
        testplane.emit(testplane.events.BEGIN);

        expect(config).toEqual({ headers: { "<foo>": "<bar>" } });
    });

    test("should set token for each browser config", () => {
        const [config1, config2] = [{ headers: { "<foo>": "<bar>" } }, { headers: { "<baz>": "<quux>" } }];
        const testplane = testplaneMock({ "<bro1-id>": browser(config1), "<bro2-id>": browser(config2) });

        plugin(testplane, { enabled: true, token: "123456789" });
        testplane.emit(testplane.events.BEGIN);

        expect(config1).toEqual({ headers: { "<foo>": "<bar>", Authorization: "OAuth 123456789" } });
        expect(config2).toEqual({ headers: { "<baz>": "<quux>", Authorization: "OAuth 123456789" } });
    });

    test("should not set token if authorization header is already set", () => {
        const config = { headers: { Authorization: "<foo>" } };
        const testplane = testplaneMock({ "<bro-id>": browser(config) });

        plugin(testplane, { enabled: true, token: "123456789" });
        testplane.emit(testplane.events.BEGIN);

        expect(config).toEqual({ headers: { Authorization: "<foo>" } });
    });

    test("should read token from file when it is given as absolute path", () => {
        const testplane = testplaneMock({ "<bro-id>": browser() });

        plugin(testplane, { enabled: true, token: "/foo/bar", help: "https://<help>" });

        expect(readTokenMock.default).toHaveBeenCalledTimes(1);
        expect(readTokenMock.default).toHaveBeenCalledWith("/foo/bar", "https://<help>");
    });

    test("should set token from file for each browser config", () => {
        readTokenMock.default.mockReturnValue("987654321");

        const [config1, config2] = [{ headers: { "<foo>": "<bar>" } }, { headers: { "<baz>": "<quux>" } }];
        const testplane = testplaneMock({ "<bro1-id>": browser(config1), "<bro2-id>": browser(config2) });

        plugin(testplane, { enabled: true, token: "/foo/bar" });
        testplane.emit(testplane.events.BEGIN);

        expect(config1).toEqual({ headers: { "<foo>": "<bar>", Authorization: "OAuth 987654321" } });
        expect(config2).toEqual({ headers: { "<baz>": "<quux>", Authorization: "OAuth 987654321" } });
    });

    test("should not set token from file if authorization header is already set", () => {
        readTokenMock.default.mockReturnValue("987654321");

        const config = { headers: { Authorization: "<foo>" } };
        const testplane = testplaneMock({ "<bro-id>": browser(config) });

        plugin(testplane, { enabled: true, token: "/foo/bar" });

        testplane.emit(testplane.events.BEGIN);

        expect(config).toEqual({ headers: { Authorization: "<foo>" } });
    });
});
