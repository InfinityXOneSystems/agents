class VSCodeCopilotAgent:
    def generate_code(self, task):
        print('[COPILOT LOCAL] Generating code:', task)

class GitHubCopilotRemoteAgent:
    def generate_code(self, task):
        print('[COPILOT REMOTE] Generating code:', task)
