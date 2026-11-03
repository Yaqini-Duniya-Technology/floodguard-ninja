from app.postcode import ResolveIn
import pytest
from pydantic import ValidationError

def test_official_display_format():
    assert ResolveIn(postcode="AD-04-C09-UH-20").postcode == "AD04C09UH20"

def test_unseparated_format():
    assert ResolveIn(postcode="ad04c09uh20").postcode == "AD04C09UH20"

def test_invalid_length():
    with pytest.raises(ValidationError):
        ResolveIn(postcode="AD-04")
