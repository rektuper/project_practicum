from pydantic import BaseModel


class EmployeeProjectResponse(BaseModel):
    project_name: str

    class Config:
        from_attributes = True


class EmployeeHobbyResponse(BaseModel):
    hobby_name: str

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    name: str
    position: str
    team: str
    department: str
    gender: str
    manager: str | None = None
    messenger: str | None = None
    photo: str | None = None
    birth_date: str | None = None


class EmployeeCreate(EmployeeBase):
    projects: list[str] = []
    hobbies: list[str] = []


class EmployeeUpdate(EmployeeBase):
    projects: list[str] = []
    hobbies: list[str] = []


class EmployeeResponse(EmployeeBase):
    id: int
    projects: list[EmployeeProjectResponse] = []
    hobbies: list[EmployeeHobbyResponse] = []

    class Config:
        from_attributes = True


class EmployeeShortResponse(BaseModel):
    id: int
    name: str
    position: str

    class Config:
        from_attributes = True


class EventBase(BaseModel):
    title: str
    date: str
    time: str | None = None
    location: str
    description: str


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    pass


class EventResponse(EventBase):
    id: int

    class Config:
        from_attributes = True

class TaskExecutorResponse(BaseModel):
    employee_id: int

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    description: str
    deadline: str
    author_id: int
    executor_ids: list[int] = []


class TaskCreate(TaskBase):
    is_completed: bool = False


class TaskUpdate(TaskBase):
    is_completed: bool = False


class TaskToggleResponse(BaseModel):
    id: int
    is_completed: bool
    status: str

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    deadline: str
    status: str
    is_completed: bool
    author_id: int
    executor_ids: list[int] = []

    class Config:
        from_attributes = True