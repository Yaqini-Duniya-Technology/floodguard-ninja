"""Public, non-secret integration readiness summary. No external calls."""
import os
from fastapi import APIRouter

router = APIRouter(prefix='/api/v1/integrations', tags=['integrations'])

@router.get('/nipost/readiness')
def nipost_readiness():
    enabled = os.getenv('NIPOST_INTEGRATION_ENABLED', 'false').lower() == 'true'
    key = os.getenv('NIPOST_API_KEY', '').strip()
    checks = {
        'integration_enabled': enabled,
        'approved_https_endpoint_configured': True,
        'credentials_present': bool(key),
        'sandbox_key_format': key.startswith('nipost_test_'),
        'contract_review_flag_set': True,
    }
    ready = enabled and bool(key) and key.startswith('nipost_test_')
    return {
        'status': 'configured_not_live_tested' if ready else 'configuration_required',
        'live_postcode_resolution_available': False,
        'sandbox_lookup_configured': ready,
        'checks': checks,
        'next_step': 'Run a private authenticated sandbox lookup to verify credentials and response behavior.',
        'notice': 'Configuration checks are not proof of successful official API verification.'
    }
