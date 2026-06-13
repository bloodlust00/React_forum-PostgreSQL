from sqlalchemy import Column, Integer, String, Date, DateTime, JSON, func
from backend.database.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String, nullable=False, index=True)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False, index=True)
    dob = Column(Date, nullable=False)
    qualification = Column(String, nullable=False, index=True)
    languages_known = Column(JSON, nullable=False, default=list) # e.g. ["English", "French"]
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
