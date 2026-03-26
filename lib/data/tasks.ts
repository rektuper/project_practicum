import { apiFetch } from "@/lib/api/client"

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

export type Task = {
  id: number
  title: string
  description: string
  deadline: string
  status: string
  isCompleted: boolean
  authorId: number
  executorIds: number[]
}

export type TaskCreateInput = {
  title: string
  description: string
  deadline: string
  authorId: number
  executorIds: number[]
  isCompleted?: boolean
}

export type TaskUpdateInput = {
  title: string
  description: string
  deadline: string
  authorId: number
  executorIds: number[]
  isCompleted: boolean
}

type ToggleTaskApi = {
  id: number
  is_completed: boolean
  status: string
}

function mapTask(task: TaskApi): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    deadline: task.deadline,
    status: task.status,
    isCompleted: task.is_completed,
    authorId: task.author_id,
    executorIds: task.executor_ids ?? [],
  }
}

export const getTasks = async (): Promise<Task[]> => {
  const data = await apiFetch<TaskApi[]>("/tasks/")
  return data.map(mapTask)
}

export const getTaskById = async (id: number): Promise<Task | undefined> => {
  try {
    const data = await apiFetch<TaskApi>(`/tasks/${id}`)
    return mapTask(data)
  } catch {
    return undefined
  }
}

export const searchTasks = async (query: string): Promise<Task[]> => {
  if (!query.trim()) {
    return getTasks()
  }

  const data = await apiFetch<TaskApi[]>(
    `/tasks/search?q=${encodeURIComponent(query)}`
  )

  return data.map(mapTask)
}

export const addTask = async (payload: TaskCreateInput): Promise<Task> => {
  const data = await apiFetch<TaskApi>("/tasks/", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline,
      author_id: payload.authorId,
      executor_ids: payload.executorIds,
      is_completed: payload.isCompleted ?? false,
    }),
  })

  return mapTask(data)
}

export const updateTask = async (
  id: number,
  payload: TaskUpdateInput
): Promise<Task> => {
  const data = await apiFetch<TaskApi>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline,
      author_id: payload.authorId,
      executor_ids: payload.executorIds,
      is_completed: payload.isCompleted,
    }),
  })

  return mapTask(data)
}

export const toggleTaskCompleted = async (
  id: number
): Promise<{ id: number; isCompleted: boolean; status: string }> => {
  const data = await apiFetch<ToggleTaskApi>(`/tasks/${id}/toggle`, {
    method: "PATCH",
  })

  return {
    id: data.id,
    isCompleted: data.is_completed,
    status: data.status,
  }
}

export const updateTaskStatus = async (
  id: number,
  isCompleted: boolean
): Promise<Task | undefined> => {
  const task = await getTaskById(id)

  if (!task) {
    return undefined
  }

  return updateTask(id, {
    title: task.title,
    description: task.description,
    deadline: task.deadline,
    authorId: task.authorId,
    executorIds: task.executorIds,
    isCompleted,
  })
}

export const deleteTask = async (id: number): Promise<void> => {
  await apiFetch(`/tasks/${id}`, {
    method: "DELETE",
  })
}