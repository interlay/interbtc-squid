import { Token } from "../../model";

export function getNativeCurrency(): Token.KINT | Token.INTR {
    if (process.env.SS58_CODEC === "kintsugi") {
        return Token.KINT;
    }
    return Token.INTR;
}