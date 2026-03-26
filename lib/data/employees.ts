import { apiFetch } from "@/lib/api/client"

type EmployeeApi = {
  id: number
  name: string
  position: string
  team: string
  department: string
  gender: string
  manager: string
  messenger: string
  photo: string
  birth_date?: string | null
  projects?: { project_name: string }[]
  hobbies?: { hobby_name: string }[]
}

export type Employee = {
  id: number
  name: string
  position: string
  team: string
  department: string
  gender: string
  manager: string
  messenger: string
  photo: string
  birthDate?: string
  projects: string[]
  hobbies: string[]
}

function normalizeInitials(value: string): string {
  return value.replace(/\s+/g, "").replace(/\./g, "").toLowerCase()
}

function mapEmployee(apiEmployee: EmployeeApi): Employee {
  return {
    id: apiEmployee.id,
    name: apiEmployee.name,
    position: apiEmployee.position,
    team: apiEmployee.team,
    department: apiEmployee.department,
    gender: apiEmployee.gender,
    manager: apiEmployee.manager,
    messenger: apiEmployee.messenger,
    photo: apiEmployee.photo,
    birthDate: apiEmployee.birth_date || undefined,
    projects: (apiEmployee.projects || []).map((project) => project.project_name),
    hobbies: (apiEmployee.hobbies || []).map((hobby) => hobby.hobby_name),
  }
}

export const getEmployees = async (): Promise<Employee[]> => {
  const data = await apiFetch<EmployeeApi[]>("/employees/")
  return data.map(mapEmployee)
}

export const getEmployeeById = async (id: number): Promise<Employee | undefined> => {
  try {
    const data = await apiFetch<EmployeeApi>(`/employees/${id}`)
    return mapEmployee(data)
  } catch {
    return undefined
  }
}

export const getEmployeeByName = async (name: string): Promise<Employee | undefined> => {
  const employees = await getEmployees()

  let employee = employees.find((emp) => emp.name === name)
  if (employee) {
    return employee
  }

  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    const lastName = parts[0]
    const initials = normalizeInitials(parts.slice(1).join(""))

    employee = employees.find((emp) => {
      const empParts = emp.name.split(" ")
      if (empParts.length < 3) {
        return false
      }

      const empLastName = empParts[0]
      const empInitials = normalizeInitials(
        `${empParts[1][0]}.${empParts[2][0]}.`
      )

      return empLastName === lastName && empInitials === initials
    })
  }

  return employee
}

export const searchEmployees = async (
  query: string,
  project?: string
): Promise<Employee[]> => {
  let employees: Employee[]

  if (!query.trim()) {
    employees = await getEmployees()
  } else {
    const data = await apiFetch<EmployeeApi[]>(
      `/employees/search?q=${encodeURIComponent(query)}`
    )
    employees = data.map(mapEmployee)
  }

  if (project && project !== "all") {
    employees = employees.filter((employee) =>
      employee.projects.includes(project)
    )
  }

  return employees
}

export const getEmployeesByHobby = async (hobby: string): Promise<Employee[]> => {
  const employees = await getEmployees()

  return employees.filter((employee) =>
    employee.hobbies.some((item) =>
      item.toLowerCase().includes(hobby.toLowerCase())
    )
  )
}

export const getHobbies = async (): Promise<string[]> => {
  const employees = await getEmployees()
  const allHobbies = employees.flatMap((employee) => employee.hobbies)
  return Array.from(new Set(allHobbies))
}

export const getProjects = async (): Promise<string[]> => {
  const employees = await getEmployees()
  const allProjects = employees.flatMap((employee) => employee.projects)
  return Array.from(new Set(allProjects))
}