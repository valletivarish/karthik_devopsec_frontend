import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { loginSchema } from '../../utils/validators';

const DEMO_ACCOUNTS = [
  { label: 'Demo User',  username: 'demo',  password: 'demo1234' },
  { label: 'Alice',      username: 'alice', password: 'alice1234' },
  { label: 'Bob',        username: 'bob',   password: 'bob1234' },
];

/**
 * Login form component with real-time validation feedback.
 * Authenticates user credentials and stores JWT token via AuthContext.
 */
function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  /* Handle form submission - calls auth API and stores token on success */
  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data);
      login(response.data);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      /* Display error message from server or generic message */
      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    }
  };

  const fillDemo = (account) => {
    setValue('username', account.username);
    setValue('password', account.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your Meal Planner account</p>

        {/* Demo account quick-fill */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Try a demo account
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc)}
                style={{
                  padding: '6px 14px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '20px',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username" {...register('username')} />
            {errors.username && <p className="error-message">{errors.username.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password" {...register('password')} />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}
            disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-link">
          Do not have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
