const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
};

module.exports = {
  window: {
    showInputBox: async (options) => "",
    showInformationMessage: async (message) => "",
    showErrorMessage: async (message) => "",
    activeTerminal: undefined,
  },
  workspace: {
    getConfiguration: (section) => ({
      get: (key) => undefined,
      update: async (key, value) => {},
    }),
  },
  commands: {
    registerCommand: (command, callback) => ({
      dispose: () => {},
    }),
    executeCommand: async (command, ...rest) => {},
  },
  TreeItemCollapsibleState,
  TreeItem: class TreeItem {
    constructor(label, collapsibleState) {
      this.label = label;
      this.collapsibleState = collapsibleState;
    }
  },
  EventEmitter: class EventEmitter {},
  RelativePattern: class RelativePattern {
    constructor(base, pattern) {
      this.base = base;
      this.pattern = pattern;
    }
  },
  env: {
    clipboard: {
      writeText: async (text) => {},
    },
  },
  Disposable: {
    from: (...disposables) => ({ dispose: () => {} }),
  },
};
