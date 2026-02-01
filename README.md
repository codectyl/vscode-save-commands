# Save Commands

VSCode Extension to save and copy terminal commands.

# Demo

![demo](./media/demo.gif)

# Placeholders

You can add placeholders in your commands. For eg, you can add commands in this manner
`This is {placeholder1} and {placeholder2} with {placeholder1} again`
It will ask input for `placeholder1` and `placeholder2`

You can set `save-commands.placeholderType` to change the capturing group in settings.


# Features

### Run Folder
You can execute all commands within a folder as a single concatenated command. 
- **Configuration**: When editing a folder, you can set the "Join With" string (e.g., ` && `, ` ; `, ` | `) which determines how the individual commands are combined.
- **Execution**: Click the play icon on a folder.

### Drag and Drop
Organize your command library with ease:
- **Reorder**: Drag commands or folders to change their sort order.
- **Move**: Drag items into folders to nest them.
- *Note*: Currently, moving items between "Global" and "Workspace" scopes is disabled to prevent accidental state corruption.

# Import/Export

You can import and export your commands. 
**Export**: Click on the 3 dots, Select Export, Save it as `.json` file
**Import**: Click on the 3 dots, Select Import, Select the `.json` file

Note: If you only want to replace only one of workspace commands or global commands, you can edit the json to remove the `global` or `workspace` property and then use it 

# Development

If you are contributing to this project, you can run the unit test suite using:
```bash
npm run unit-test
```
The tests use a custom VS Code mock to run in a standalone environment.

---

**Enjoy!**
