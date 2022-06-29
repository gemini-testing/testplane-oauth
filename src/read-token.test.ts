import fs from "fs";

import readToken from "./read-token";

jest.mock("fs");
const fsMock = fs as jest.Mocked<typeof fs>;

describe("read-token", () => {
    beforeEach(() => {
        fsMock.readFileSync.mockReturnValue("<token>");
    });

    test("should read token from file", () => {
        readToken("/foo/bar", "<help>");

        expect(fsMock.readFileSync).toHaveBeenCalledTimes(1);
        expect(fsMock.readFileSync).toHaveBeenCalledWith("/foo/bar", { encoding: "utf-8" });
    });

    test("should throw if reading of token from file fails", () => {
        fsMock.readFileSync.mockImplementation(() => {
            throw new Error();
        });

        expect(() => readToken("/foo/bar", "https://<help>")).toThrow(
            /unable to read token from file \/foo\/bar, see https:\/\/<help> to get it/,
        );
    });

    test("should throw in case of empty token from file", () => {
        fsMock.readFileSync.mockReturnValue(" ");

        expect(() => readToken("/foo/bar", "https://<help>")).toThrow(
            /token is absence at file \/foo\/bar, see https:\/\/<help> to get it/,
        );
    });

    test("should return token from file", () => {
        fsMock.readFileSync.mockReturnValue(" 123456789 ");

        expect(readToken("<path>", "<help>")).toBe("123456789");
    });
});
