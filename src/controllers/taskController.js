import Task from '../models/Task.js'

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user.id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
  res.json({ success: true, count: tasks.length, data: tasks })
}

export const getTask = async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    createdBy: req.user.id, 
  }).populate('createdBy', 'name email')

  if (!task) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }
  res.json({ success: true, data: task })
}

export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    createdBy: req.user.id,
  })
  res.status(201).json({ success: true, data: task })
}

export const updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id }, 
    req.body,
    { new: true, runValidators: true }
  )

  if (!task) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }
  res.json({ success: true, data: task })
}

export const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id, 
  })

  if (!task) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }
  res.json({ success: true, message: 'Task deleted' })
}