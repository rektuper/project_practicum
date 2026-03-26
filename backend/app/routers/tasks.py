from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Task, TaskExecutor
from app.schemas import TaskCreate, TaskResponse, TaskToggleResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def build_task_response(task: Task, db: Session) -> TaskResponse:
    executors = db.query(TaskExecutor).filter(TaskExecutor.task_id == task.id).all()

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        deadline=task.deadline,
        status=task.status,
        is_completed=task.is_completed,
        author_id=task.author_id,
        executor_ids=[executor.employee_id for executor in executors],
    )


@router.get("/", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [build_task_response(task, db) for task in tasks]


@router.get("/search", response_model=list[TaskResponse])
def search_tasks(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    search_value = f"%{q}%"

    tasks = (
        db.query(Task)
        .filter(
            or_(
                Task.title.ilike(search_value),
                Task.description.ilike(search_value),
                Task.deadline.ilike(search_value),
                Task.status.ilike(search_value),
            )
        )
        .all()
    )

    return [build_task_response(task, db) for task in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task_by_id(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return build_task_response(task, db)


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(
        title=payload.title,
        description=payload.description,
        deadline=payload.deadline,
        status="completed" if payload.is_completed else "in-progress",
        is_completed=payload.is_completed,
        author_id=payload.author_id,
    )

    db.add(task)
    db.flush()

    for executor_id in payload.executor_ids:
        db.add(
            TaskExecutor(
                task_id=task.id,
                employee_id=executor_id,
            )
        )

    db.commit()
    db.refresh(task)

    return build_task_response(task, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = payload.title
    task.description = payload.description
    task.deadline = payload.deadline
    task.author_id = payload.author_id
    task.is_completed = payload.is_completed
    task.status = "completed" if payload.is_completed else "in-progress"

    db.query(TaskExecutor).filter(TaskExecutor.task_id == task_id).delete()

    for executor_id in payload.executor_ids:
        db.add(
            TaskExecutor(
                task_id=task_id,
                employee_id=executor_id,
            )
        )

    db.commit()
    db.refresh(task)

    return build_task_response(task, db)


@router.patch("/{task_id}/toggle", response_model=TaskToggleResponse)
def toggle_task_completed(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    task.status = "completed" if task.is_completed else "in-progress"

    db.commit()
    db.refresh(task)

    return TaskToggleResponse(
        id=task.id,
        is_completed=task.is_completed,
        status=task.status,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()