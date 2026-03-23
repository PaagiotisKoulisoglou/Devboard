import { useUpdateTaskMutation, useDeleteTaskMutation } from '../../store/services/taskApi'
import { toast } from 'react-hot-toast'

const PRIORITY_STYLES = {
  low:    { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  high:   { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const TaskCard = ({ task, isDragging }) => {
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()

  const handleDelete = async () => {
    try {
      await deleteTask(task._id).unwrap()
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handlePriorityChange = async (priority) => {
    try {
      await updateTask({ id: task._id, priority }).unwrap()
    } catch {
      toast.error('Failed to update priority')
    }
  }

  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
  const date = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
    : null
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <div
      style={{
        ...styles.card,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.priority,
            background: p.bg,
            color: p.color,
            border: `1px solid ${p.border}`,
          }}
        >
          {task.priority}
        </span>
        <button onClick={handleDelete} style={styles.deleteBtn} title="Delete task">
          ×
        </button>
      </div>

      <p style={styles.title}>{task.title}</p>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      <div style={styles.cardFooter}>
        {date && (
          <span style={{ ...styles.date, color: isOverdue ? '#ef4444' : '#9ca3af' }}>
            {isOverdue ? '⚠ ' : ''}{date}
          </span>
        )}

        <select
          value={task.priority}
          onChange={(e) => handlePriorityChange(e.target.value)}
          onClick={(e) => e.stopPropagation()} // don't trigger drag
          style={styles.prioritySelect}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '8px',
    transition: 'box-shadow 0.15s',
    userSelect: 'none',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  priority: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    lineHeight: 1,
    color: '#d1d5db',
    cursor: 'pointer',
    padding: '0 2px',
    transition: 'color 0.1s',
  },
  title: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '6px',
    lineHeight: '1.4',
  },
  description: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '10px',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  date: {
    fontSize: '11px',
    fontWeight: '500',
  },
  prioritySelect: {
    fontSize: '11px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '2px 6px',
    background: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    outline: 'none',
  },
}

export default TaskCard