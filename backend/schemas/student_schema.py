from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import List, Optional

VALID_QUALIFICATIONS = {"B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA"}
VALID_LANGUAGES = {"English", "French", "German", "Hindi", "Russian", "Spanish", "Mandarin"}

class StudentBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50, description="Student's first name")
    middle_name: Optional[str] = Field(None, max_length=50, description="Student's middle name")
    last_name: str = Field(..., min_length=1, max_length=50, description="Student's last name")
    dob: date = Field(..., description="Date of birth")
    qualification: str = Field(..., description="Educational qualification")
    languages_known: List[str] = Field(default=[], description="Languages known")

    @field_validator("qualification")
    @classmethod
    def validate_qualification(cls, v: str) -> str:
        if v not in VALID_QUALIFICATIONS:
            raise ValueError(f"Qualification must be one of: {', '.join(VALID_QUALIFICATIONS)}")
        return v

    @field_validator("languages_known")
    @classmethod
    def validate_languages(cls, v: List[str]) -> List[str]:
        for lang in v:
            if lang not in VALID_LANGUAGES:
                raise ValueError(f"Invalid language '{lang}'. Valid choices are: {', '.join(VALID_LANGUAGES)}")
        return v

    @field_validator("dob")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("Date of birth must be in the past")
        # Ensure student is at least 3 years old (reasonable lower bound)
        age = date.today().year - v.year
        if age < 3:
            raise ValueError("Student must be at least 3 years old")
        return v

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    middle_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    dob: Optional[date] = None
    qualification: Optional[str] = None
    languages_known: Optional[List[str]] = None

    @field_validator("qualification")
    @classmethod
    def validate_qualification(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_QUALIFICATIONS:
            raise ValueError(f"Qualification must be one of: {', '.join(VALID_QUALIFICATIONS)}")
        return v

    @field_validator("languages_known")
    @classmethod
    def validate_languages(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for lang in v:
                if lang not in VALID_LANGUAGES:
                    raise ValueError(f"Invalid language '{lang}'. Valid choices are: {', '.join(VALID_LANGUAGES)}")
        return v

    @field_validator("dob")
    @classmethod
    def validate_dob(cls, v: Optional[date]) -> Optional[date]:
        if v is not None:
            if v >= date.today():
                raise ValueError("Date of birth must be in the past")
            age = date.today().year - v.year
            if age < 3:
                raise ValueError("Student must be at least 3 years old")
        return v

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True # Pydantic V2 config to support ORM models
    }
