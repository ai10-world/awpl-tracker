"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

export function VaultModal({
  teamOptions,
  onSave,
  onClose,
}: {
  teamOptions: Array<{ id: string; name: string }>;
  onSave: (data: { name: string; teamId: string | null }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState(teamOptions[0]?.id || "");
  const [error, setError] = useState("");

  function save() {
    if (!name.trim()) {
      setError("Vault name is required");
      return;
    }
    onSave({ name: name.trim(), teamId: teamId || null });
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm">
        <ModalHeader icon={<FolderPlus size={20} />} title="Create Team Vault" onClose={onClose} />
        <div className="p-5 flex flex-col gap-4">
          <Field label="Vault Name *">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. My Dream Team"
              className="form-input"
              autoFocus
            />
          </Field>
          <Field label="Team *">
            <select
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setError("");
              }}
              className="form-input"
            >
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          {error && <p className="text-sm" style={{ color: "var(--red)" }}>{error}</p>}
        </div>
        <ModalFooter onClose={onClose} onSave={save} saveLabel="Create Vault" />
      </div>
    </Overlay>
  );
}

export function DeleteModal({ entryName, onConfirm, onClose }: { entryName: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm text-center">
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "rgba(255,107,107,0.12)" }}>X</div>
          <div>
            <h3 className="font-display font-bold text-lg mb-1">Delete this entry?</h3>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>{entryName}</span> will be permanently removed.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={onConfirm} className="flex-1 btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full flex justify-center">
        <div className="w-full rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border2)", maxWidth: "440px" }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text3); }
        .btn-secondary {
          background: var(--surface2);
          color: var(--text2);
          border: 1px solid var(--border2);
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { color: var(--text); border-color: var(--accent); }
        .btn-danger {
          background: rgba(255,107,107,0.15);
          color: var(--red);
          border: 1px solid rgba(255,107,107,0.3);
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger:hover { background: rgba(255,107,107,0.25); }
        .btn-primary {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

function ModalHeader({ icon, title, onClose }: { icon: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-bg)", color: "var(--accent2)" }}>
        {icon}
      </div>
      <span className="font-display font-bold text-base flex-1">{title}</span>
      <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
        <X size={14} />
      </button>
    </div>
  );
}

function ModalFooter({ onClose, onSave, saveLabel }: { onClose: () => void; onSave: () => void; saveLabel: string }) {
  return (
    <div className="flex gap-3 p-5 border-t" style={{ borderColor: "var(--border)" }}>
      <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      <button onClick={onSave} className="btn-primary flex-1">{saveLabel}</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text2)" }}>{label}</label>
      {children}
    </div>
  );
}
