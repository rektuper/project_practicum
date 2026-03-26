import { apiFetch } from "@/lib/api/client"

type EventApi = {
  id: number
  title: string
  date: string
  time?: string | null
  location: string
  description: string
}

export type Event = {
  id: number
  title: string
  date: string
  time?: string
  location: string
  description: string
}

export type EventCreateInput = {
  title: string
  date: string
  time?: string
  location: string
  description: string
}

export type EventUpdateInput = {
  title: string
  date: string
  time?: string
  location: string
  description: string
}

function mapEvent(event: EventApi): Event {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time || undefined,
    location: event.location,
    description: event.description,
  }
}

export const getEvents = async (): Promise<Event[]> => {
  const data = await apiFetch<EventApi[]>("/events/")
  return data.map(mapEvent)
}

export const getEventById = async (id: number): Promise<Event | undefined> => {
  try {
    const data = await apiFetch<EventApi>(`/events/${id}`)
    return mapEvent(data)
  } catch {
    return undefined
  }
}

export const searchEvents = async (query: string): Promise<Event[]> => {
  if (!query.trim()) {
    return getEvents()
  }

  const data = await apiFetch<EventApi[]>(
    `/events/search?q=${encodeURIComponent(query)}`
  )

  return data.map(mapEvent)
}

export const addEvent = async (payload: EventCreateInput): Promise<Event> => {
  const data = await apiFetch<EventApi>("/events/", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return mapEvent(data)
}

export const updateEvent = async (
  id: number,
  payload: EventUpdateInput
): Promise<Event> => {
  const data = await apiFetch<EventApi>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  return mapEvent(data)
}

export const deleteEvent = async (id: number): Promise<void> => {
  await apiFetch(`/events/${id}`, {
    method: "DELETE",
  })
}