from pydantic import BaseModel


class EmployeeResponse(BaseModel):
    id: str
    name: str
    position: str
    team: str
    department: str
    gender: str
    manager: str | None = None
    messenger: str | None = None
    photo: str | None = None
    birth_date: str | None = None

    class Config:
        from_attributes = True


class EmployeeShortResponse(BaseModel):
    id: str
    name: str
    position: str

    class Config:
        from_attributes = True