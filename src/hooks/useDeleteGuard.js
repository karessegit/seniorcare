// Diese Datei verwaltet Loesch-Bestaetigungen ueber einen Dialog.
// Autor: Wilfred Feyem
import { useRef, useState } from 'react'

export function useDeleteGuard() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Endgueltig loeschen',
    cancelLabel: 'Abbrechen',
  })
  const confirmActionRef = useRef(null)
  const errorHandlerRef = useRef(null)

  const resetDeleteGuard = () => {
    setDialogState((current) => ({ ...current, isOpen: false }))
    confirmActionRef.current = null
    errorHandlerRef.current = null
  }

  const isDeletePending = () => false

  const requestDelete = async ({
    title = 'Loeschen bestaetigen',
    message,
    confirmLabel = 'Endgueltig loeschen',
    cancelLabel = 'Abbrechen',
    onConfirm,
    onError,
  }) => {
    confirmActionRef.current = onConfirm
    errorHandlerRef.current = onError || null
    setDialogState({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
    })
    return false
  }

  const cancelDeleteDialog = () => {
    resetDeleteGuard()
  }

  const confirmDeleteDialog = async () => {
    const confirmAction = confirmActionRef.current
    const handleError = errorHandlerRef.current
    resetDeleteGuard()

    if (!confirmAction) return

    try {
      await confirmAction()
    } catch (error) {
      if (handleError) {
        handleError(error)
      }
    }
  }

  return {
    requestDelete,
    isDeletePending,
    resetDeleteGuard,
    dialogProps: {
      ...dialogState,
      onCancel: cancelDeleteDialog,
      onConfirm: confirmDeleteDialog,
    },
  }
}
