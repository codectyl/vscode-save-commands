import "reflect-metadata";
import * as assert from "node:assert";
import { CommandFolder } from "../models/command_folder";

describe("CommandFolder Model Tests", () => {
    describe("Creation", () => {
        it("should create a folder with correct properties", () => {
            const fields = {
                name: "Source Code",
                parentFolderId: "root_id",
                joinWith: " && ",
                sortOrder: 5
            };
            const folder = CommandFolder.create(fields);

            assert.ok(folder.id);
            assert.strictEqual(folder.name, fields.name);
            assert.strictEqual(folder.parentFolderId, fields.parentFolderId);
            assert.strictEqual(folder.joinWith, fields.joinWith);
            assert.strictEqual(folder.sortOrder, fields.sortOrder);
        });

        it("should use default joinWith if not provided", () => {
            const folder = CommandFolder.create({ name: "Default" });
            assert.strictEqual(folder.joinWith, " && ");
        });
    });

    describe("Serialization", () => {
        it("should serialize and deserialize preserving ID and name", () => {
            const original = CommandFolder.create({ name: "Work", parentFolderId: "home" });
            const json = original.toJson();
            const restored = CommandFolder.fromJson(json);

            assert.deepStrictEqual(restored, original);
            assert.ok(restored instanceof CommandFolder);
        });
    });
});
