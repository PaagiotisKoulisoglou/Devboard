import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useGetTasksQuery,
  useCreateTaskMutation,
} from '../store/services/taskApi'
import KanbanBoard from '../components/kanban/KanBanBoard'

const PRIORITIES = ['low', 'medium', 'high']

const DashboardPage = () => {
  const { user, logout } = useAuth()

  // RTK Query — replaces useState + useEffect + manual fetch
  const { data: tasks = [], isLoading, isError } = useGetTasksQuery()
  const [createTask, { isLoading: isCreating }]  = useCreateTaskMutation()

  const [form, setForm] = useState({
    title:       '',
    description: '',
    priority:    'medium',
    dueDate:     '',
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    try {
      await createTask({
        title:       form.title,
        description: form.description,
        priority:    form.priority,
        dueDate:     form.dueDate || undefined,
      }).unwrap()

      setForm({ title: '', description: '', priority: 'medium', dueDate: '' })
      toast.success('Task created')
    } catch {
      toast.error('Failed to create task')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Stats for the header bar
  const stats = {
    total:      tasks.length,
    todo:       tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done:       tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>DevBoard</h1>
          <div style={styles.statPills}>
            <span style={styles.pill}>{stats.total} total</span>
            <span style={{ ...styles.pill, color: '#2563eb' }}>{stats.inProgress} in progress</span>
            <span style={{ ...styles.pill, color: '#059669' }}>{stats.done} done</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Create task form */}
        <form onSubmit={handleCreate} style={styles.createForm}>
          <input
            style={styles.titleInput}
            type="text"
            placeholder="Task title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            style={styles.descInput}
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            style={styles.select}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)} priority
              </option>
            ))}
          </select>
          <input
            style={styles.dateInput}
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <button
            type="submit"
            disabled={isCreating || !form.title.trim()}
            style={styles.createBtn}
          >
            {isCreating ? 'Adding...' : '+ Add task'}
          </button>
        </form>

        {/* Kanban board */}
        {isLoading ? (
          <div style={styles.center}>Loading your tasks...</div>
        ) : isError ? (
          <div style={styles.center}>Failed to load tasks. Please refresh.</div>
        ) : (
          <KanbanBoard tasks={tasks} />
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', background:'#f3f4f6' },
  header: {
    background:'#fff', borderBottom:'1px solid #e5e7eb',
    padding:'0 2rem', height:'60px',
    display:'flex', alignItems:'center', justifyContent:'space-between',
  },
  headerLeft: { display:'flex', alignItems:'center', gap:'20px' },
  logo: { fontSize:'18px', fontWeight:'700', color:'#111827' },
  statPills: { display:'flex', gap:'10px' },
  pill: { fontSize:'12px', fontWeight:'500', color:'#6b7280', background:'#f9fafb', border:'1px solid #e5e7eb', padding:'3px 10px', borderRadius:'20px' },
  headerRight: { display:'flex', alignItems:'center', gap:'12px' },
  userName: { fontSize:'13px', color:'#6b7280' },
  logoutBtn: { padding:'6px 14px', border:'1px solid #e5e7eb', borderRadius:'6px', background:'transparent', fontSize:'13px', cursor:'pointer', color:'#374151' },
  main: { maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' },
  createForm: {
    display:'flex', flexWrap:'wrap', gap:'10px',
    background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px',
    padding:'16px', marginBottom:'24px', alignItems:'center',
  },
  titleInput: { flex:'2', minWidth:'200px', padding:'9px 13px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', outline:'none' },
  descInput: { flex:'2', minWidth:'180px', padding:'9px 13px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', outline:'none' },
  select: { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', background:'#fff', outline:'none', cursor:'pointer' },
  dateInput: { padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', outline:'none', color:'#374151' },
  createBtn: { padding:'9px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  center: { textAlign:'center', padding:'4rem', color:'#9ca3af', fontSize:'14px' },
}

export default DashboardPage