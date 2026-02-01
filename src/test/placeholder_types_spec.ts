import {
	ALL_PLACEHOLDERS,
	type PlaceholderType,
} from "../models/placeholder_types";
import * as assert from "node:assert";

describe("PlaceholderType Tests", () => {
	const generatePlaceholderCommand = (
		placeholderType: PlaceholderType,
	): string => {
		return `Your test command with ${placeholderType.wrapLabel(
			"label1",
		)} and ${placeholderType.wrapLabel("label2")}`;
	};

	const generateInput = (placeholderType: PlaceholderType) =>
		({
			[placeholderType.wrapLabel("label1")]: "replacement1",
			[placeholderType.wrapLabel("label2")]: "replacement2",
		}) as Record<string, string>;

	for (const placeholderType of ALL_PLACEHOLDERS) {
		it(`Should replace placeholders correctly for placeholder ${placeholderType.id}`, () => {
			const input = generateInput(placeholderType);
			const label1 = input[placeholderType.wrapLabel("label1")];
			const label2 = input[placeholderType.wrapLabel("label2")];

			const updatedCommand = `Your test command with ${label1} and ${label2}`;
			const regex = placeholderType.regex;

			const command = generatePlaceholderCommand(placeholderType);

			const matches = placeholderType.extractPlaceholders(command);

			assert.ok(matches, "Matches should not be null");
			assert.ok(matches[placeholderType.wrapLabel("label1").replace(/^\W+|\W+$/g, '')], "label1 match missing");
			assert.ok(matches[placeholderType.wrapLabel("label2").replace(/^\W+|\W+$/g, '')], "label2 match missing");

			const replacedCommand = command.replace(regex, (match) => {
				if (match in input) {
					return input[match];
				}
				return match;
			});

			assert.equal(replacedCommand, updatedCommand, "Outputs do not match");
		});
	}
});
