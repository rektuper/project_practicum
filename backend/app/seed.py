from app.db import Base, SessionLocal, engine
from app.models import (
    Employee,
    EmployeeHobby,
    EmployeeProject,
    Event,
    Task,
    TaskExecutor,
    WorkEvent,
    WorkEventParticipant,
)


def get_pixel_art_avatar(seed: str) -> str:
    return f"https://api.dicebear.com/9.x/pixel-art/svg?seed={seed}"


employees_data = [
    {
        "id": "1",
        "name": "Иванов Иван Иванович",
        "position": "Frontend-разработчик",
        "projects": ["Альфа"],
        "hobbies": ["Шахматы", "Программирование"],
        "team": "Разработка",
        "department": "IT",
        "gender": "Мужской",
        "manager": "Петров Петр Петрович",
        "messenger": "slack://user/U01234567",
        "photo": get_pixel_art_avatar("ivanov"),
        "birth_date": "1990-01-01",
    },
    {
        "id": "2",
        "name": "Петрова Анна Сергеевна",
        "position": "UX/UI дизайнер",
        "projects": ["Бета"],
        "hobbies": ["Фотография", "Рисование"],
        "team": "Дизайн",
        "department": "Продукт",
        "gender": "Женский",
        "manager": "Сидоров Алексей Владимирович",
        "messenger": "slack://user/U07654321",
        "photo": get_pixel_art_avatar("petrova"),
        "birth_date": "1985-05-23",
    },
    {
        "id": "3",
        "name": "Сидоров Алексей Владимирович",
        "position": "Руководитель отдела",
        "projects": ["Руководство"],
        "hobbies": ["Бег", "Плавание", "Йога"],
        "team": "Руководство",
        "department": "Продукт",
        "gender": "Мужской",
        "manager": "Козлов Дмитрий Александрович",
        "messenger": "slack://user/U09876543",
        "photo": get_pixel_art_avatar("sidorov"),
        "birth_date": "1992-08-12",
    },
    {
        "id": "4",
        "name": "Козлов Дмитрий Александрович",
        "position": "Backend-разработчик",
        "projects": ["Альфа"],
        "hobbies": ["Шахматы", "Настольные игры"],
        "team": "Разработка",
        "department": "IT",
        "gender": "Мужской",
        "manager": "Сидоров Алексей Владимирович",
        "messenger": "slack://user/U01234568",
        "photo": get_pixel_art_avatar("kozlov"),
        "birth_date": "1988-03-14",
    },
    {
        "id": "5",
        "name": "Смирнова Елена Игоревна",
        "position": "HR-менеджер",
        "projects": ["Руководство"],
        "hobbies": ["Бег", "Кулинария"],
        "team": "HR",
        "department": "Управление персоналом",
        "gender": "Женский",
        "manager": "Сидоров Алексей Владимирович",
        "messenger": "slack://user/U01234569",
        "photo": get_pixel_art_avatar("smirnova"),
        "birth_date": "1993-07-05",
    },
]

events_data = [
    {
        "id": "1",
        "title": "Корпоративный тимбилдинг",
        "date": "2026-06-15",
        "time": "14:00",
        "location": "Парк Горького",
        "description": "Командные игры и барбекю на свежем воздухе",
    },
    {
        "id": "2",
        "title": "Онлайн-лекция по AI",
        "date": "2026-04-20",
        "time": "11:00",
        "location": "Zoom",
        "description": "Приглашенный спикер расскажет о последних трендах в AI",
    },
    {
        "id": "3",
        "title": "Спортивный день",
        "date": "2026-06-25",
        "time": "10:00",
        "location": "Спортивный центр 'Олимп'",
        "description": "Волейбол, баскетбол и настольный теннис",
    },
]

work_events_data = [
    {
        "id": "1",
        "title": "Еженедельный статус-митинг",
        "start_date": "2026-06-15T10:00:00",
        "end_date": "2026-06-15T11:00:00",
        "type": "online",
        "location": "Zoom",
        "participants": ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В."],
        "description": "Обсуждение текущего статуса проектов и планирование на неделю",
    },
    {
        "id": "2",
        "title": "Презентация нового продукта",
        "start_date": "2026-06-17T14:00:00",
        "end_date": "2026-06-17T16:00:00",
        "type": "offline",
        "location": "Конференц-зал 'Москва'",
        "participants": ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В.", "Козлов Д.А."],
        "description": "Презентация нового продукта для клиентов и партнеров",
    },
    {
        "id": "3",
        "title": "Дедлайн проекта 'Альфа'",
        "start_date": "2026-06-20T18:00:00",
        "end_date": "2026-06-20T18:00:00",
        "type": "deadline",
        "location": "",
        "participants": ["Иванов И.И.", "Петрова А.С."],
        "description": "Финальный срок сдачи проекта 'Альфа'",
    },
    {
        "id": "4",
        "title": "Обучение по новым технологиям",
        "start_date": "2026-06-22T11:00:00",
        "end_date": "2026-06-22T13:00:00",
        "type": "online",
        "location": "Microsoft Teams",
        "participants": ["Иванов И.И.", "Козлов Д.А."],
        "description": "Обучение команды разработки новым технологиям",
    },
    {
        "id": "5",
        "title": "Ежемесячное собрание отдела",
        "start_date": "2026-05-30T09:00:00",
        "end_date": "2026-05-30T10:30:00",
        "type": "offline",
        "location": "Конференц-зал 'Санкт-Петербург'",
        "participants": ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В.", "Козлов Д.А.", "Смирнова Е.И."],
        "description": "Подведение итогов месяца и планирование на следующий",
    },
    {
        "id": "6",
        "title": "Встреча с клиентом",
        "start_date": "2026-05-28T15:00:00",
        "end_date": "2026-05-28T16:00:00",
        "type": "online",
        "location": "Google Meet",
        "participants": ["Иванов И.И.", "Петрова А.С."],
        "description": "Обсуждение требований к новому проекту",
    },
]

