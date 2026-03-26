from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import Employee, EmployeeHobby, EmployeeProject
from app.schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = (
        db.query(Employee)
        .options(
            selectinload(Employee.projects),
            selectinload(Employee.hobbies),
        )
        .all()
    )
    return employees


@router.get("/search", response_model=list[EmployeeResponse])
def search_employees(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    search_value = f"%{q}%"

    employees = (
        db.query(Employee)
        .options(
            selectinload(Employee.projects),
            selectinload(Employee.hobbies),
        )
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
def get_employee_by_id(employee_id: int, db: Session = Depends(get_db)):
    employee = (
        db.query(Employee)
        .options(
            selectinload(Employee.projects),
            selectinload(Employee.hobbies),
        )
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    employee = Employee(
        name=payload.name,
        position=payload.position,
        team=payload.team,
        department=payload.department,
        gender=payload.gender,
        manager=payload.manager,
        messenger=payload.messenger,
        photo=payload.photo,
        birth_date=payload.birth_date,
    )

    db.add(employee)
    db.flush()

    for project in payload.projects:
        db.add(
            EmployeeProject(
                employee_id=employee.id,
                project_name=project,
            )
        )

    for hobby in payload.hobbies:
        db.add(
            EmployeeHobby(
                employee_id=employee.id,
                hobby_name=hobby,
            )
        )

    db.commit()

    created_employee = (
        db.query(Employee)
        .options(
            selectinload(Employee.projects),
            selectinload(Employee.hobbies),
        )
        .filter(Employee.id == employee.id)
        .first()
    )

    return created_employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.name = payload.name
    employee.position = payload.position
    employee.team = payload.team
    employee.department = payload.department
    employee.gender = payload.gender
    employee.manager = payload.manager
    employee.messenger = payload.messenger
    employee.photo = payload.photo
    employee.birth_date = payload.birth_date

    db.query(EmployeeProject).filter(EmployeeProject.employee_id == employee_id).delete()
    db.query(EmployeeHobby).filter(EmployeeHobby.employee_id == employee_id).delete()

    for project in payload.projects:
        db.add(
            EmployeeProject(
                employee_id=employee_id,
                project_name=project,
            )
        )

    for hobby in payload.hobbies:
        db.add(
            EmployeeHobby(
                employee_id=employee_id,
                hobby_name=hobby,
            )
        )

    db.commit()

    updated_employee = (
        db.query(Employee)
        .options(
            selectinload(Employee.projects),
            selectinload(Employee.hobbies),
        )
        .filter(Employee.id == employee_id)
        .first()
    )

    return updated_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()