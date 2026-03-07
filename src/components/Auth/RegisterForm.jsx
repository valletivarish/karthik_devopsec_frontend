import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { registerSchema } from '../../utils/validators';

/**
 * Registration form with comprehensive client-side validation.
 * Creates a new user account and auto-logs in on success.
 */
function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await authService.register(data);
      login(response.data);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join the Smart Recipe Meal Planner</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" type="text" className={`form-control ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter your full name" {...register('fullName')} />
            {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username" {...register('username')} />
            {errors.username && <p className="error-message">{errors.username.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email" {...register('email')} />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Create a password (min 6 characters)" {...register('password')} />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}
            disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
