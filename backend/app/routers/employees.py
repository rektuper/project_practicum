from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Employee
from app.schemas import EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return employees


@router.get("/search", response_model=list[EmployeeResponse])
def search_employees(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    search_value = f"%{q}%"

    employees = (
        db.query(Employee)
        .filter(
            or_(
                Employee.name.ilike(search_value),
                Employee.position.ilike(search_value),
                Employee.team.ilike(search_value),
                Employee.department.ilike(search_value),
            )
        )
        .all()
    )

    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_by_id(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee