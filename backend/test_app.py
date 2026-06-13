import os
import sys
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add root folder to sys.path so backend is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db import Base
from backend.models.student_model import Student
from backend.schemas.student_schema import StudentCreate, StudentUpdate
from backend.services.student_service import StudentService

def run_tests():
    print("=== Running Backend System Tests ===")
    
    # 1. Initialize in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("[Pass] Created database tables in-memory.")
    
    db = TestingSessionLocal()
    
    try:
        # 2. Test Pydantic Schema Validations
        print("\nTesting validation schemas...")
        
        # Valid payload
        valid_payload = {
            "first_name": "Alice",
            "middle_name": "Marie",
            "last_name": "Smith",
            "dob": date(2000, 5, 15),
            "qualification": "B.Tech",
            "languages_known": ["English", "German"]
        }
        student_in = StudentCreate(**valid_payload)
        assert student_in.first_name == "Alice"
        assert "German" in student_in.languages_known
        print("[Pass] Valid schema validation passed.")
        
        # Invalid qualification validation
        try:
            StudentCreate(
                first_name="Bob",
                last_name="Jones",
                dob=date(1999, 1, 1),
                qualification="InvalidQual", # invalid
                languages_known=["English"]
            )
            raise AssertionError("Should have failed for invalid qualification")
        except ValueError as e:
            print(f"[Pass] Caught expected invalid qualification error: {e}")

        # Invalid DOB validation (future date)
        try:
            StudentCreate(
                first_name="Bob",
                last_name="Jones",
                dob=date(2030, 1, 1), # future date
                qualification="B.Tech",
                languages_known=["English"]
            )
            raise AssertionError("Should have failed for future DOB")
        except ValueError as e:
            print(f"[Pass] Caught expected invalid DOB error: {e}")

        # 3. Test Service CRUD Operations
        print("\nTesting database CRUD operations...")
        
        # Create student 1
        s1_in = StudentCreate(
            first_name="John",
            middle_name="Robert",
            last_name="Doe",
            dob=date(2002, 10, 20),
            qualification="MCA",
            languages_known=["English", "French"]
        )
        s1 = StudentService.create(db, s1_in)
        assert s1.id is not None
        assert s1.first_name == "John"
        print(f"[Pass] Created student: {s1.first_name} (ID: {s1.id})")

        # Create student 2
        s2_in = StudentCreate(
            first_name="Jane",
            last_name="Miller",
            dob=date(2005, 3, 12),
            qualification="B.Tech",
            languages_known=["English", "German"]
        )
        s2 = StudentService.create(db, s2_in)
        assert s2.id is not None
        print(f"[Pass] Created student: {s2.first_name} (ID: {s2.id})")

        # Read student by ID
        fetched = StudentService.get_by_id(db, s1.id)
        assert fetched is not None
        assert fetched.first_name == "John"
        print("[Pass] Read student by ID passed.")

        # Read all students (search + filter + sort)
        records, total = StudentService.get_all(db, search="Jane")
        assert total == 1
        assert records[0].first_name == "Jane"
        print("[Pass] Search filter passed.")

        records, total = StudentService.get_all(db, qualification="MCA")
        assert total == 1
        assert records[0].qualification == "MCA"
        print("[Pass] Qualification filter passed.")

        # Update student
        update_in = StudentUpdate(first_name="Johnny", languages_known=["English", "French", "German"])
        updated = StudentService.update(db, s1.id, update_in)
        assert updated.first_name == "Johnny"
        assert len(updated.languages_known) == 3
        print("[Pass] Update student details passed.")

        # Get Stats
        stats = StudentService.get_stats(db)
        assert stats["total_students"] == 2
        assert stats["qualification_breakdown"]["B.Tech"] == 1
        assert stats["language_distribution"]["English"] == 2
        assert stats["language_distribution"]["German"] == 2
        assert stats["language_distribution"]["French"] == 1
        print("[Pass] Statistics aggregation passed.")

        # Delete student
        success = StudentService.delete(db, s1.id)
        assert success is True
        fetched_deleted = StudentService.get_by_id(db, s1.id)
        assert fetched_deleted is None
        print("[Pass] Delete student record passed.")

        # Verify new stats
        new_stats = StudentService.get_stats(db)
        assert new_stats["total_students"] == 1
        print("[Pass] Updated statistics verified.")

        print("\n=== All Backend Tests Passed Successfully ===")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
