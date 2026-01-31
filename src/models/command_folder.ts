import { instanceToPlain, plainToInstance } from "class-transformer";
import { uuidv4 } from "../utils";
import type { JSONObj, PickProperties } from "./base_types";
import { ExtensionContextListEtter, type IEtter, StateType } from "./etters";
import type TreeItem from "../TreeItem";
import ReadableError from "./error";

const COMMAND_FOLDERS_STORAGE_KEY = "command_folders";

export class CommandFolder {
	id!: string;
	name!: string;
	parentFolderId?: string | null;
	sortOrder?: number;
	joinWith?: string;

	static create(fields: {
		name: string;
		parentFolderId?: string | null;
		sortOrder?: number;
		joinWith?: string;
	}) {
		return CommandFolder.fromJsonSafe({
			id: uuidv4(),
			name: fields.name,
			parentFolderId: fields.parentFolderId,
			sortOrder: fields.sortOrder,
			joinWith: fields.joinWith ?? " && ",
		});
	}

	static fromJson(json: JSONObj): CommandFolder {
		return plainToInstance(CommandFolder, json);
	}

	static fromJsonSafe(json: PickProperties<CommandFolder>): CommandFolder {
		return CommandFolder.fromJson(json);
	}

	toJson(): JSONObj {
		return instanceToPlain(this);
	}

	static etters: ExtensionContextListEtter<CommandFolder> =
		new ExtensionContextListEtter(COMMAND_FOLDERS_STORAGE_KEY, this.fromJson);

	static getEtterFromTreeContext(treeItem: TreeItem): {
		etter: IEtter<Array<CommandFolder>>;
		stateType: StateType;
	} {
		const stateType = treeItem.stateType;
		if (stateType === StateType.workspace) {
			return {
				stateType: StateType.workspace,
				etter: CommandFolder.etters.workspace,
			};
		}
		if (stateType === StateType.global) {
			return {
				stateType: StateType.global,
				etter: CommandFolder.etters.global,
			};
		}
		throw new ReadableError(
			`Unknown stateType: ${stateType} to get CommandFolder etter`,
		);
	}
}
