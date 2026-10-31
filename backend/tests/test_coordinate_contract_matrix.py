"""Fifty independent boundary, consent and malformed-input regression scenarios."""
import pytest
from pydantic import ValidationError
from app.main import ReportIn

BASE = {"type": "road", "severity": "high", "location": "Near bridge", "description": "Rising water"}

CASES = [
    ("no_coordinates", {}, True),
    ("gps_valid", {"latitude":7,"longitude":6,"coordinate_source":"gps","coordinate_consent":True}, True),
    ("manual_valid", {"latitude":7,"longitude":6,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("gps_accuracy_zero", {"latitude":7,"longitude":6,"coordinate_source":"gps","accuracy_m":0,"coordinate_consent":True}, True),
    ("gps_accuracy_max", {"latitude":7,"longitude":6,"coordinate_source":"gps","accuracy_m":100000,"coordinate_consent":True}, True),
    ("north_pole", {"latitude":90,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("south_pole", {"latitude":-90,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("east_limit", {"latitude":0,"longitude":180,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("west_limit", {"latitude":0,"longitude":-180,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("origin", {"latitude":0,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, True),
    ("missing_latitude", {"longitude":6,"coordinate_source":"gps","coordinate_consent":True}, False),
    ("missing_longitude", {"latitude":7,"coordinate_source":"gps","coordinate_consent":True}, False),
    ("missing_source", {"latitude":7,"longitude":6,"coordinate_consent":True}, False),
    ("missing_consent", {"latitude":7,"longitude":6,"coordinate_source":"gps"}, False),
    ("explicit_no_consent", {"latitude":7,"longitude":6,"coordinate_source":"gps","coordinate_consent":False}, False),
    ("consent_without_coordinates", {"coordinate_consent":True}, False),
    ("source_without_coordinates", {"coordinate_source":"manual"}, False),
    ("accuracy_without_coordinates", {"accuracy_m":5}, False),
    ("manual_with_accuracy", {"latitude":7,"longitude":6,"coordinate_source":"manual","accuracy_m":5,"coordinate_consent":True}, False),
    ("latitude_too_high", {"latitude":90.01,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("latitude_too_low", {"latitude":-90.01,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_too_high", {"latitude":0,"longitude":180.01,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_too_low", {"latitude":0,"longitude":-180.01,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("negative_accuracy", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":-1,"coordinate_consent":True}, False),
    ("excess_accuracy", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":100001,"coordinate_consent":True}, False),
    ("source_uppercase", {"latitude":0,"longitude":0,"coordinate_source":"GPS","coordinate_consent":True}, False),
    ("source_unknown", {"latitude":0,"longitude":0,"coordinate_source":"map","coordinate_consent":True}, False),
    ("source_empty", {"latitude":0,"longitude":0,"coordinate_source":"","coordinate_consent":True}, False),
    ("latitude_string_invalid", {"latitude":"north","longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_string_invalid", {"latitude":0,"longitude":"east","coordinate_source":"manual","coordinate_consent":True}, False),
    ("latitude_null", {"latitude":None,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_null", {"latitude":0,"longitude":None,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("accuracy_string_invalid", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":"far","coordinate_consent":True}, False),
    ("latitude_boolean", {"latitude":True,"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_boolean", {"latitude":0,"longitude":True,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("accuracy_boolean", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":True,"coordinate_consent":True}, False),
    ("latitude_list", {"latitude":[7],"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_list", {"latitude":0,"longitude":[6],"coordinate_source":"manual","coordinate_consent":True}, False),
    ("source_list", {"latitude":0,"longitude":0,"coordinate_source":["gps"],"coordinate_consent":True}, False),
    ("latitude_object", {"latitude":{"x":7},"longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_object", {"latitude":0,"longitude":{"x":6},"coordinate_source":"manual","coordinate_consent":True}, False),
    ("accuracy_object", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":{"x":5},"coordinate_consent":True}, False),
    ("latitude_inf", {"latitude":"Infinity","longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_inf", {"latitude":0,"longitude":"Infinity","coordinate_source":"manual","coordinate_consent":True}, False),
    ("accuracy_inf", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":"Infinity","coordinate_consent":True}, False),
    ("latitude_nan", {"latitude":"NaN","longitude":0,"coordinate_source":"manual","coordinate_consent":True}, False),
    ("longitude_nan", {"latitude":0,"longitude":"NaN","coordinate_source":"manual","coordinate_consent":True}, False),
    ("accuracy_nan", {"latitude":0,"longitude":0,"coordinate_source":"gps","accuracy_m":"NaN","coordinate_consent":True}, False),
    ("coordinate_source_none", {"latitude":7,"longitude":6,"coordinate_source":None,"coordinate_consent":True}, False),
    ("gps_accuracy_fraction", {"latitude":7.12345,"longitude":6.98765,"coordinate_source":"gps","accuracy_m":12.5,"coordinate_consent":True}, True),
]

@pytest.mark.parametrize("name,changes,accepted", CASES, ids=[row[0] for row in CASES])
def test_coordinate_contract(name, changes, accepted):
    if accepted:
        report = ReportIn(**BASE, **changes)
        assert report.type == "road"
    else:
        with pytest.raises(ValidationError):
            ReportIn(**BASE, **changes)
