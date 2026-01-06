function Detect-Node { Test-Path package.json }
function Detect-Python { Test-Path requirements.txt -or Test-Path pyproject.toml }
function Detect-Terraform { Test-Path *.tf }
function Detect-Docker { Test-Path Dockerfile }
function Detect-GCP { Test-Path ops/manifests/gcp.yaml }
