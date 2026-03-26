from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Event
from app.schemas import EventCreate, EventResponse, EventUpdate

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()


@router.get("/search", response_model=list[EventResponse])
def search_events(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    search_value = f"%{q}%"

    events = (
        db.query(Event)
        .filter(
            or_(
                Event.title.ilike(search_value),
                Event.location.ilike(search_value),
                Event.description.ilike(search_value),
                Event.date.ilike(search_value),
            )
        )
        .all()
    )

    return events


@router.get("/{event_id}", response_model=EventResponse)
def get_event_by_id(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(
        title=payload.title,
        date=payload.date,
        time=payload.time,
        location=payload.location,
        description=payload.description,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.title = payload.title
    event.date = payload.date
    event.time = payload.time
    event.location = payload.location
    event.description = payload.description

    db.commit()
    db.refresh(event)

    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()