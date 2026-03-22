import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuth from '../hooks/useAuth'

const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      toast.error(message)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>DevBoard</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
              type="text"
              placeholder="John Doe"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
            {errors.name && <span style={styles.error}>{errors.name.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <input
              style={{ ...styles.input, ...(errors.confirm ? styles.inputError : {}) }}
              type="password"
              placeholder="••••••••"
              {...register('confirm', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === password || 'Passwords do not match',
              })}
            />
            {errors.confirm && <span style={styles.error}>{errors.confirm.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...styles.btn, ...(isSubmitting ? styles.btnDisabled : {}) }}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'#f8f9fa' },
  card: { background:'#fff',borderRadius:'12px',border:'1px solid #e5e7eb',padding:'2rem',width:'100%',maxWidth:'400px' },
  header: { marginBottom:'1.75rem',textAlign:'center' },
  title: { fontSize:'24px',fontWeight:'700',color:'#1a1a2e',marginBottom:'4px' },
  subtitle: { fontSize:'14px',color:'#6b7280' },
  form: { display:'flex',flexDirection:'column',gap:'1.25rem' },
  field: { display:'flex',flexDirection:'column',gap:'6px' },
  label: { fontSize:'13px',fontWeight:'500',color:'#374151' },
  input: { padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',outline:'none' },
  inputError: { borderColor:'#ef4444' },
  error: { fontSize:'12px',color:'#ef4444' },
  btn: { marginTop:'0.5rem',padding:'11px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer' },
  btnDisabled: { background:'#93c5fd',cursor:'not-allowed' },
  footer: { marginTop:'1.5rem',textAlign:'center',fontSize:'13px',color:'#6b7280' },
  link: { color:'#2563eb',textDecoration:'none',fontWeight:'500' },
}

export default RegisterPage