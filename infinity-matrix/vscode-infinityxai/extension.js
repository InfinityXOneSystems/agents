const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Register the command to open the dashboard
    let disposable = vscode.commands.registerCommand('infinityxai.openDashboard', function () {
        vscode.env.openExternal(vscode.Uri.parse('https://infinityxai.com/admin'));
    });
    context.subscriptions.push(disposable);

    // Register the view provider for the activity bar icon
    const provider = new InfinityXAIViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('infinityxai.dashboard', provider)
    );
}

class InfinityXAIViewProvider {
    /**
     * @param {vscode.Uri} extensionUri
     */
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    /**
     * @param {vscode.WebviewView} webviewView
     * @param {vscode.WebviewViewResolveContext} context
     * @param {vscode.CancellationToken} token
     */
    resolveWebviewView(webviewView, context, token) {
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this.getHtmlForWebview();
    }

    getHtmlForWebview() {
        // Simple webview with a button to open the dashboard
        return `
            <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #10172a; color: #fff; }
                .logo { margin-bottom: 24px; }
                .btn { background: #1e40af; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1.1em; cursor: pointer; transition: background 0.2s; }
                .btn:hover { background: #2563eb; }
            </style>
            <body>
                <img class="logo" src="https://infinityxai.com/assets/electric-triangle.svg" width="64" height="64" alt="InfinityXAI Logo" />
                <button class="btn" onclick="openDashboard()">Open Admin Dashboard</button>
                <script>
                    function openDashboard() {
                        window.open('https://infinityxai.com/admin', '_blank');
                    }
                </script>
            </body>
        `;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
