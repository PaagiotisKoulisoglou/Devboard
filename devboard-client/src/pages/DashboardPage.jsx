import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import api from '../api/axios'

const DashboardPage = () => {
  const { user, logout }       = useAuth()
  const [tasks, setTasks]      = useState([])
  const [loading, setLoading]  = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks')
        setTasks(data.data)
      } catch {
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setCreating(true)
    try {
      const { data } = await api.post('/tasks', { title: newTitle })
      setTasks((prev) => [data.data, ...prev]) 
      setNewTitle('')
      toast.success('Task created')
    } catch {
      toast.error('Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    )
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
    } catch {
      toast.error('Failed to update task')
      const { data } = await api.get('/tasks')
      setTasks(data.data)
    }
  }

  const handleDelete = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId)) 
    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
      const { data } = await api.get('/tasks')
      setTasks(data.data)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
  }

  const statusColors = {
    'todo':        { bg: '#f3f4f6', color: '#374151' },
    'in-progress': { bg: '#dbeafe', color: '#1e40af' },
    'done':        { bg: '#d1fae5', color: '#065f46' },
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>DevBoard</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>Hi, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>My Tasks</h2>
          <span style={styles.taskCount}>{tasks.length} tasks</span>
        </div>

        {/* Create task form */}
        <form onSubmit={handleCreate} style={styles.createForm}>
          <input
            style={styles.createInput}
            type="text"
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            style={styles.createBtn}
          >
            {creating ? 'Adding...' : '+ Add task'}
          </button>
        </form>

        {/* Task list */}
        {loading ? (
          <p style={styles.loadingText}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>
            <p>No tasks yet. Create your first one above.</p>
          </div>
        ) : (
          <ul style={styles.taskList}>
            {tasks.map((task) => (
              <li key={task._id} style={styles.taskItem}>
                <div style={styles.taskLeft}>
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() =>
                      handleStatusChange(
                        task._id,
                        task.status === 'done' ? 'todo' : 'done'
                      )
                    }
                    style={styles.checkbox}
                  />
                  <span
                    style={{
                      ...styles.taskTitle,
                      ...(task.status === 'done' ? styles.taskDone : {}),
                    }}
                  >
                    {task.title}
                  </span>
                </div>

                <div style={styles.taskRight}>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      background: statusColors[task.status]?.bg,
                      color: statusColors[task.status]?.color,
                    }}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    onClick={() => handleDelete(task._id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh',background:'#f8f9fa' },
  header: { background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 2rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between' },
  logo: { fontSize:'18px',fontWeight:'700',color:'#1a1a2e' },
  headerRight: { display:'flex',alignItems:'center',gap:'1rem' },
  userName: { fontSize:'14px',color:'#6b7280' },
  logoutBtn: { padding:'6px 14px',border:'1px solid #e5e7eb',borderRadius:'6px',background:'transparent',fontSize:'13px',cursor:'pointer',color:'#374151' },
  main: { maxWidth:'700px',margin:'0 auto',padding:'2rem 1rem' },
  topBar: { display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem' },
  pageTitle: { fontSize:'20px',fontWeight:'700',color:'#1a1a2e' },
  taskCount: { fontSize:'13px',color:'#6b7280',background:'#f3f4f6',padding:'3px 10px',borderRadius:'20px' },
  createForm: { display:'flex',gap:'10px',marginBottom:'1.5rem' },
  createInput: { flex:1,padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',outline:'none' },
  createBtn: { padding:'10px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap' },
  loadingText: { color:'#9ca3af',fontSize:'14px',textAlign:'center',padding:'3rem 0' },
  empty: { textAlign:'center',padding:'3rem 0',color:'#9ca3af',fontSize:'14px' },
  taskList: { listStyle:'none',display:'flex',flexDirection:'column',gap:'8px' },
  taskItem: { background:'#fff',border:'1px solid #e5e7eb',borderRadius:'10px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px' },
  taskLeft: { display:'flex',alignItems:'center',gap:'12px',flex:1,minWidth:0 },
  checkbox: { width:'16px',height:'16px',cursor:'pointer',flexShrink:0 },
  taskTitle: { fontSize:'14px',color:'#1a1a2e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' },
  taskDone: { textDecoration:'line-through',color:'#9ca3af' },
  taskRight: { display:'flex',alignItems:'center',gap:'8px',flexShrink:0 },
  statusSelect: { padding:'4px 8px',border:'1px solid transparent',borderRadius:'6px',fontSize:'12px',fontWeight:'500',cursor:'pointer',outline:'none' },
  deleteBtn: { padding:'4px 10px',border:'1px solid #fecaca',borderRadius:'6px',background:'transparent',color:'#ef4444',fontSize:'12px',cursor:'pointer' },
}

export default DashboardPage