import os
import sys

def validate_directory_structure():
    print("Validating directory structure...")
    required_dirs = ["ai_stack", "frontend_stack", "backend_stack"]
    for directory in required_dirs:
        if not os.path.exists(directory):
            print(f"[ERROR] Missing directory: {directory}")
            return False
    print("[SUCCESS] Directory structure is valid.")
    return True

def validate_python_imports():
    print("Validating Python imports...")
    try:
        import flask
        import requests
        import numpy
        print("[SUCCESS] All Python imports are valid.")
        return True
    except ImportError as e:
        print(f"[ERROR] Missing Python package: {e}")
        return False

def main():
    print("Running system health check...")
    if not validate_directory_structure():
        sys.exit(1)
    if not validate_python_imports():
        sys.exit(1)
    print("System health check completed successfully.")

if __name__ == "__main__":
    main()