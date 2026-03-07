/**
 * Loading spinner component displayed during async data fetching.
 */
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
