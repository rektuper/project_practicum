from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    team = Column(String, nullable=False)
    department = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    manager = Column(String, nullable=True)
    messenger = Column(String, nullable=True)
    photo = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)

    projects = relationship(
        "EmployeeProject",
        back_populates="employee",
        cascade="all, delete-orphan",
    )
    hobbies = relationship(
        "EmployeeHobby",
        back_populates="employee",
        cascade="all, delete-orphan",
    )


class EmployeeProject(Base):
    __tablename__ = "employee_projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_name = Column(String, nullable=False)

    employee = relationship("Employee", back_populates="projects")


class EmployeeHobby(Base):
    __tablename__ = "employee_hobbies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hobby_name = Column(String, nullable=False)

    employee = relationship("Employee", back_populates="hobbies")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=True)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)


class WorkEvent(Base):
    __tablename__ = "work_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location = Column(String, nullable=True)
    description = Column(String, nullable=False)


class WorkEventParticipant(Base):
    __tablename__ = "work_event_participants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    work_event_id = Column(
        Integer,
        ForeignKey("work_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, nullable=False, default="in-progress")
    is_completed = Column(Boolean, nullable=False, default=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)


class TaskExecutor(Base):
    __tablename__ = "task_executors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )