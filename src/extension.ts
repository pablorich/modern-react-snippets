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

  // Helper function to analyze selected code
  function analyzeSelection(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ): { name?: string; expression: string } {
    const text = document.getText(selection).trim();
    const cleanText = text.replace(/;$/, "");

    // Check for variable declaration
    const varDeclMatch = cleanText.match(
      /^(?:const|let|var)\s+(\w+)\s*=\s*(.+)$/s
    );
    if (varDeclMatch) {
      return {
        name: varDeclMatch[1],
        expression: varDeclMatch[2].trim(),
      };
    }
    // Check for function declaration patterns
    const funcDeclMatch = cleanText.match(/^(?:function\s+(\w+))(.+)$/s);
    if (funcDeclMatch) {
      const name = funcDeclMatch[1];
      return {
        name,
        expression: `function ${funcDeclMatch[2].trim()}`,
      };
    }

    // If no declaration found, treat as plain expression
    return {
      expression: cleanText,
    };
  }

  // Command: Wrap with useCallback
  const wrapWithUseCallback = vscode.commands.registerCommand(
    "modern-react-snippets.wrapWithUseCallback",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const analysis = analyzeSelection(editor.document, selection);

      let name = analysis.name;
      if (!name) {
        return;
      }

      const wrapped = `const ${name} = useCallback(${analysis.expression}, [])`;

      editor.edit((editBuilder) => {
        editBuilder.replace(selection, wrapped);
      });
    }
  );

  // Command: Wrap with useMemo
  const wrapWithUseMemo = vscode.commands.registerCommand(
    "modern-react-snippets.wrapWithUseMemo",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const analysis = analyzeSelection(editor.document, selection);

      let name = analysis.name;
      if (!name) {
        return;
      }

      const wrapped = `const ${name} = useMemo(() => ${analysis.expression}, [])`;

      editor.edit((editBuilder) => {
        editBuilder.replace(selection, wrapped);
      });
    }
  );

  // Command: Wrap with useEffect
  const wrapWithUseEffect = vscode.commands.registerCommand(
    "modern-react-snippets.wrapWithUseEffect",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const text = editor.document.getText(selection).trim();
      const wrapped = `useEffect(() => {
  ${text}
}, [])`;
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, wrapped);
      });
    }
  );

  // Register the refactoring provider
  const refactorProvider = vscode.languages.registerCodeActionsProvider(
    [
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "javascriptreact" },
    ],
    {
      provideCodeActions(document, range) {
        const actions = [];

        actions.push({
          title: "Wrap with useCallback",
          kind: vscode.CodeActionKind.Refactor,
          command: {
            title: "Wrap with useCallback",
            command: "modern-react-snippets.wrapWithUseCallback",
          },
        });

        actions.push({
          title: "Wrap with useMemo",
          kind: vscode.CodeActionKind.Refactor,
          command: {
            title: "Wrap with useMemo",
            command: "modern-react-snippets.wrapWithUseMemo",
          },
        });

        actions.push({
          title: "Wrap with useEffect",
          kind: vscode.CodeActionKind.Refactor,
          command: {
            title: "Wrap with useEffect",
            command: "modern-react-snippets.wrapWithUseEffect",
          },
        });

        return actions;
      },
    }
  );

  context.subscriptions.push(
    wrapWithUseCallback,
    wrapWithUseMemo,
    wrapWithUseEffect,
    refactorProvider
  );
}

export function deactivate() {}