tasks_data = [
    {
        "id": "1",
        "title": "Подготовить отчет за квартал",
        "description": "Собрать данные и подготовить квартальный отчет для руководства",
        "deadline": "2026-04-20",
        "status": "in-progress",
        "author_id": "3",
        "executor_ids": ["1", "2"],
    },
    {
        "id": "2",
        "title": "Обновить дизайн главной страницы",
        "description": "Внести изменения в дизайн главной страницы согласно новому брендбуку",
        "deadline": "2026-06-25",
        "status": "in-progress",
        "author_id": "3",
        "executor_ids": ["2"],
    },
    {
        "id": "3",
        "title": "Провести интервью с кандидатами",
        "description": "Провести собеседования с кандидатами на должность разработчика",
        "deadline": "2026-06-15",
        "status": "completed",
        "author_id": "5",
        "executor_ids": ["3", "4"],
    },
]


def short_name(full_name: str) -> str:
    parts = full_name.split()
    if len(parts) < 3:
        return full_name
    return f"{parts[0]} {parts[1][0]}. {parts[2][0]}."


def build_short_name_map():
    result = {}
    for employee in employees_data:
        result[short_name(employee["name"])] = employee["id"]
    return result


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        db.query(TaskExecutor).delete()
        db.query(WorkEventParticipant).delete()
        db.query(Task).delete()
        db.query(WorkEvent).delete()
        db.query(Event).delete()
        db.query(EmployeeProject).delete()
        db.query(EmployeeHobby).delete()
        db.query(Employee).delete()
        db.commit()

        # employees
        for item in employees_data:
            employee = Employee(
                id=item["id"],
                name=item["name"],
                position=item["position"],
                team=item["team"],
                department=item["department"],
                gender=item["gender"],
                manager=item["manager"],
                messenger=item["messenger"],
                photo=item["photo"],
                birth_date=item["birth_date"],
            )
            db.add(employee)

        db.commit()

        # employee_projects + employee_hobbies
        for item in employees_data:
            for project in item.get("projects", []):
                db.add(
                    EmployeeProject(
                        employee_id=item["id"],
                        project_name=project,
                    )
                )

            for hobby in item.get("hobbies", []):
                db.add(
                    EmployeeHobby(
                        employee_id=item["id"],
                        hobby_name=hobby,
                    )
                )

        db.commit()

        # events
        for item in events_data:
            db.add(
                Event(
                    id=item["id"],
                    title=item["title"],
                    date=item["date"],
                    time=item["time"],
                    location=item["location"],
                    description=item["description"],
                )
            )

        db.commit()

        # work_events
        short_map = build_short_name_map()

        for item in work_events_data:
            db.add(
                WorkEvent(
                    id=item["id"],
                    title=item["title"],
                    start_date=item["start_date"],
                    end_date=item["end_date"],
                    type=item["type"],
                    location=item["location"],
                    description=item["description"],
                )
            )

        db.commit()

        for item in work_events_data:
            for participant in item["participants"]:
                employee_id = short_map.get(participant)
                if employee_id:
                    db.add(
                        WorkEventParticipant(
                            work_event_id=item["id"],
                            employee_id=employee_id,
                        )
                    )

        db.commit()

        # tasks
        for item in tasks_data:
            db.add(
                Task(
                    id=item["id"],
                    title=item["title"],
                    description=item["description"],
                    deadline=item["deadline"],
                    status=item["status"],
                    author_id=item["author_id"],
                )
            )

        db.commit()

        for item in tasks_data:
            for executor_id in item["executor_ids"]:
                db.add(
                    TaskExecutor(
                        task_id=item["id"],
                        employee_id=executor_id,
                    )
                )

        db.commit()

        print("Seed completed successfully.")

    except Exception as e:
        db.rollback()
        print("Seed failed:", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()