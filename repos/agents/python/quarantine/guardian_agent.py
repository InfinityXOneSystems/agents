class GuardianAgent:
    '''
    Guardian Agent
    Absolute validation authority for Infinity XOS.
    No execution may proceed without approval.
    '''

    def __init__(self, manifesto, sop, taxonomy, manifest):
        self.manifesto = manifesto
        self.sop = sop
        self.taxonomy = taxonomy
        self.manifest = manifest

    def validate(self, action: dict) -> None:
        self._validate_manifest(action)
        self._validate_manifesto(action)
        self._validate_sop(action)
        self._validate_taxonomy(action)

    def _validate_manifest(self, action):
        if not self.manifest.get("autonomy", {}).get("enabled", False):
            raise PermissionError("Autonomy disabled by manifest")

    def _validate_manifesto(self, action):
        forbidden = self.manifesto.get("forbidden_actions", [])
        if action.get("type") in forbidden:
            raise PermissionError("Action violates company manifesto")

    def _validate_sop(self, action):
        required = self.sop.get("required_checks", [])
        for check in required:
            if not action.get("checks", {}).get(check):
                raise PermissionError(f"SOP check failed: {check}")

    def _validate_taxonomy(self, action):
        domain = action.get("domain")
        if domain not in self.taxonomy.get("approved_domains", []):
            raise PermissionError("Domain not approved by taxonomy")
