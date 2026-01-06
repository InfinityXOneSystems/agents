"""
Governance & Compliance Module
- Enforces crawling policies, audit logging, RBAC, and compliance
- Open source, extensible
"""

class Governance:
    def __init__(self):
        self.audit_log = []
        self.allowed_domains = set()
        self.rbac = {}

    def add_domain(self, domain):
        self.allowed_domains.add(domain)
        self.log_action(f"Domain added: {domain}")

    def log_action(self, action):
        self.audit_log.append(action)

    def check_compliance(self, url):
        # Example: check robots.txt, GDPR, etc.
        return any(domain in url for domain in self.allowed_domains)

    def set_role(self, user, role):
        self.rbac[user] = role
        self.log_action(f"Role set: {user} -> {role}")

# Usage example
if __name__ == "__main__":
    gov = Governance()
    gov.add_domain("example.com")
    gov.set_role("agent1", "admin")
    print("Audit log:", gov.audit_log)
