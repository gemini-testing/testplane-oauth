import { parseConfig } from "./config";

import type { PluginConfig } from "./config";

describe("config", () => {
    const config = (params: Record<string, unknown> = {}): Partial<PluginConfig> => ({
        token: "<token>",
        help: "<help>",
        ...params,
    });

    describe("'enabled' option", () => {
        test("should throw if passed value is not of a boolean type", () => {
            expect(() => parseConfig({ enabled: 0 })).toThrow(/'enabled' option must be of a boolean type/);
        });

        test("should be enabled by default", () => {
            expect(parseConfig(config()).enabled).toBeTruthy();
        });

        test("should set passed value", () => {
            expect(parseConfig(config({ enabled: false })).enabled).toBeFalsy();
        });
    });

    describe("'token' option", () => {
        test("should throw if passed value is not of a string type", () => {
            const options = config({ token: 0, help: "https://<help>" });

            expect(() => parseConfig(options)).toThrow(
                /'token' option must be of a non empty string type, see https:\/\/<help> to get it/,
            );
        });

        test("should throw if passed value is an empty string", () => {
            const options = config({ token: "", help: "https://<help>" });

            expect(() => parseConfig(options)).toThrow(
                /'token' option must be of a non empty string type, see https:\/\/<help> to get it/,
            );
        });

        test("should set passed value", () => {
            expect(parseConfig(config({ token: "123456789" })).token).toBe("123456789");
        });
    });

    describe("'help' option", () => {
        test("should throw if passed value is not of a string type", () => {
            expect(() => parseConfig(config({ help: 0 }))).toThrow(/'help' option must be of a non empty string type/);
        });

        test("should throw if passed value is an empty string", () => {
            expect(() => parseConfig(config({ help: "" }))).toThrow(/'help' option must be of a non empty string type/);
        });

        test("should set passed value", () => {
            expect(parseConfig(config({ help: "https://<help>" })).help).toBe("https://<help>");
        });
    });
});
