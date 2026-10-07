import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Plus, Trash2, UserRound } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createRestaurantManager,
  deleteRestaurantManager,
  getRestaurantManagers,
  getRestaurantSettings,
  type RestaurantManagerMember,
} from "../../services/restaurantDashboardService";

const buildCafeEmail = (personName: string, cafeName: string) => {
  const person = personName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  const cafe = cafeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  const localPart = person || "manager";
  const cafeTag = cafe || "cafe";

  return `${localPart}+${cafeTag}@gmail.com`;
};

function ManagerManagementPage() {
  const [managers, setManagers] = useState<RestaurantManagerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    getRestaurantSettings().then((settings) => setRestaurantName(settings.name)).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    getRestaurantManagers().then((data) => { if (active) setManagers(data); })
      .catch((cause: unknown) => {
        console.error("Failed to load restaurant managers:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load managers.");
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!value.trim() || !restaurantName.trim()) {
      return;
    }
    setEmail((currentEmail) => {
      if (!currentEmail || currentEmail === buildCafeEmail(value, restaurantName)) {
        return buildCafeEmail(value, restaurantName);
      }
      return currentEmail;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const manager = await createRestaurantManager({ name: name.trim(), email: email.trim(), password });
      setManagers((current) => [...current, manager].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setEmail("");
      setPassword("");
    } catch (cause) {
      console.error("Failed to create restaurant manager:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to create manager.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (manager: RestaurantManagerMember) => {
    if (!window.confirm(`Remove ${manager.name}'s Manager access?`)) return;
    setError("");
    try {
      await deleteRestaurantManager(manager._id);
      setManagers((current) => current.filter((entry) => entry._id !== manager._id));
    } catch (cause) {
      console.error("Failed to remove restaurant manager:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to remove manager.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header><p className="text-sm text-slate-500">Restaurant team</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Manager accounts</h1><p className="mt-1 text-sm text-slate-500">Managers can run daily restaurant operations, but cannot change owner or subscription settings.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <Card>
        <h2 className="font-semibold">Create manager account</h2>
        <p className="mt-1 text-sm text-slate-500">Share these sign-in details directly with your manager. Manager sign-in is at /manager/login.</p>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input id="manager-account-name" label="Full name" required autoComplete="name" value={name} onChange={(event) => handleNameChange(event.target.value)} />
          <Input id="manager-account-email" label="Email address" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input id="manager-account-password" label="Temporary password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <div className="self-end"><Button type="submit" disabled={saving}><Plus size={16} />{saving ? "Creating…" : "Create manager"}</Button></div>
        </form>
      </Card>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Managers</h2><span className="text-sm text-slate-500">{managers.length} accounts</span></div>
        {loading ? <Card><p className="text-sm text-slate-500">Loading managers…</p></Card> : managers.length === 0 ? (
          <Card className="py-10 text-center"><UserRound className="mx-auto text-slate-300" size={26} /><h3 className="mt-3 font-semibold">No managers yet</h3><p className="mt-1 text-sm text-slate-500">Create a manager to delegate restaurant operations.</p></Card>
        ) : <div className="space-y-2">{managers.map((manager) => <Card key={manager._id} padding="sm" className="flex flex-wrap items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><UserRound size={19} /></span><div className="min-w-0 flex-1"><p className="font-semibold">{manager.name}</p><p className="text-xs text-slate-500">{manager.email}</p></div><button type="button" onClick={() => void remove(manager)} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 size={14} /> Remove</button></Card>)}</div>}
      </section>
      <Card className="flex gap-3 bg-amber-50/60"><KeyRound className="mt-0.5 shrink-0 text-amber-700" size={17} /><p className="text-sm leading-6 text-slate-600">Managers can manage orders, menu availability, tables, payments, and bills only for this restaurant. They cannot create staff or manager accounts.</p></Card>
    </div>
  );
}

export default ManagerManagementPage;
