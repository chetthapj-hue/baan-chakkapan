import { useCallback, useEffect, useState } from 'react'
import {
  deleteProject,
  getProjects,
  saveProject,
  togglePublishStatus,
} from '../services/projectService'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setProjects(await getProjects())
      setError('')
    } catch (nextError) {
      setError(nextError.message)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [refresh])

  return {
    projects,
    loading,
    error,
    refresh,
    save: async (project) => {
      const savedProject = await saveProject(project)
      await refresh()
      return savedProject
    },
    remove: async (id) => {
      await deleteProject(id)
      await refresh()
    },
    togglePublish: async (id) => {
      const updatedProject = await togglePublishStatus(id)
      await refresh()
      return updatedProject
    },
  }
}
