import "reflect-metadata";
import * as assert from "node:assert";
import Command from "../models/command";
import { SingleCurlyBracesPlaceholderType } from "../models/placeholder_types";

describe("Command Model Tests", () => {
    const placeholderType = new SingleCurlyBracesPlaceholderType();

    describe("Creation", () => {
        it("should create a command with unique id", () => {
            const cmd1 = Command.create({
                name: "Test 1",
                command: "echo 1",
                parentFolderId: null,
                placeholderType: placeholderType
            });
            const cmd2 = Command.create({
                name: "Test 2",
                command: "echo 2",
                parentFolderId: null,
                placeholderType: placeholderType
            });
            assert.ok(cmd1.id);
            assert.ok(cmd2.id);
            assert.notStrictEqual(cmd1.id, cmd2.id);
        });

        it("should set properties correctly", () => {
            const fields = {
                name: "Test Command",
                command: "echo hello",
                parentFolderId: "folder123",
                placeholderType: placeholderType
            };
            const cmd = Command.create(fields);
            assert.strictEqual(cmd.name, fields.name);
            assert.strictEqual(cmd.command, fields.command);
            assert.strictEqual(cmd.parentFolderId, fields.parentFolderId);
            assert.strictEqual(cmd.placeholderTypeId, placeholderType.id);
        });
    });

    describe("Serialization", () => {
        it("should serialize to JSON and back correctly", () => {
            const original = Command.create({
                name: "Serialize Me",
                command: "ls -la",
                parentFolderId: "root",
                placeholderType: placeholderType
            });

            const json = original.toJson();
            const restored = Command.fromJson(json);

            assert.deepStrictEqual(restored, original);
            assert.ok(restored instanceof Command);
        });
    });

    describe("Placeholder Resolution", () => {
        // Mocking vscode.window.showInputBox is needed for resolveCommand
        const vscode = require("vscode");

        it("should resolve placeholders using input", async () => {
            const cmd = Command.create({
                name: "Placeholder Test",
                command: "echo {name}",
                parentFolderId: null,
                placeholderType: placeholderType
            });

            // Mock user input
            const originalShowInputBox = vscode.window.showInputBox;
            vscode.window.showInputBox = async () => "World";

            try {
                // ExtensionContext is null because we mock it in resolveCommand anyway or it's not used for simple cases
                const resolved = await cmd.resolveCommand(null as any, "RUN (Active)" as any);
                assert.strictEqual(resolved, "echo World");
            } finally {
                vscode.window.showInputBox = originalShowInputBox;
            }
        });
    });
});
