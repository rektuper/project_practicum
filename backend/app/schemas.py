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