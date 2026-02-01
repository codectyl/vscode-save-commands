import * as assert from "node:assert";
import { uuidv4, generateString } from "../utils";

describe("Utility Tests", () => {
    describe("uuidv4", () => {
        it("should generate a string of correct length", () => {
            const uuid = uuidv4();
            assert.strictEqual(uuid.length, 36);
        });

        it("should generate unique strings", () => {
            const uuid1 = uuidv4();
            const uuid2 = uuidv4();
            assert.notStrictEqual(uuid1, uuid2);
        });

        it("should follow the uuid v4 pattern", () => {
            const uuid = uuidv4();
            const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            assert.ok(regex.test(uuid), `UUID ${uuid} does not match v4 pattern`);
        });
    });

    describe("generateString", () => {
        it("should generate a string of requested length", () => {
            assert.strictEqual(generateString(5).length, 5);
            assert.strictEqual(generateString(10).length, 10);
            assert.strictEqual(generateString(0).length, 0);
        });

        it("should generate random strings", () => {
            const s1 = generateString(10);
            const s2 = generateString(10);
            assert.notStrictEqual(s1, s2);
        });

        it("should only contain allowed characters", () => {
            const s = generateString(100);
            const allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (const char of s) {
                assert.ok(allowed.includes(char), `Character ${char} is not allowed`);
            }
        });
    });
});
