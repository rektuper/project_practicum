"use client"

import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, CalendarIcon, Clock, MapPin } from "lucide-react"
import { getEmployeeById } from "@/lib/data/employees"
import { getEventById } from "@/lib/data/events"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserCard } from "@/components/ui/user-card"
import type { Employee } from "@/lib/data/employees"
import type { Event as CompanyEvent } from "@/lib/data/events"
import { getTaskById } from "@/lib/data/tasks"
import type { Task } from "@/lib/data/tasks"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type EntityReference = {
  type: "user" | "event" | "task"
  id: number
  fullMatch: string
  entity?: Employee | CompanyEvent | Task
  name?: string
}

const EventCard = ({ event }: { event: CompanyEvent }) => {
  const formatDate = (dateValue: string): string => {
    const date = new Date(dateValue)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="p-6 relative">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{event.time || "—"}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        )}
        <div>
          <p className="mb-1 font-medium">Описание:</p>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
      </div>
    </div>
  )
}

const MessageContent = memo(
  ({ content, messageId }: { content: string; messageId: string }) => {
    const [elements, setElements] = useState<React.ReactNode[]>([
      <div key="loading" className="whitespace-pre-line text-sm md:text-base">
        {content}
      </div>,
    ])

    useEffect(() => {
      let isMounted = true

      const parseEntityReferences = async (
        text: string
      ): Promise<EntityReference[]> => {
        const userPattern = /<u:(\d+)>/g
        const eventPattern = /<e:(\d+)>/g
        const taskPattern = /<t:(\d+)>/g

        const entityReferences: EntityReference[] = []

        let match: RegExpExecArray | null

        while ((match = userPattern.exec(text)) !== null) {
          const id = Number(match[1])
          const fullMatch = match[0]
          const employee = await getEmployeeById(id)

          entityReferences.push({
            type: "user",
            id,
            fullMatch,
            entity: employee,
            name: employee?.name,
          })
        }

        while ((match = eventPattern.exec(text)) !== null) {
          const id = Number(match[1])
          const fullMatch = match[0]
          const event = await getEventById(id)

          entityReferences.push({
            type: "event",
            id,
            fullMatch,
            entity: event,
            name: event?.title,
          })
        }

        while ((match = taskPattern.exec(text)) !== null) {
          const id = Number(match[1])
          const fullMatch = match[0]
          const task = await getTaskById(id)

          entityReferences.push({
            type: "task",
            id,
            fullMatch,
            entity: task,
            name: task?.title,
          })
        }

        entityReferences.sort(
          (a, b) => text.indexOf(a.fullMatch) - text.indexOf(b.fullMatch)
        )

        return entityReferences
      }

      const handleEntityClick = (entity: EntityReference) => {
        if (entity.type === "user" && entity.entity) {
          window.dispatchEvent(
            new CustomEvent("showEmployeeDialog", {
              detail: { employee: entity.entity },
            })
          )
        } else if (entity.type === "event" && entity.entity) {
          window.dispatchEvent(
            new CustomEvent("showEventDialog", {
              detail: { event: entity.entity },
            })
          )
        } else if (entity.type === "task" && entity.entity) {
          window.location.href = `/tasks?taskId=${entity.id}`
        }
      }

      const processEntityReferences = async () => {
        const entityReferences = await parseEntityReferences(content)

        if (!isMounted) return

        if (entityReferences.length === 0) {
          setElements([
            <div
              key={`plain-${messageId}`}
              className="whitespace-pre-line text-sm md:text-base"
            >
              {content}
            </div>,
          ])
          return
        }

        let lastIndex = 0
        const newElements: React.ReactNode[] = []

        entityReferences.forEach((entity, i) => {
          const index = content.indexOf(entity.fullMatch, lastIndex)

          if (index > lastIndex) {
            newElements.push(
              <span key={`text-${messageId}-${i}`}>
                {content.substring(lastIndex, index)}
              </span>
            )
          }

          if (entity.name) {
            newElements.push(
              <button
                key={`entity-${messageId}-${i}`}
                onClick={() => handleEntityClick(entity)}
                className="text-primary underline font-medium"
                type="button"
              >
                {entity.name}
              </button>
            )
          } else {
            newElements.push(
              <button
                key={`entity-${messageId}-${i}`}
                onClick={() => handleEntityClick(entity)}
                className="text-primary underline font-medium"
                type="button"
              >
                {entity.type === "user"
                  ? "Сотрудник"
                  : entity.type === "event"
                    ? "Событие"
                    : "Задача"}{" "}
                #{entity.id}
              </button>
            )
          }

          lastIndex = index + entity.fullMatch.length
        })

        if (lastIndex < content.length) {
          newElements.push(
            <span key={`text-${messageId}-last`}>
              {content.substring(lastIndex)}
            </span>
          )
        }

        setElements(newElements)
      }

      processEntityReferences()

      return () => {
        isMounted = false
      }
    }, [content, messageId])

    return <div className="whitespace-pre-line text-sm md:text-base">{elements}</div>
  }
)

MessageContent.displayName = "MessageContent"

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

export default function ChatbotPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Привет! Я корпоративный бот. Чем могу помочь?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CompanyEvent | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const handleShowEmployee = (evt: globalThis.Event) => {
      const customEvt = evt as CustomEvent<{ employee?: Employee }>
      if (customEvt.detail?.employee) {
        setSelectedEmployee(customEvt.detail.employee)
        setEmployeeDialogOpen(true)
      }
    }

    const handleShowEvent = (evt: globalThis.Event) => {
      const customEvt = evt as CustomEvent<{ event?: CompanyEvent }>
      if (customEvt.detail?.event) {
        setSelectedEvent(customEvt.detail.event)
        setEventDialogOpen(true)
      }
    }

    window.addEventListener("showEmployeeDialog", handleShowEmployee)
    window.addEventListener("showEventDialog", handleShowEvent)

    return () => {
      window.removeEventListener("showEmployeeDialog", handleShowEmployee)
      window.removeEventListener("showEventDialog", handleShowEvent)
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userInput = input

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from API")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || "Извините, не удалось получить ответ.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Чат-бот</h1>

      <Card className="mb-4">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                    <AvatarFallback
                      className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`rounded-lg px-3 py-2 md:px-4 md:py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MessageContent content={message.content} messageId={message.id} />
                    ) : (
                      <div className="whitespace-pre-line text-sm md:text-base">
                        {message.content}
                      </div>
                    )}

                    {isClient && (
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isProcessing}
              className="text-sm md:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing}
              className="flex items-center justify-center"
            >
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Отправить</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && <UserCard employee={selectedEmployee} variant="dialog" />}
        </DialogContent>
      </Dialog>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && <EventCard event={selectedEvent} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}