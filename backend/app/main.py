from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db import Base, engine
from app import models
from app.routers import employees, events, tasks


app = FastAPI(title="Project Practicum API")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(events.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/tables")
def get_tables():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        )
        tables = [row[0] for row in result]
    return {"tables": tables}