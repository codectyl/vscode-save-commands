import * as vscode from "vscode";
import TreeDataProvider from "./TreeProvider";
import { ExecCommands } from "./models/exec_commands";
import "reflect-metadata";
import {
	addCommandFn,
	copyCommandFn,
	deleteCommandFn,
	deleteCommandsFn,
	addFolderFn,
	editCommandFn,
	resetFn,
	runCommandFn,
	runCommandInActiveTerminalFn,
	deleteFolderFn,
	editFolderFn,
	exportFn,
	importFn,
} from "./functions";
import DragAndDropController from "./DragAndDropController";

export function activate(context: vscode.ExtensionContext) {
	const treeView = new TreeDataProvider(context);
	const treeDnDController = new DragAndDropController(context);

	// biome-ignore lint/suspicious/noExplicitAny: Needed
	const callbacks: Record<ExecCommands, (...args: any[]) => any> = {
		[ExecCommands.addCommand]: addCommandFn(context),
		[ExecCommands.deleteCommand]: deleteCommandFn(context),
		[ExecCommands.runCommand]: runCommandFn(context),
		[ExecCommands.deleteCommands]: deleteCommandsFn(context),
		[ExecCommands.editCommand]: editCommandFn(context),
		[ExecCommands.copyCommand]: copyCommandFn(context),
		[ExecCommands.runCommandInActiveTerminal]:
			runCommandInActiveTerminalFn(context),
		[ExecCommands.reset]: resetFn(context),
		[ExecCommands.refreshView]: () => treeView.refresh(),
		[ExecCommands.addFolder]: addFolderFn(context),
		[ExecCommands.deleteFolder]: deleteFolderFn(context),
		[ExecCommands.editFolder]: editFolderFn(context),
		[ExecCommands.export]: exportFn(context),
		[ExecCommands.import]: importFn(context),
	};

	const subscriptions = Object.keys(callbacks).map((key) => {
		return vscode.commands.registerCommand(key, callbacks[key as ExecCommands]);
	});

	vscode.window.createTreeView("save-commands-view", {
		treeDataProvider: treeView,
		dragAndDropController: treeDnDController,
	});
	context.subscriptions.push(...subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() { }
