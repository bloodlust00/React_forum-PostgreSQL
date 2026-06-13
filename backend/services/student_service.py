from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from backend.models.student_model import Student
from backend.schemas.student_schema import StudentCreate, StudentUpdate

class StudentService:
    @staticmethod
    def get_all(
        db: Session,
        search: Optional[str] = None,
        qualification: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        skip: int = 0,
        limit: int = 100
    ):
        query = db.query(Student)

        # 1. Search filter (checks first, middle, and last name)
        if search:
            search_pat = f"%{search}%"
            query = query.filter(
                or_(
                    Student.first_name.ilike(search_pat),
                    Student.middle_name.ilike(search_pat),
                    Student.last_name.ilike(search_pat)
                )
            )

        # 2. Qualification filter
        if qualification:
            query = query.filter(Student.qualification == qualification)

        # 3. Dynamic Sorting
        # Map sort_by string to SQLAlchemy columns
        col_map = {
            "first_name": Student.first_name,
            "last_name": Student.last_name,
            "dob": Student.dob,
            "qualification": Student.qualification,
            "created_at": Student.created_at
        }
        sort_col = col_map.get(sort_by, Student.created_at)
        
        if sort_order == "desc":
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(asc(sort_col))

        # 4. Total count before pagination
        total = query.count()

        # 5. Apply Pagination
        records = query.offset(skip).limit(limit).all()

        return records, total

    @staticmethod
    def get_by_id(db: Session, student_id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.id == student_id).first()

    @staticmethod
    def create(db: Session, student_in: StudentCreate) -> Student:
        db_student = Student(
            first_name=student_in.first_name,
            middle_name=student_in.middle_name,
            last_name=student_in.last_name,
            dob=student_in.dob,
            qualification=student_in.qualification,
            languages_known=student_in.languages_known
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def update(db: Session, student_id: int, student_in: StudentUpdate) -> Optional[Student]:
        db_student = StudentService.get_by_id(db, student_id)
        if not db_student:
            return None

        update_data = student_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)

        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def delete(db: Session, student_id: int) -> bool:
        db_student = StudentService.get_by_id(db, student_id)
        if not db_student:
            return False
        db.delete(db_student)
        db.commit()
        return True

    @staticmethod
    def get_stats(db: Session):
        # Retrieve all students to perform analytics
        students = db.query(Student).all()
        total_students = len(students)

        # Qualification breakdown
        qual_breakdown = {}
        # Languages distribution
        lang_distribution = {"English": 0, "French": 0, "German": 0, "Hindi": 0, "Russian": 0, "Spanish": 0, "Mandarin": 0}

        for s in students:
            qual = s.qualification
            qual_breakdown[qual] = qual_breakdown.get(qual, 0) + 1
            
            langs = s.languages_known
            if isinstance(langs, str):
                import json
                try:
                    langs = json.loads(langs)
                except Exception:
                    langs = []
            
            if isinstance(langs, list):
                for lang in langs:
                    if lang in lang_distribution:
                        lang_distribution[lang] += 1

        return {
            "total_students": total_students,
            "qualification_breakdown": qual_breakdown,
            "language_distribution": lang_distribution
        }
