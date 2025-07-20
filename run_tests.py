#!/usr/bin/env python3
"""
Test runner script for StockWise application.
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(command: str, description: str) -> bool:
    """Run a command and return success status."""
    print(f"\n🔍 {description}")
    print(f"Running: {command}")
    print("-" * 50)

    try:
        result = subprocess.run(
            command.split(), cwd=Path(__file__).parent, check=True, capture_output=False
        )
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False


def main():
    """Main test runner."""
    print("🚀 StockWise Test Suite Runner")
    print("=" * 50)

    # Ensure we're in the right directory
    project_root = Path(__file__).parent
    os.chdir(project_root)

    # Test commands to run
    test_commands = [
        {
            "command": "pytest tests/unit -v --tb=short -m unit",
            "description": "Unit Tests",
            "required": True,
        },
        {
            "command": "pytest tests/integration -v --tb=short -m integration",
            "description": "Integration Tests (requires Redis/DB)",
            "required": False,
        },
        {
            "command": "pytest tests/ -v --tb=short",
            "description": "All Tests",
            "required": False,
        },
        {
            "command": "pytest tests/ --cov=app --cov-report=html --cov-report=term",
            "description": "Tests with Coverage Report",
            "required": False,
        },
    ]

    # Code quality commands
    quality_commands = [
        {
            "command": "black --check app/ tests/",
            "description": "Code Formatting Check (Black)",
            "required": False,
        },
        {
            "command": "isort --check-only app/ tests/",
            "description": "Import Sorting Check (isort)",
            "required": False,
        },
        {
            "command": "flake8 app/ tests/ --max-line-length=88 --extend-ignore=E203,W503",
            "description": "Code Linting (Flake8)",
            "required": False,
        },
    ]

    results = []

    # Run tests
    print("\n📋 Running Tests...")
    for test_cmd in test_commands:
        success = run_command(test_cmd["command"], test_cmd["description"])
        results.append(
            {
                "name": test_cmd["description"],
                "success": success,
                "required": test_cmd["required"],
            }
        )

        # Stop on required test failure
        if not success and test_cmd["required"]:
            print(f"\n💥 Required test '{test_cmd['description']}' failed. Stopping.")
            break

    # Run code quality checks
    print("\n🔍 Running Code Quality Checks...")
    for quality_cmd in quality_commands:
        success = run_command(quality_cmd["command"], quality_cmd["description"])
        results.append(
            {
                "name": quality_cmd["description"],
                "success": success,
                "required": quality_cmd["required"],
            }
        )

    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 50)

    passed = 0
    failed = 0

    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        required = "(Required)" if result["required"] else "(Optional)"
        print(f"{status} {result['name']} {required}")

        if result["success"]:
            passed += 1
        else:
            failed += 1

    print(f"\nTotal: {passed} passed, {failed} failed")

    # Overall result
    required_failures = [r for r in results if not r["success"] and r["required"]]

    if required_failures:
        print(f"\n💥 {len(required_failures)} required tests failed!")
        return 1
    elif failed == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {failed} optional checks failed, but all required tests passed.")
        return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
