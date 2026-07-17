"""
Quick setup verification script

Checks if all required dependencies and configurations are in place.
"""

import sys
import os


def check_python_version():
    """Verify Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (Need 3.9+)")
        return False


def check_env_file():
    """Verify .env file exists"""
    if os.path.exists(".env"):
        print("✅ .env file exists")
        return True
    else:
        print("❌ .env file not found")
        print("   Run: cp .env.example .env")
        return False


def check_dependencies():
    """Verify key dependencies are installed"""
    dependencies = [
        "fastapi",
        "motor",
        "pydantic",
        "passlib",
        "jose",
        "loguru",
        "uvicorn"
    ]
    
    all_installed = True
    
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} not installed")
            all_installed = False
    
    if not all_installed:
        print("\n   Run: pip install -r requirements.txt")
    
    return all_installed


def check_mongodb():
    """Check if MongoDB is accessible"""
    try:
        from pymongo import MongoClient
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        client.server_info()
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed")
        print(f"   Make sure MongoDB is running on localhost:27017")
        return False


def main():
    print("\n" + "="*60)
    print("  BharatSathi AI - Backend Setup Verification")
    print("="*60 + "\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Environment File", check_env_file),
        ("Dependencies", check_dependencies),
        ("MongoDB", check_mongodb),
    ]
    
    results = []
    
    for name, check_func in checks:
        print(f"\nChecking {name}...")
        results.append(check_func())
    
    print("\n" + "="*60)
    
    if all(results):
        print("✅ All checks passed! You're ready to start the server.")
        print("\nRun: uvicorn app.main:app --reload")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
