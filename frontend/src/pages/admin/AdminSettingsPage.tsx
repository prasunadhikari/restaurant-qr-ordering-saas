import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import { changeAdminPassword } from "../../services/adminService";
import { clearAdminSession } from "../../services/authSession";

function AdminSettingsPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      await changeAdminPassword(currentPassword, newPassword);

      setSuccess(
        "Password changed successfully. Please sign in again with your new password.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        clearAdminSession();
        navigate("/admin/login", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to change admin password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f7f5ef] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            System
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Admin Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your platform administrator security settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Change Admin Password
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Update the password used to access the Aagan platform
                  administration panel.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <PasswordField
                id="admin-current-password"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrent}
                onToggle={() => setShowCurrent((value) => !value)}
                autoComplete="current-password"
              />

              <PasswordField
                id="admin-new-password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                onToggle={() => setShowNew((value) => !value)}
                autoComplete="new-password"
              />

              <PasswordField
                id="admin-confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                onToggle={() => setShowConfirm((value) => !value)}
                autoComplete="new-password"
              />

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <Button type="submit" disabled={saving}>
                  {saving ? "Changing password..." : "Change password"}
                </Button>
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={21} />
            </div>

            <h2 className="text-base font-semibold text-slate-950">
              Admin security
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-500">
              <p>
                Your password is stored securely as a hash and cannot be
                viewed from the dashboard.
              </p>

              <p>
                After changing your password, your current admin session will
                be ended and you will need to sign in again.
              </p>

              <p>
                Use a unique password that you do not reuse for other
                accounts.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          required
          minLength={label === "New password" ? 6 : undefined}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          placeholder="Enter password"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default AdminSettingsPage; 