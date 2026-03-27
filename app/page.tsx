"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTasks } from "@/lib/data/tasks"
import { getEmployees } from "@/lib/data/employees"
import { getEvents } from "@/lib/data/events"
import type { Task } from "@/lib/data/tasks"
import type { Employee } from "@/lib/data/employees"
import type { Event } from "@/lib/data/events"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, employeesData, eventsData] = await Promise.all([
          getTasks(),
          getEmployees(),
          getEvents(),
        ])

        setTasks(tasksData)
        setEmployees(employeesData)
        setEvents(eventsData)
      } catch (e) {
        console.error("Ошибка загрузки данных:", e)
      }
    }

    loadData()
  }, [])

  const activeTasks = tasks.filter((t) => !t.isCompleted)
  const completedTasks = tasks.filter((t) => t.isCompleted)

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const nearestTasks = [...activeTasks]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0 space-y-6">
      
      {/* 🔥 HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Добро пожаловать в корпоративный портал
        </h1>
        <p className="text-muted-foreground">
          Управление задачами, сотрудниками и событиями в одном месте
        </p>
      </div>

      {/* 📊 СТАТИСТИКА */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Сотрудники</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Активные задачи</p>
            <p className="text-2xl font-bold">{activeTasks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Завершено</p>
            <p className="text-2xl font-bold">{completedTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* ⚡ БЫСТРАЯ ИНФА */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📌 ЗАДАЧИ */}
        <Card>
          <CardHeader>
            <CardTitle>Ближайшие задачи</CardTitle>
            <CardDescription>С дедлайнами</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearestTasks.length > 0 ? (
              nearestTasks.map((task) => (
                <div key={task.id} className="border p-3 rounded-md">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Дедлайн: {format(new Date(task.deadline), "PPP", { locale: ru })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Нет задач</p>
            )}
          </CardContent>
        </Card>

        {/* 📅 СОБЫТИЯ */}
        <Card>
          <CardHeader>
            <CardTitle>Ближайшие события</CardTitle>
            <CardDescription>Корпоративные активности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="border p-3 rounded-md">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), "PPP", { locale: ru })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Нет событий</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🧠 ПОДСКАЗКИ */}
      <Card>
        <CardHeader>
          <CardTitle>Подсказки</CardTitle>
          <CardDescription>Попробуйте в чат-боте</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>где Петров</Badge>
          <Badge>задачи Петрова</Badge>
          <Badge>все текущие задачи</Badge>
          <Badge>ближайшие события</Badge>
          <Badge>срочные задачи</Badge>
        </CardContent>
      </Card>
    </div>
  )
}