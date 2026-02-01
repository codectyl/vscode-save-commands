import * as vscode from "vscode";
import TreeItem from "./TreeItem";
import Command from "./models/command";
import { CommandFolder } from "./models/command_folder";
import { StateType } from "./models/etters";

export enum ContextValue {
	command = "command",
	folder = "folder",
	none = "none",
	root = "root",
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	data: TreeItem[];
	private _onDidChangeTreeData: vscode.EventEmitter<
		TreeItem | undefined | undefined
	> = new vscode.EventEmitter<TreeItem | undefined | undefined>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | undefined> =
		this._onDidChangeTreeData.event;
	context: vscode.ExtensionContext;
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.data = [];
		this.refreshData();
	}

	private createTreeMap(
		commands: Array<Command>,
		folders: Array<CommandFolder>,
		stateType: StateType,
	): Array<TreeItem> {
		const items: Array<TreeItem> = [];
		const foldersMap: Record<string, TreeItem> = {};

		// Create folders
		for (const folder of folders) {
			const treeItem = new TreeItem({
				id: folder.id,
				label: folder.name,
				children: [],
				parentFolderId: folder.parentFolderId,
				tooltip: folder.name,
				contextValue: ContextValue.folder,
				stateType: stateType,
			});
			items.push(treeItem);
			foldersMap[folder.id] = treeItem;
		}

		// Add commands to folder
		for (const command of commands) {
			const parentFolderId = command.parentFolderId;
			if (!parentFolderId || !foldersMap[parentFolderId]) {
				items.push(
					new TreeItem({
						id: command.id,
						label: command.name,
						tooltip: command.command,
						sortOrder: command.sortOrder,
						contextValue: ContextValue.command,
						parentFolderId: command.parentFolderId,
						children: [],
						stateType: stateType,
					}),
				);
				continue;
			}
			foldersMap[parentFolderId]?.children?.push(
				new TreeItem({
					id: command.id,
					label: command.name,
					tooltip: command.command,
					sortOrder: command.sortOrder,
					contextValue: ContextValue.command,
					parentFolderId: command.parentFolderId,
					children: [],
					stateType: stateType,
				}),
			);
		}

		// Add folder inside folders
		const filteredItems = items.filter((item) => {
			if (item.contextValue !== ContextValue.folder) return true;
			const parent = item.parentFolderId;
			if (!parent) return true;
			foldersMap[parent]?.children?.unshift(item);
			return false;
		});

		// Sort based on sort order
		const sortFn = (a: TreeItem, b: TreeItem) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
		filteredItems.sort(sortFn);

		for (const item of items) {
			if (item.children) {
				item.children.sort(sortFn);
			}
		}

		return filteredItems;
	}

	refreshData(): void {
		const globalCommands: Array<Command> = Command.etters.global.getValue(
			this.context,
		);
		const globalFolders: Array<CommandFolder> =
			CommandFolder.etters.global.getValue(this.context);

		const workspaceCommands: Array<Command> = Command.etters.workspace.getValue(
			this.context,
		);
		const workspaceFolders: Array<CommandFolder> =
			CommandFolder.etters.workspace.getValue(this.context);

		const globalTree = this.createTreeMap(
			globalCommands,
			globalFolders,
			StateType.global,
		);
		const workspaceTree = this.createTreeMap(
			workspaceCommands,
			workspaceFolders,
			StateType.workspace,
		);

		const globalTreeItems: Array<TreeItem> =
			globalTree.length !== 0
				? globalTree
				: [
					new TreeItem({
						id: null,
						label: "No Commands Found",
						contextValue: ContextValue.none,
						stateType: StateType.global,
					}),
				];

		const workspaceTreeItems: Array<TreeItem> =
			workspaceTree.length !== 0
				? workspaceTree
				: [
					new TreeItem({
						id: null,
						label: "No Commands Found",
						contextValue: ContextValue.none,
						stateType: StateType.workspace,
					}),
				];

		this.data = [
			new TreeItem({
				id: null,
				label: "Global Commands",
				tooltip: "",
				contextValue: ContextValue.root,
				children: globalTreeItems,
				stateType: StateType.global,
			}),
			new TreeItem({
				id: null,
				label: "Workspace Commands",
				tooltip: "",
				stateType: StateType.workspace,
				contextValue: ContextValue.root,
				children: workspaceTreeItems,
			}),
		];
	}

	refresh(): void {
		this.refreshData();
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(
		element?: TreeItem | undefined,
	): vscode.ProviderResult<TreeItem[]> {
		if (element === undefined) {
			return this.data;
		}
		return element.children;
	}
}

export default TreeDataProvider;
