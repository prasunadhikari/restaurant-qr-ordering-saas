import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createRestaurantStaff,
  deleteRestaurantStaff,
  getRestaurantStaff,
  updateRestaurantStaff,
  type RestaurantStaffMember,
} from "../../services/restaurantDashboardService";

function StaffManagementPage() {
  const [staff, setStaff] = useState<RestaurantStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantStaffMember | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;
    getRestaurantStaff()
      .then((members) => {
        if (active) {
          setStaff(members);
        }
      })
      .catch((cause: unknown) => {
        console.error("Failed to load restaurant staff:", cause);
        if (active) {
          setError(cause instanceof Error ? cause.message : "Unable to load staff.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const resetForm = () => {
    setFormOpen(false);
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const startCreate = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setFormOpen(true);
  };

  const startEdit = (member: RestaurantStaffMember) => {
    setEditing(member);
    setName(member.name);
    setEmail(member.email);
    setPassword("");
    setError("");
    setFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        const updated = await updateRestaurantStaff(editing._id, {
          name: name.trim(),
          email: email.trim(),
          ...(password ? { password } : {}),
        });
        setStaff((current) =>
          current.map((member) => member._id === updated._id ? updated : member),
        );
      } else {
        const created = await createRestaurantStaff({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        setStaff((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      resetForm();
    } catch (cause) {
      console.error("Failed to save staff account:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to save staff account.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (member: RestaurantStaffMember) => {
    if (!window.confirm(`Remove ${member.name}'s staff access? They will no longer be able to sign in.`)) {
      return;
    }
    setBusyId(member._id);
    setError("");
    try {
      await deleteRestaurantStaff(member._id);
      setStaff((current) => current.filter((entry) => entry._id !== member._id));
      if (editing?._id === member._id) resetForm();
    } catch (cause) {
      console.error("Failed to remove staff account:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to remove staff account.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Restaurant team</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Staff accounts</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Create staff accounts with real contact emails; each account receives a separate login ID.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={startCreate}>
            <Plus size={17} /> Add staff member
          </Button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {formOpen && (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? "Update staff account" : "Create staff account"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Staff sign in at <span className="font-semibold text-slate-700">/staff/login</span> with their generated login ID and password.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              aria-label="Close staff form"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              id="staff-name"
              label="Full name"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
            />
            <Input
              id="staff-email"
              label="Contact email address"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                id="staff-password"
                label={editing ? "New password (optional)" : "Temporary password"}
                type="password"
                required={!editing}
                minLength={editing ? undefined : 6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={editing ? "Leave blank to keep the current password" : "At least 6 characters"}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                <KeyRound size={16} />
                {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section aria-labelledby="staff-list-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="staff-list-heading" className="text-lg font-bold text-slate-900">
            Your team
          </h2>
          {!loading && (
            <span className="text-sm text-slate-500">
              {staff.length} {staff.length === 1 ? "member" : "members"}
            </span>
          )}
        </div>

        {loading ? (
          <Card><p className="text-sm text-slate-500">Loading staff accounts…</p></Card>
        ) : staff.length === 0 ? (
          <Card className="py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <UserRound size={22} />
            </span>
            <h3 className="mt-4 font-bold text-slate-900">No staff accounts yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Add your first team member so they can receive and update restaurant orders.
            </p>
            {!formOpen && (
              <Button className="mt-5" onClick={startCreate}>
                <Plus size={17} /> Add staff member
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <Card key={member._id} padding="sm" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserRound size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{member.name}</p>
                    <p className="truncate text-sm text-slate-500">Contact: {member.email}</p>
                    <p className="truncate text-xs font-semibold text-[#173b32]">Login ID: {member.loginAlias || member.email}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Added {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(member)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={busyId === member._id}
                    onClick={() => void remove(member)}
                  >
                    <Trash2 size={14} /> {busyId === member._id ? "Removing…" : "Remove"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffManagementPage;
