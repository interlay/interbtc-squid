import {getNativeCurrency} from "./nativeCurrency";
import { Token } from "../../model";

describe("getNativeCurrency", () => {
    const env = process.env;

    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        process.env = env;
    });

    it("should return kintsugi if SS58_CODEC env var is kintsugi", () => {
        process.env.SS58_CODEC = "kintsugi";
        const actualNativeCurrency = getNativeCurrency();
        expect(actualNativeCurrency).toBe(Token.KINT);
    });

    it("should return interlay if SS58_CODEC env var is not kintsugi", () => {
        process.env.SS58_CODEC = "foo";
        const actualNativeCurrency = getNativeCurrency();
        expect(actualNativeCurrency).toBe(Token.INTR);
    });

    it("should treat SS58_CODEC env var as case sensitive", () => {
        process.env.SS58_CODEC = "Kintsugi";
        const actualNativeCurrency = getNativeCurrency();
        expect(actualNativeCurrency).not.toBe(Token.KINT);
    });
});
