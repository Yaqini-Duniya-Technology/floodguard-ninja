"""Public, non-secret integration readiness summary. No external calls."""
import os
from urllib.parse import urlparse
from fastapi import APIRouter

router = APIRouter(prefix='/api/v1/integrations', tags=['integrations'])

@router.get('/nipost/readiness')
def nipost_readiness():
    enabled = os.getenv('NIPOST_INTEGRATION_ENABLED', 'false').lower() == 'true'
    url = os.getenv('NIPOST_LOOKUP_URL', '')
    parsed = urlparse(url)
    host = os.getenv('NIPOST_ALLOWED_HOST', '').lower()
    endpoint_approved = bool(parsed.scheme == 'https' and parsed.hostname and host and parsed.hostname.lower() == host and not parsed.username and not parsed.password and not parsed.fragment)
    credential_present = bool(os.getenv('NIPOST_API_KEY', ''))
    contract_verified = os.getenv('NIPOST_CONTRACT_VERIFIED', 'false').lower() == 'true'
    checks = {
        'integration_enabled': enabled,
        'approved_https_endpoint_configured': endpoint_approved,
        'credentials_present': credential_present,
        'contract_review_flag_set': contract_verified,
    }
    return {
        'status': 'blocked_pending_adapter_implementation',
        'live_postcode_resolution_available': False,
        'checks': checks,
        'next_step': 'Obtain official NIPOST API documentation and implement and verify its authentication, request and response contract.',
        'notice': 'Configuration checks are not proof of an operational official integration.'
    }
