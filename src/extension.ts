import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const snippetsPath = path.join(context.extensionPath, "snippets");

  const snippetFiles = ["react-tsx.json", "react-jsx.json"];

  snippetFiles.forEach((file) => {
    const filePath = path.join(snippetsPath, file);
    // Snippets should be contributed via package.json or the snippets API, not setLanguageConfiguration.
    // If you want to process or validate snippets here, do so, but do not pass them to setLanguageConfiguration.
    // vscode.languages.setLanguageConfiguration can be used for brackets, comments, etc.
    // Example (no snippets):
    vscode.languages.setLanguageConfiguration(file.split(".")[0], {});
  });
}

export function deactivate() {}
