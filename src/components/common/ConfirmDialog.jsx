/**
 * Confirm dialog component for delete actions and destructive operations.
 * Shows a modal overlay with cancel and confirm buttons.
 */
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
