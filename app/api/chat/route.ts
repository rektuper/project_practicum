import OpenAI from "openai"
import { NextResponse } from "next/server"

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

type EmployeeApi = {
  id: number
  name: string
  position: string
  team: string
  department: string
  gender: string
  manager?: string | null
  messenger?: string | null
  photo?: string | null
  birth_date?: string | null
}

type EventApi = {
  id: number
  title: string
  date: string
  time?: string | null
  location: string
  description: string
}

type TaskApi = {
  id: number
  title: string
  description: string
  deadline: string
  status: string
  is_completed: boolean
  author_id: number
  executor_ids: number[]
}

function normalize(text: string) {
  return text.toLowerCase().trim().replace(/ё/g, "е")
}

function tokenize(text: string) {
  return normalize(text)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function formatDateRu(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function scoreNameMatch(query: string, employee: EmployeeApi) {
  const q = normalize(query)
  const name = normalize(employee.name)
  if (name.includes(q)) return 100

  const qTokens = tokenize(q)
  const nameTokens = tokenize(name)
  let score = 0

  for (const token of qTokens) {
    if (nameTokens.some((t) => t.startsWith(token))) score += 10
    if (name.includes(token)) score += 5
  }

  return score
}

function findBestEmployee(query: string, employees: EmployeeApi[]) {
  const ranked = employees
    .map((employee) => ({
      employee,
      score: scoreNameMatch(query, employee),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.employee
}

function tasksForEmployee(employeeId: number, tasks: TaskApi[]) {
  return tasks.filter(
    (task) =>
      task.author_id === employeeId || task.executor_ids.includes(employeeId)
  )
}

function sortByNearestDeadline(tasks: TaskApi[]) {
  return [...tasks].sort((a, b) => {
    const da = new Date(a.deadline).getTime()
    const db = new Date(b.deadline).getTime()
    return da - db
  })
}

function sortByNearestEvent(events: EventApi[]) {
  return [...events].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    return da - db
  })
}

function buildTaskLine(task: TaskApi) {
  return `• <t:${task.id}> — дедлайн ${formatDateRu(task.deadline)}`
}

function buildEventLine(event: EventApi) {
  const time = event.time ? `, ${event.time}` : ""
  return `• <e:${event.id}> — ${formatDateRu(event.date)}${time}`
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Backend request failed: ${path} ${res.status}`)
  }
  return res.json()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = String(body?.message || "")
    const q = normalize(message)

    if (!q) {
      return NextResponse.json({ message: "Введите сообщение." })
    }

    const [employees, tasks, events] = await Promise.all([
      fetchJson<EmployeeApi[]>("/employees/"),
      fetchJson<TaskApi[]>("/tasks/"),
      fetchJson<EventApi[]>("/events/"),
    ])

    // 1) "где петров", "кто такой петров", "найди петрова"
    if (
      q.includes("где ") ||
      q.includes("кто ") ||
      q.includes("найди ") ||
      q.includes("покажи сотрудника") ||
      q.includes("информация о")
    ) {
      const employee = findBestEmployee(message, employees)

      if (employee) {
        return NextResponse.json({
          message:
            `Найден сотрудник: <u:${employee.id}>.\n` +
            `Должность: ${employee.position}.\n` +
            `Отдел: ${employee.department}.\n` +
            `Команда: ${employee.team}.`,
        })
      }
    }

    // 2) "задачи петрова", "что у петрова по задачам"
    if (
      q.includes("задачи ") ||
      q.includes("задача ") ||
      q.includes("что у") ||
      q.includes("по задачам")
    ) {
      const employee = findBestEmployee(message, employees)

      if (employee) {
        const foundTasks = sortByNearestDeadline(
          tasksForEmployee(employee.id, tasks)
        )

        if (foundTasks.length === 0) {
          return NextResponse.json({
            message: `У сотрудника <u:${employee.id}> сейчас нет задач.`,
          })
        }

        return NextResponse.json({
          message:
            `Задачи сотрудника <u:${employee.id}>:\n` +
            foundTasks.map(buildTaskLine).join("\n"),
        })
      }
    }

    // 3) "все текущие задачи", "активные задачи"
    if (
      q.includes("все текущие задачи") ||
      q.includes("все активные задачи") ||
      q === "текущие задачи" ||
      q === "активные задачи" ||
      q.includes("какие сейчас задачи")
    ) {
      const activeTasks = sortByNearestDeadline(
        tasks.filter((task) => !task.is_completed)
      )

      if (activeTasks.length === 0) {
        return NextResponse.json({ message: "Сейчас нет активных задач." })
      }

      return NextResponse.json({
        message:
          `Текущие задачи:\n` +
          activeTasks.slice(0, 10).map(buildTaskLine).join("\n"),
      })
    }

    // 4) "ближайшие активности", "ближайшие мероприятия"
    if (
      q.includes("ближайшие активности") ||
      q.includes("ближайшие мероприятия") ||
      q.includes("ближайшие события") ||
      q === "активности" ||
      q === "мероприятия"
    ) {
      const upcomingEvents = sortByNearestEvent(events)

      if (upcomingEvents.length === 0) {
        return NextResponse.json({ message: "Мероприятия не найдены." })
      }

      return NextResponse.json({
        message:
          `Ближайшие активности:\n` +
          upcomingEvents.slice(0, 10).map(buildEventLine).join("\n"),
      })
    }

    // 5) "задачи с самым ближайшим дедлайном"
    if (
      q.includes("ближайшим дедлайном") ||
      q.includes("самый близкий дедлайн") ||
      q.includes("ближайший дедлайн") ||
      q.includes("срочные задачи")
    ) {
      const activeTasks = sortByNearestDeadline(
        tasks.filter((task) => !task.is_completed)
      )

      if (activeTasks.length === 0) {
        return NextResponse.json({ message: "Сейчас нет активных задач." })
      }

      return NextResponse.json({
        message:
          `Задачи с ближайшими дедлайнами:\n` +
          activeTasks.slice(0, 5).map(buildTaskLine).join("\n"),
      })
    }

    // 6) точечный поиск по названию задачи
    if (q.includes("задач")) {
      const matchedTasks = tasks.filter(
        (task) =>
          normalize(task.title).includes(q) ||
          normalize(task.description).includes(q)
      )

      if (matchedTasks.length > 0) {
        return NextResponse.json({
          message:
            `Найдены задачи:\n` +
            sortByNearestDeadline(matchedTasks)
              .slice(0, 10)
              .map(buildTaskLine)
              .join("\n"),
        })
      }
    }

    // 7) точечный поиск по названию мероприятия
    if (
      q.includes("мероприят") ||
      q.includes("событ") ||
      q.includes("активност")
    ) {
      const matchedEvents = events.filter(
        (event) =>
          normalize(event.title).includes(q) ||
          normalize(event.description).includes(q) ||
          normalize(event.location).includes(q)
      )

      if (matchedEvents.length > 0) {
        return NextResponse.json({
          message:
            `Найдены мероприятия:\n` +
            sortByNearestEvent(matchedEvents)
              .slice(0, 10)
              .map(buildEventLine)
              .join("\n"),
        })
      }
    }

    // 8) AI fallback — работает, только если вставлен OPENAI_API_KEY
    if (openai) {
      const compactEmployees = employees.map((e) => ({
        id: e.id,
        name: e.name,
        position: e.position,
        team: e.team,
        department: e.department,
      }))

      const compactTasks = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline,
        status: t.status,
        is_completed: t.is_completed,
        author_id: t.author_id,
        executor_ids: t.executor_ids,
      }))

      const compactEvents = events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
      }))

      const ai = await openai.responses.create({
        model: "gpt-5.2-instant",
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text:
                  "Ты корпоративный помощник по внутренним данным компании. " +
                  "Отвечай только по переданным данным. " +
                  "Если ссылаешься на сотрудника — используй тег <u:ID>. " +
                  "Если ссылаешься на мероприятие — используй тег <e:ID>. " +
                  "Если ссылаешься на задачу — используй тег <t:ID>. " +
                  "Отвечай по-русски, кратко и полезно. " +
                  "Если данных недостаточно, так и скажи.",
              },
              {
                type: "input_text",
                text:
                  `Сотрудники: ${JSON.stringify(compactEmployees)}\n` +
                  `Задачи: ${JSON.stringify(compactTasks)}\n` +
                  `Мероприятия: ${JSON.stringify(compactEvents)}`,
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: message }],
          },
        ],
      })

      const text =
        ai.output_text?.trim() ||
        "Не смог сформировать ответ по имеющимся данным."

      return NextResponse.json({ message: text })
    }

    return NextResponse.json({
      message:
        "Я могу помочь найти сотрудника, показать задачи, ближайшие активности и дедлайны. " +
        "Для более свободных вопросов позже можно добавить OPENAI_API_KEY.",
    })
  } catch (error) {
    console.error("Chat route error:", error)

    return NextResponse.json(
      {
        message:
          "Извините, произошла ошибка при обработке запроса. Проверьте backend и настройки API.",
      },
      { status: 500 }
    )
  }
}