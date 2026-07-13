import { useState } from "react";

export default function RollbackPanel({ canManage, hasRelease, onRollback }) {
  const [reason, setReason] = useState("");

  function submit(event) {
    event.preventDefault();
    onRollback(reason || "Manual rollback requested.");
    setReason("");
  }

  return (
    <section className="panel">
      <h2>Rollback</h2>
      {canManage ? (
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Reason</span>
            <textarea onChange={(event) => setReason(event.target.value)} value={reason} />
          </label>
          <button className="danger-button" disabled={!hasRelease} type="submit">Rollback</button>
        </form>
      ) : (
        <p className="muted">Readonly users cannot rollback deployments.</p>
      )}
    </section>
  );
}
