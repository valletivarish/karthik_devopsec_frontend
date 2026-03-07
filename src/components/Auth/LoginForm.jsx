import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { loginSchema } from '../../utils/validators';

/**
 * Login form component with real-time validation feedback.
 * Authenticates user credentials and stores JWT token via AuthContext.
 */
function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your Meal Planner account</p>
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
