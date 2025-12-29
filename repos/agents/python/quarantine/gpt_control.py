from control.manifest_loader import Manifest
from control.jobs import submit_job
from control.audit import audit_event

class GPTControlModule:
    def __init__(self):
        self.manifest = Manifest()

    def execute(self, command: str, payload: dict):
        if not self.manifest.enabled('autonomy.gpt_control'):
            raise RuntimeError('GPT autonomy disabled')

        audit_event('gpt.command', {
            'command': command,
            'payload': payload
        })

        return submit_job(command, payload)
