"""Regression tests for private location intake and receipt privacy."""
import pytest
from pydantic import ValidationError
from app.main import ReportIn, ReportOut

BASE = {"type": "road", "severity": "high", "location": "Near bridge", "description": "Water rising"}

def test_report_without_coordinates_is_valid():
    assert ReportIn(**BASE).latitude is None

def test_gps_requires_explicit_consent():
    with pytest.raises(ValidationError):
        ReportIn(**BASE, latitude=7.1, longitude=6.2, coordinate_source="gps", accuracy_m=25)

def test_partial_coordinates_rejected():
    with pytest.raises(ValidationError):
        ReportIn(**BASE, latitude=7.1, coordinate_source="gps", coordinate_consent=True)

@pytest.mark.parametrize("latitude,longitude", [(91, 6), (-91, 6), (7, 181), (7, -181)])
def test_out_of_range_coordinates_rejected(latitude, longitude):
    with pytest.raises(ValidationError):
        ReportIn(**BASE, latitude=latitude, longitude=longitude, coordinate_source="manual", coordinate_consent=True)

def test_manual_location_rejects_gps_accuracy():
    with pytest.raises(ValidationError):
        ReportIn(**BASE, latitude=7, longitude=6, coordinate_source="manual", accuracy_m=10, coordinate_consent=True)

def test_consent_without_coordinates_rejected():
    with pytest.raises(ValidationError):
        ReportIn(**BASE, coordinate_consent=True)

def test_receipt_excludes_precise_coordinates():
    payload = ReportIn(**BASE, latitude=7.1, longitude=6.2, coordinate_source="gps", accuracy_m=20, coordinate_consent=True)
    receipt = ReportOut(**payload.model_dump(exclude={"latitude", "longitude", "coordinate_source", "accuracy_m", "coordinate_consent"}), id="test-id", timestamp="2026-10-31T00:00:00Z", status="PENDING", receipt_token="example")
    output = receipt.model_dump()
    for key in ("latitude", "longitude", "coordinate_source", "accuracy_m", "coordinate_consent"):
        assert key not in output
