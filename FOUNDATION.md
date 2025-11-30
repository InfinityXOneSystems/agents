# Foundation Repository Integration

This document describes how the agents repository integrates with and depends on the InfinityXOneSystems foundation repository.

## Overview

The [foundation repository](https://github.com/InfinityXOneSystems/foundation) serves as the core framework for all InfinityXOneSystems projects. This agents repository is designed to work in conjunction with the foundation, providing agent templates that leverage foundation components and follow foundation conventions.

## Integration Requirements

All agent templates in this repository must:

1. **Reference Foundation Components**: Specify required foundation components in the template metadata
2. **Follow Foundation Conventions**: Adhere to coding standards, naming conventions, and patterns defined in foundation
3. **Maintain Compatibility**: Specify compatible foundation versions in template metadata
4. **Use Foundation Utilities**: Leverage foundation-provided utilities and helper functions

## Template Integration Schema

Every agent template should include a `foundation` section:

```yaml
foundation:
  compatible_version: ">=1.0.0"  # Semantic version constraint
  required_components:           # Foundation components this agent depends on
    - "core"
    - "component-name"
```

## Foundation Components

The following foundation components are commonly referenced:

| Component | Description |
|-----------|-------------|
| `core` | Core framework functionality |
| `code-standards` | Coding conventions and linting rules |
| `testing-framework` | Test utilities and assertions |
| `security-framework` | Security utilities and validation |
| `deployment-framework` | CI/CD and deployment utilities |
| `monitoring-framework` | Logging, metrics, and alerting |
| `documentation-tools` | Documentation generation utilities |

## Industry-Specific Components

| Component | Description |
|-----------|-------------|
| `industry-technology` | Technology sector patterns |
| `industry-healthcare` | Healthcare/HIPAA compliance tools |
| `industry-finance` | Financial/PCI-DSS compliance tools |
| `industry-education` | Education/FERPA compliance tools |
| `industry-manufacturing` | Manufacturing and IoT integrations |
| `industry-retail` | E-commerce and retail patterns |

## Compliance Components

| Component | Description |
|-----------|-------------|
| `compliance-hipaa` | HIPAA compliance utilities |
| `compliance-financial` | PCI-DSS, SOX compliance utilities |
| `compliance-gdpr` | GDPR compliance utilities |

## Version Compatibility

When specifying `compatible_version`, use semantic version constraints:

- `">=1.0.0"` - Compatible with version 1.0.0 and above
- `"^1.2.0"` - Compatible with 1.2.x versions
- `"~1.2.3"` - Compatible with 1.2.3 and patch versions

## Repository Ecosystem

All repositories in the InfinityXOneSystems ecosystem are designed to work together:

```
foundation/           # Core framework - all repos depend on this
├── agents/          # This repository - agent templates
├── tools/           # Shared tooling
├── integrations/    # Third-party integrations
└── examples/        # Example implementations
```

## Contributing

When adding new agent templates:

1. Ensure foundation components are correctly specified
2. Test compatibility with the specified foundation version
3. Follow foundation coding standards
4. Document any new foundation dependencies

## Resources

- [Foundation Repository](https://github.com/InfinityXOneSystems/foundation)
- [Foundation Documentation](https://github.com/InfinityXOneSystems/foundation/docs)
- [Contribution Guidelines](https://github.com/InfinityXOneSystems/foundation/CONTRIBUTING.md)
