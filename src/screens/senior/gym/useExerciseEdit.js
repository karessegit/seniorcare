// Diese Datei verwaltet das Bearbeiten von Uebungen.
// Autor: Wilfred Feyem
import { useEffect, useRef, useState } from 'react'

export function useExerciseEdit() {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (!showForm) return
    // Wenn ein Formular geoeffnet wird, springt die Ansicht direkt dorthin.
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editId, showForm])

  const toggleNewForm = () => {
    setShowForm((value) => !value)
    setEditId(null)
  }

  const startEdit = (id) => {
    setEditId(id)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
  }

  return {
    showForm,
    editId,
    formRef,
    toggleNewForm,
    startEdit,
    closeForm,
  }
}
