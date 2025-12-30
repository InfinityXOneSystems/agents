import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Infinity-Matrix extension is now active!');

  // Register commands
  let showDashboard = vscode.commands.registerCommand('infinity-matrix.showDashboard', () => {
    vscode.window.showInformationMessage('Infinity-Matrix Dashboard');
  });

  let startAgent = vscode.commands.registerCommand('infinity-matrix.startAgent', () => {
    vscode.window.showInformationMessage('Starting agent...');
  });

  let stopAgent = vscode.commands.registerCommand('infinity-matrix.stopAgent', () => {
    vscode.window.showInformationMessage('Stopping agent...');
  });

  // Register tree data provider for agents view
  const agentProvider = new AgentProvider();
  vscode.window.registerTreeDataProvider('infinity-matrix.agents', agentProvider);

  context.subscriptions.push(showDashboard, startAgent, stopAgent);
}

export function deactivate() {}

class AgentProvider implements vscode.TreeDataProvider<AgentItem> {
  getTreeItem(element: AgentItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AgentItem): Thenable<AgentItem[]> {
    if (!element) {
      // Root level: list agent types
      return Promise.resolve([
        new AgentItem('Cloud Agents', 'cloud', vscode.TreeItemCollapsibleState.Collapsed),
        new AgentItem('Code Agents', 'code', vscode.TreeItemCollapsibleState.Collapsed),
        new AgentItem('Data Agents', 'data', vscode.TreeItemCollapsibleState.Collapsed),
        new AgentItem('Monitoring Agents', 'monitoring', vscode.TreeItemCollapsibleState.Collapsed)
      ]);
    } else {
      // Sub-level: list specific agents
      switch (element.label) {
        case 'Cloud Agents':
          return Promise.resolve([
            new AgentItem('GCP Deployer', 'gcp-deployer', vscode.TreeItemCollapsibleState.None),
            new AgentItem('AWS Deployer', 'aws-deployer', vscode.TreeItemCollapsibleState.None),
            new AgentItem('Azure Deployer', 'azure-deployer', vscode.TreeItemCollapsibleState.None)
          ]);
        case 'Code Agents':
          return Promise.resolve([
            new AgentItem('Code Linter', 'code-linter', vscode.TreeItemCollapsibleState.None),
            new AgentItem('Security Scanner', 'security-scanner', vscode.TreeItemCollapsibleState.None),
            new AgentItem('Refactor Agent', 'refactor-agent', vscode.TreeItemCollapsibleState.None)
          ]);
        case 'Data Agents':
          return Promise.resolve([
            new AgentItem('Data Scraper', 'data-scraper', vscode.TreeItemCollapsibleState.None),
            new AgentItem('API Orchestrator', 'api-orchestrator', vscode.TreeItemCollapsibleState.None)
          ]);
        case 'Monitoring Agents':
          return Promise.resolve([
            new AgentItem('Health Dashboard', 'health-dashboard', vscode.TreeItemCollapsibleState.None),
            new AgentItem('Log Monitor', 'log-monitor', vscode.TreeItemCollapsibleState.None)
          ]);
        default:
          return Promise.resolve([]);
      }
    }
  }
}

class AgentItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label} - ${this.id}`;
    this.description = this.id;
    this.contextValue = 'agent';
  }
}