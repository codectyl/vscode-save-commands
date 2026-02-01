import { instanceToPlain, plainToInstance } from "class-transformer";
import { singleInput as takeSingleInput, uuidv4 } from "../utils";
import type { ExtensionContext } from "vscode";
import {
	FALLBACK_PLACEHOLDER_TYPE,
	PlaceholderType,
} from "./placeholder_types";
import type { JSONObj, PickProperties } from "./base_types";
import { ExtensionContextListEtter, type IEtter, StateType } from "./etters";
import type TreeItem from "../TreeItem";
import ReadableError from "./error";

const COMMAND_STORAGE_KEY = "commands";

export enum ResolveCommandType {
	runActive = "RUN (Active)",
	runNew = "RUN (New)",
	copy = "COPY",
}

export default class Command {
	id!: string;
	name!: string;
	command!: string;
	placeholderTypeId!: string;
	sortOrder?: number;
	parentFolderId?: string | null;

	getPlaceholderType(): PlaceholderType {
		return (
			PlaceholderType.getPlaceholderTypeFromId(this.placeholderTypeId) ??
			FALLBACK_PLACEHOLDER_TYPE
		);
	}

	static create(fields: {
		name: string;
		command: string;
		parentFolderId: string | null;
		placeholderType: PlaceholderType;
	}) {
		const id = uuidv4();
		const { name, command, parentFolderId, placeholderType } = fields;
		return Command.fromJsonSafe({
			id,
			name,
			command,
			placeholderTypeId: placeholderType.id,
			// TODO: Handle sortOrder
			sortOrder: 0,
			parentFolderId: parentFolderId,
		});
	}

	toJson(): JSONObj {
		return instanceToPlain(this);
	}

	static fromJson(json: JSONObj): Command {
		return plainToInstance(Command, json);
	}

	static fromJsonSafe(json: PickProperties<Command>): Command {
		return Command.fromJson(json);
	}

	static etters: ExtensionContextListEtter<Command> =
		new ExtensionContextListEtter(COMMAND_STORAGE_KEY, this.fromJson);

	static getEtterFromTreeContext(treeItem: TreeItem): {
		etter: IEtter<Array<Command>>;
		stateType: StateType;
	} {
		const stateType = treeItem.stateType;
		if (stateType === StateType.workspace) {
			return {
				stateType: StateType.workspace,
				etter: Command.etters.workspace,
			};
		}
		if (stateType === StateType.global) {
			return { stateType: StateType.global, etter: Command.etters.global };
		}
		throw new ReadableError(
			`Unknown stateType: ${stateType} to get Command etter`,
		);
	}

	async resolveCommand(
		context: ExtensionContext,
		resolveCommandType: ResolveCommandType,
	): Promise<string> {
		const placeholderType = this.getPlaceholderType();
		const regex = placeholderType.regex;
		const matches = placeholderType.extractPlaceholders(this.command);
		if (!matches) {
			return this.command;
		}

		const inputs: Record<string, string> = {};

		for (const placeholder in matches) {
			const input = await takeSingleInput({
				promptText: `${resolveCommandType} | ${this.name} | ${placeholder} | `,
				placeholder: `Enter ${placeholder}`,
			});
			for (const match of matches[placeholder]) {
				inputs[match] = input;
			}
		}
		const resolvedCommand = this.command.replace(regex, (match) => {
			if (match in inputs) {
				return inputs[match];
			}
			return match;
		});

		return resolvedCommand;
	}
}
