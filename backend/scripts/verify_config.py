"""
Verify that API keys and configuration are loaded correctly.
Usage: python scripts/verify_config.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_settings


def verify_config():
    """Verify configuration is loaded correctly."""
    print("Verifying configuration...")
    print("=" * 50)
    
    settings = get_settings()
    
    # Application settings
    print(f"✓ App Name: {settings.app_name}")
    print(f"✓ Environment: {settings.environment}")
    print(f"✓ Database URL: {settings.database_url[:30]}..." if len(str(settings.database_url)) > 30 else f"✓ Database URL: {settings.database_url}")
    
    # JWT settings
    print(f"\nJWT Settings:")
    print(f"✓ Secret Key: {'Set' if settings.secret_key != 'your-secret-key-change-in-production-use-env-variable' else '⚠ Using default (change in production!)'}")
    print(f"✓ Algorithm: {settings.algorithm}")
    print(f"✓ Token Expire Minutes: {settings.access_token_expire_minutes}")
    
    # API Keys
    print(f"\nAPI Keys:")
    print(f"{'✓' if settings.education_api_key else '✗'} Education API Key: {'Set' if settings.education_api_key else 'Not set'}")
    if settings.education_api_key:
        # Show first and last few characters for security
        key = settings.education_api_key
        if len(key) > 10:
            masked = f"{key[:4]}...{key[-4:]}"
        else:
            masked = "***"
        print(f"  Key preview: {masked}")
    
    print(f"{'✓' if settings.education_api_url else '✗'} Education API URL: {settings.education_api_url or 'Not set'}")
    print(f"{'✓' if settings.google_maps_api_key else '✗'} Google Maps API Key: {'Set' if settings.google_maps_api_key else 'Not set'}")
    if settings.google_maps_api_key:
        key = settings.google_maps_api_key
        if len(key) > 10:
            masked = f"{key[:4]}...{key[-4:]}"
        else:
            masked = "***"
        print(f"  Key preview: {masked}")
    
    # Admin settings
    print(f"\nAdmin Settings:")
    print(f"✓ Admin Endpoint Enabled: {settings.enable_admin_endpoint}")
    
    print("\n" + "=" * 50)
    
    # Check if critical settings are configured
    warnings = []
    if settings.secret_key == "your-secret-key-change-in-production-use-env-variable":
        warnings.append("⚠ SECRET_KEY is using default value - change in production!")
    
    if settings.environment == "production" and settings.enable_admin_endpoint:
        warnings.append("⚠ Admin endpoint is enabled in production - consider disabling!")
    
    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"  {warning}")
    
    print("\n✓ Configuration verification complete!")


if __name__ == "__main__":
    verify_config()

