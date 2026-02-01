import * as vscode from "vscode";
import type TreeItem from "../TreeItem";
import Command, { ResolveCommandType } from "../models/command";
import { CommandFolder } from "../models/command_folder";
import ReadableError from "../models/error";
import { generateString } from "../utils";

export default function (context: vscode.ExtensionContext) {
    return async (item: TreeItem) => {
        ReadableError.runGuarded(async () => {
            const folderId = item.id;
            if (!folderId) {
                throw new ReadableError("Folder ID not found");
            }

            const { etter: folderEtter } = CommandFolder.getEtterFromTreeContext(item);
            const { etter: commandEtter } = Command.getEtterFromTreeContext(item);

            const allFolders = folderEtter.getValue(context);
            const allCommands = commandEtter.getValue(context);

            const folder = allFolders.find(f => f.id === folderId);
            if (!folder) {
                throw new ReadableError("Folder not found in state");
            }

            const joinWith = folder.joinWith || "&&";

            // Only get commands directly in this folder (no recursion)
            const commandsToRun = allCommands
                .filter(c => c.parentFolderId === folderId)
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

            if (commandsToRun.length === 0) {
                vscode.window.showInformationMessage(`No commands found in folder "${folder.name}"`);
                return;
            }

            const resolvedCommands: string[] = [];
            for (const cmd of commandsToRun) {
                const resolved = await cmd.resolveCommand(context, ResolveCommandType.runNew);
                resolvedCommands.push(resolved);
            }

            const finalCommand = resolvedCommands.join(` ${joinWith} `);

            const terminalId = `${folder.name}-${generateString(5)}`;
            const terminal = vscode.window.createTerminal(terminalId);
            terminal.show();
            terminal.sendText(finalCommand);

        }, "Unable to run folder commands");
    };
}
