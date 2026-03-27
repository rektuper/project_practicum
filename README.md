# Project Practicum

Веб-приложение для внутреннего корпоративного портала с сотрудниками, задачами, активностями, календарём и чат-ботом.

## Что есть в проекте

### Frontend
Frontend написан на **Next.js** и отвечает за интерфейс:
- поиск сотрудников;
- просмотр карточки сотрудника;
- активности и мероприятия;
- календарь событий;
- задачи с отметкой выполнения;
- чат-бот.

### Backend
Backend вынесен отдельно на **Python + FastAPI** и работает с **SQLite**.

Через backend хранятся и отдаются данные для:
- сотрудников;
- мероприятий;
- задач.

## Стек

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

---

## Структура проекта

```bash
project_practicum/
├── app/                     # страницы Next.js
├── components/              # UI-компоненты
├── lib/                     # клиентские функции работы с API
├── backend/                 # Python backend
│   ├── app/
│   │   ├── main.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── routers/
│   │       ├── employees.py
│   │       ├── events.py
│   │       └── tasks.py
│   └── requirements.txt
├── public/
├── styles/
├── package.json
└── .env.local
```

---

## Возможности

### 1. Сотрудники
- просмотр списка сотрудников;
- поиск по имени, должности, отделу;
- фильтр по проекту;
- открытие карточки сотрудника;
- просмотр задач, связанных с сотрудником;
- CRUD для сотрудников на backend.

### 2. Активность и мероприятия
- список мероприятий;
- поиск мероприятий;
- открытие подробной информации по мероприятию;
- поиск сотрудников по хобби;
- CRUD для обычных мероприятий на backend.

### 3. Календарь
- календарь рабочих событий;
- выбор даты или диапазона дат;
- просмотр событий за выбранный день/период;
- открытие подробной информации о событии.

### 4. Задачи
- список активных задач;
- список завершённых задач;
- поиск задач;
- создание новой задачи;
- выбор исполнителей;
- отметка выполнения через checkbox;
- сохранение выполнения в БД через `is_completed`.

### 5. Чат-бот
- интерфейс корпоративного чата;
- отправка сообщений на `/api/chat`;
- поддержка ссылок на сотрудников и события в ответах;
- открытие карточки сотрудника или события по клику в сообщении.

---

## База данных

Используется **SQLite**.

Файл базы данных:

```bash
backend/app.db
```

### Основные таблицы
- `employees`
- `employee_projects`
- `employee_hobbies`
- `events`
- `work_events`
- `work_event_participants`
- `tasks`
- `task_executors`

### Важное поле в задачах
В таблице `tasks` добавлено поле:

```text
is_completed
```

Оно хранит состояние выполнения задачи и используется для галочки во frontend.

---

## Установка и запуск

## 1. Frontend

Установить зависимости:

```bash
npm install
```

Создать файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Запустить frontend:

```bash
npm run dev
```

По умолчанию frontend будет доступен по адресу:

```text
http://localhost:3000
```

---

## 2. Backend

Перейти в папку backend:

```bash
cd backend
```

Создать виртуальное окружение:

```bash
python -m venv venv
```

Активировать окружение:

### Windows PowerShell
```bash
venv\Scripts\Activate.ps1
```

### Windows cmd
```bash
venv\Scripts\activate
```

Установить зависимости:

```bash
pip install -r requirements.txt
```

Если `requirements.txt` ещё не заполнен, можно установить вручную:

```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

---

## Инициализация базы

Заполнить базу стартовыми данными:

```bash
python -m app.seed
```

Запустить backend:

```bash
uvicorn app.main:app --reload
```

Backend будет доступен по адресу:

```text
http://127.0.0.1:8000
```

Swagger-документация:

```text
http://127.0.0.1:8000/docs
```

---

## API

### Employees
- `GET /employees/`
- `GET /employees/{employee_id}`
- `GET /employees/search?q=...`
- `POST /employees/`
- `PUT /employees/{employee_id}`
- `DELETE /employees/{employee_id}`

### Events
- `GET /events/`
- `GET /events/{event_id}`
- `GET /events/search?q=...`
- `POST /events/`
- `PUT /events/{event_id}`
- `DELETE /events/{event_id}`

### Tasks
- `GET /tasks/`
- `GET /tasks/{task_id}`
- `GET /tasks/search?q=...`
- `POST /tasks/`
- `PUT /tasks/{task_id}`
- `PATCH /tasks/{task_id}/toggle`
- `DELETE /tasks/{task_id}`

---

## Как frontend связан с backend

Во frontend клиентские функции вынесены в `lib/data/*`:
- `lib/data/employees.ts`
- `lib/data/events.ts`
- `lib/data/tasks.ts`

Они больше не работают с моками напрямую, а ходят в Python API через:

```ts
apiFetch(...)
```

Это позволяет сохранить старую структуру frontend-кода, но уже использовать настоящую базу данных.

---

## Как работает чат

Чат-бот отправляет сообщение на:

```text
/api/chat
```

Frontend ожидает ответ в формате:

```json
{
  "message": "Текст ответа"
}
```

Если в тексте ответа есть специальные ссылки:

```text
<u:1>
<e:2>
```

то они превращаются в кликабельные сущности:
- `<u:id>` → сотрудник;
- `<e:id>` → событие.

После нажатия открывается соответствующая модалка.

---

## Известные особенности

- Часть данных на frontend преобразуется из snake_case в camelCase.
- Для локальной разработки backend использует открытый CORS.
- Автор новой задачи сейчас задаётся временно вручную в коде frontend.
- Чат требует отдельной реализации `/api/chat`, если нужен полноценный поиск по данным проекта.

---

## Что можно улучшить дальше

- сделать полноценную авторизацию;
- добавить редактирование задач через интерфейс;
- добавить CRUD для рабочих событий;
- сделать серверную логику чат-бота умнее;
- добавить переходы без перезагрузки через `router.push` и query-параметры;
- улучшить адаптивность сайдбара и мобильной навигации.

---

## Автор

Проект разработан в рамках учебной практики и доработан с выносом данных в отдельный backend на Python.
