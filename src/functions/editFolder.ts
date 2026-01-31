import * as vscode from "vscode";
import { commandFolderInput } from "../utils";
import type TreeItem from "../TreeItem";
import { ExecCommands } from "../models/exec_commands";
import ReadableError from "../models/error";
import { CommandFolder } from "../models/command_folder";

export default function (context: vscode.ExtensionContext) {
	return async (item: TreeItem) => {
		ReadableError.runGuarded(async () => {
			const { etter } = CommandFolder.getEtterFromTreeContext(item);

			const folders = etter.getValue(context);
			vscode.window.showInformationMessage("Edit Folder");
			const i = folders.findIndex((d: CommandFolder) => d.id === item.id);
			if (i > -1) {
				const val = await commandFolderInput({
					name: folders[i].name,
					joinWith: folders[i].joinWith,
				});
				folders[i].name = val.name;
				folders[i].joinWith = val.joinWith;
				etter.setValue(context, folders);
				vscode.commands.executeCommand(ExecCommands.refreshView);
			} else {
				throw new ReadableError("Unable to find the folder in state");
			}
		}, "Unable to edit the folder");
	};
}
