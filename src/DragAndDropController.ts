import * as vscode from "vscode";
import TreeItem from "./TreeItem";
import { ContextValue } from "./TreeProvider";
import Command from "./models/command";
import { CommandFolder } from "./models/command_folder";
import { ExecCommands } from "./models/exec_commands";
import { StateType } from "./models/etters";

export default class DragAndDropController implements vscode.TreeDragAndDropController<TreeItem> {
	dragMimeTypes = ["application/vnd.code.tree.save-commands-view"];
	dropMimeTypes = ["application/vnd.code.tree.save-commands-view"];

	constructor(private context: vscode.ExtensionContext) { }

	public async handleDrag(
		source: readonly TreeItem[],
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken,
	): Promise<void> {
		if (source.length > 0) {
			dataTransfer.set(
				"application/vnd.code.tree.save-commands-view",
				new vscode.DataTransferItem(source[0]),
			);
		}
	}

	public async handleDrop(
		target: TreeItem | undefined,
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken,
	): Promise<void> {
		const transferItem = dataTransfer.get("application/vnd.code.tree.save-commands-view");
		if (!transferItem) {
			return;
		}

		const sourceItem: TreeItem = transferItem.value;
		if (!sourceItem || !sourceItem.id) {
			return;
		}

		// Prevent moving between Global and Workspace for now to keep it simple and safe
		const targetStateType = target?.stateType ?? sourceItem.stateType;
		if (sourceItem.stateType !== targetStateType) {
			vscode.window.showWarningMessage("Moving items between Global and Workspace is not supported.");
			return;
		}

		// Determine new parentFolderId
		let newParentFolderId: string | null = null;
		if (target) {
			if (target.contextValue === ContextValue.folder) {
				newParentFolderId = target.id ?? null;
			} else if (target.contextValue === ContextValue.command) {
				newParentFolderId = target.parentFolderId ?? null;
			}
		}

		// Prevent moving a folder into itself
		if (sourceItem.contextValue === ContextValue.folder && sourceItem.id === newParentFolderId) {
			return;
		}

		try {
			if (sourceItem.contextValue === ContextValue.command) {
				await this.moveCommand(sourceItem, newParentFolderId, target);
			} else if (sourceItem.contextValue === ContextValue.folder) {
				await this.moveFolder(sourceItem, newParentFolderId, target);
			}

			vscode.commands.executeCommand(ExecCommands.refreshView);
		} catch (error) {
			vscode.window.showErrorMessage(`Error moving item: ${error}`);
		}
	}

	private async moveCommand(
		sourceItem: TreeItem,
		newParentFolderId: string | null,
		target: TreeItem | undefined,
	) {
		const { etter } = Command.getEtterFromTreeContext(sourceItem);
		const commands = etter.getValue(this.context);
		const sourceIndex = commands.findIndex((c) => c.id === sourceItem.id);

		if (sourceIndex === -1) return;

		const [command] = commands.splice(sourceIndex, 1);
		command.parentFolderId = newParentFolderId;

		// If dropped on another command or folder, we can try to reorder
		if (target && target.id && target.contextValue !== ContextValue.root) {
			const targetIndex = commands.findIndex((c) => c.id === target.id);
			if (targetIndex !== -1) {
				commands.splice(targetIndex, 0, command);
			} else {
				commands.push(command);
			}
		} else {
			commands.push(command);
		}

		await etter.setValue(this.context, commands);
	}

	private async moveFolder(
		sourceItem: TreeItem,
		newParentFolderId: string | null,
		target: TreeItem | undefined,
	) {
		const { etter } = CommandFolder.getEtterFromTreeContext(sourceItem);
		const folders = etter.getValue(this.context);
		const sourceIndex = folders.findIndex((f) => f.id === sourceItem.id);

		if (sourceIndex === -1) return;

		const [folder] = folders.splice(sourceIndex, 1);

		// Prevent nesting if it would cause a cycle (simple check: don't move into a descendant)
		// For now, let's just allow top level or direct parent update
		folder.parentFolderId = newParentFolderId;

		if (target && target.id && target.contextValue !== ContextValue.root) {
			const targetIndex = folders.findIndex((f) => f.id === target.id);
			if (targetIndex !== -1) {
				folders.splice(targetIndex, 0, folder);
			} else {
				folders.push(folder);
			}
		} else {
			folders.push(folder);
		}

		await etter.setValue(this.context, folders);
	}
}
