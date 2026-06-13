from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from backend.database.db import get_db
from backend.schemas.student_schema import StudentCreate, StudentUpdate, StudentResponse
from backend.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    return StudentService.create(db, student)

@router.get("", response_model=Dict)
def get_students(
    search: Optional[str] = Query(None, description="Search by name"),
    qualification: Optional[str] = Query(None, description="Filter by qualification"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort direction (asc/desc)"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Limit for pagination"),
    db: Session = Depends(get_db)
):
    records, total = StudentService.get_all(
        db, 
        search=search, 
        qualification=qualification, 
        sort_by=sort_by, 
        sort_order=sort_order, 
        skip=skip, 
        limit=limit
    )
    # Serialize to StudentResponse list and return along with total
    return {
        "students": [StudentResponse.model_validate(r) for r in records],
        "total": total
    }

@router.get("/stats", response_model=Dict)
def get_student_stats(db: Session = Depends(get_db)):
    return StudentService.get_stats(db)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    db_student = StudentService.get_by_id(db, student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with id {student_id} not found"
        )
    return db_student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentUpdate, db: Session = Depends(get_db)):
    db_student = StudentService.update(db, student_id, student)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with id {student_id} not found"
        )
    return db_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    success = StudentService.delete(db, student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with id {student_id} not found"
        )
    return None
