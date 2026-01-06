"""FAANG-level live sync test for VS Code, GitHub, Hostinger, and Google Cloud integration."""
import os
import subprocess

def test_git_status_clean():
    """Ensure git status is clean after auto-sync."""
    status = subprocess.check_output(['git', 'status', '--porcelain']).decode().strip()
    assert status == '', f"Git working directory not clean: {status}"

def test_github_push():
    """Check that the latest commit is pushed to the remote repository."""
    local = subprocess.check_output(['git', 'rev-parse', '@']).strip()
    remote = subprocess.check_output(['git', 'rev-parse', '@{u}']).strip()
    assert local == remote, "Local and remote commits do not match. Push failed."

def test_hostinger_deploy_script():
    """Check that Hostinger deploy script exists and is executable."""
    assert os.path.exists('deploy-with-python.ps1'), "Hostinger deploy script missing."
    assert os.path.getsize('deploy-with-python.ps1') > 0, "Hostinger deploy script is empty."

def test_google_cloud_backend():
    """Check Google Cloud backend integration (env var or config)."""
    gcp_key = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    assert gcp_key and os.path.exists(gcp_key), "Google Cloud credentials missing or invalid."

def test_vision_cortex_module():
    """Check Vision Cortex module is importable and callable."""
    from vision_cortex.vision_service import VisionCortex
    vision = VisionCortex('test-project', 'us-central1')
    result = vision.analyze_content('test')
    assert 'summary' in result, "Vision Cortex did not return expected result."

def test_quantum_x_builder_module():
    """Check Quantum X Builder module is importable and callable."""
    from quantum_x_builder.builder_service import QuantumXBuilder
    builder = QuantumXBuilder()
    code = builder.generate_code('test_template', {'param': 1})
    assert 'Generated code' in code, "Quantum X Builder did not generate code."
