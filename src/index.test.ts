import { EventEmitter } from "events";

import type Hermione from "hermione";

import plugin from "./";
import * as readToken from "./read-token";

jest.mock("./config", () => ({ parseConfig: jest.fn(opts => opts) }));

jest.mock("./read-token");
const readTokenMock = readToken as jest.Mocked<typeof readToken>;

describe("hermione-oauth", () => {
    const browser = (config: object = {}): Hermione.BrowserConfig => config as unknown as Hermione.BrowserConfig;

    const hermioneMock = (browsers: Record<string, Hermione.BrowserConfig>): Hermione => {
        const emitter = new EventEmitter() as unknown as Hermione;

        emitter.events = { BEGIN: "begin" } as Hermione.EVENTS;
        emitter.config = {
            forBrowser: (id: string) => browsers[id],
            getBrowserIds: () => Object.keys(browsers),
        } as Hermione.Config;

        return emitter;
    };

    test("should do nothing if plugin is disabled", () => {
        const config = { headers: { "<foo>": "<bar>" } };
        const hermione = hermioneMock({ "<bro-id>": browser(config) });

        plugin(hermione, { enabled: false });
        hermione.emit(hermione.events.BEGIN);

        expect(config).toEqual({ headers: { "<foo>": "<bar>" } });
    });

    test("should set token for each browser config", () => {
        const [config1, config2] = [{ headers: { "<foo>": "<bar>" } }, { headers: { "<baz>": "<quux>" } }];
        const hermione = hermioneMock({ "<bro1-id>": browser(config1), "<bro2-id>": browser(config2) });

        plugin(hermione, { enabled: true, token: "123456789" });
        hermione.emit(hermione.events.BEGIN);

        expect(config1).toEqual({ headers: { "<foo>": "<bar>", Authorization: "OAuth 123456789" } });
        expect(config2).toEqual({ headers: { "<baz>": "<quux>", Authorization: "OAuth 123456789" } });
    });

    test("should not set token if authorization header is already set", () => {
        const config = { headers: { Authorization: "<foo>" } };
        const hermione = hermioneMock({ "<bro-id>": browser(config) });

        plugin(hermione, { enabled: true, token: "123456789" });
        hermione.emit(hermione.events.BEGIN);

        expect(config).toEqual({ headers: { Authorization: "<foo>" } });
    });

    test("should read token from file when it is given as absolute path", () => {
        const hermione = hermioneMock({ "<bro-id>": browser() });

        plugin(hermione, { enabled: true, token: "/foo/bar", help: "https://<help>" });

        expect(readTokenMock.default).toHaveBeenCalledTimes(1);
        expect(readTokenMock.default).toHaveBeenCalledWith("/foo/bar", "https://<help>");
    });

    test("should set token from file for each browser config", () => {
        readTokenMock.default.mockReturnValue("987654321");

        const [config1, config2] = [{ headers: { "<foo>": "<bar>" } }, { headers: { "<baz>": "<quux>" } }];
        const hermione = hermioneMock({ "<bro1-id>": browser(config1), "<bro2-id>": browser(config2) });

        plugin(hermione, { enabled: true, token: "/foo/bar" });
        hermione.emit(hermione.events.BEGIN);

        expect(config1).toEqual({ headers: { "<foo>": "<bar>", Authorization: "OAuth 987654321" } });
        expect(config2).toEqual({ headers: { "<baz>": "<quux>", Authorization: "OAuth 987654321" } });
    });

    test("should not set token from file if authorization header is already set", () => {
        readTokenMock.default.mockReturnValue("987654321");

        const config = { headers: { Authorization: "<foo>" } };
        const hermione = hermioneMock({ "<bro-id>": browser(config) });

        plugin(hermione, { enabled: true, token: "/foo/bar" });

        hermione.emit(hermione.events.BEGIN);

        expect(config).toEqual({ headers: { Authorization: "<foo>" } });
    });
});
