import { useState } from 'react'
import { useUpdateTaskMutation } from '../../store/services/taskApi'
import { toast } from 'react-hot-toast'
import TaskCard from './TaskCard'

const COLUMNS = [
  { id: 'todo',        label: 'Todo',        color: '#6b7280' },
  { id: 'in-progress', label: 'In Progress', color: '#2563eb' },
  { id: 'done',        label: 'Done',        color: '#059669' },
]

const KanbanBoard = ({ tasks }) => {
  const [updateTask]   = useUpdateTaskMutation()
  const [dragging, setDragging] = useState(null)  
  const [dragOver, setDragOver] = useState(null)  

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id)
    return acc
  }, {})

  const handleDragStart = (e, taskId) => {
    setDragging(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()  
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOver(null)

    if (!dragging) return
    const task = tasks.find((t) => t._id === dragging)
    if (!task || task.status === newStatus) {
      setDragging(null)
      return
    }

    try {
      await updateTask({ id: dragging, status: newStatus }).unwrap()
    } catch {
      toast.error('Failed to move task')
    } finally {
      setDragging(null)
    }
  }

  const handleDragEnd = () => {
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div style={styles.board}>
      {COLUMNS.map((col) => {
        const colTasks  = tasksByStatus[col.id] || []
        const isOver    = dragOver === col.id

        return (
          <div
            key={col.id}
            style={{
              ...styles.column,
              background: isOver ? '#f0f9ff' : '#f9fafb',
              borderColor: isOver ? '#93c5fd' : '#e5e7eb',
            }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOver(null)}
          >
            {/* Column header */}
            <div style={styles.colHeader}>
              <div style={styles.colTitleRow}>
                <span
                  style={{ ...styles.colDot, background: col.color }}
                />
                <span style={styles.colTitle}>{col.label}</span>
              </div>
              <span style={styles.colCount}>{colTasks.length}</span>
            </div>

            {/* Task cards */}
            <div style={styles.cardList}>
              {colTasks.length === 0 ? (
                <div style={styles.empty}>
                  Drop tasks here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskCard
                      task={task}
                      isDragging={dragging === task._id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    alignItems: 'start',
  },
  column: {
    borderRadius: '12px',
    border: '2px dashed',
    padding: '14px',
    minHeight: '300px',
    transition: 'background 0.15s, border-color 0.15s',
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  colTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  colTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  colCount: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#9ca3af',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '1px 8px',
  },
  cardList: {
    minHeight: '50px',
  },
  empty: {
    textAlign: 'center',
    padding: '24px 0',
    fontSize: '12px',
    color: '#d1d5db',
    borderRadius: '8px',
  },
}

export default KanbanBoard