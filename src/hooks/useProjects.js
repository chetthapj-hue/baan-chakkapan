import { useCallback, useState } from 'react'
import {
  deleteProject,
  getProjects,
  saveProject,
  togglePublishStatus,
} from '../services/projectService'

export const useProjects = () => {
  const [projects, setProjects] = useState(() => getProjects())

  const refresh = useCallback(() => {
    setProjects(getProjects())
  }, [])

  return {
    projects,
    refresh,
    save: (project) => {
      const savedProject = saveProject(project)
      refresh()
      return savedProject
    },
    remove: (id) => {
      deleteProject(id)
      refresh()
    },
    togglePublish: (id) => {
      const updatedProject = togglePublishStatus(id)
      refresh()
      return updatedProject
    },
  }
}


