import { useEffect, useState } from "react";
import { Search, UsersRound } from "lucide-react";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { getAdminUsers, type AdminUser } from "../../services/adminService";

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((cause: unknown) => {
        console.error("Failed to load platform users:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = users.filter((user) => {
    const restaurant =
      user.restaurantId && typeof user.restaurantId !== "string"
        ? user.restaurantId.name
        : "";
    const search = query.trim().toLowerCase();
    const matchesQuery =
      !search ||
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      restaurant.toLowerCase().includes(search);
    return matchesQuery && (role === "all" || user.role === role);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Platform management</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Users</h2>
        <p className="mt-2 text-sm text-slate-500">Restaurant owners, managers, and staff accounts linked to the platform.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <Card padding="none">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input id="admin-user-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, restaurant" className="pl-9" />
          </div>
          <select aria-label="Filter users by role" value={role} onChange={(event) => setRole(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="all">All account types</option>
            <option value="restaurant_owner">Owners</option>
            <option value="restaurant_manager">Managers</option>
            <option value="restaurant_staff">Staff</option>
          </select>
        </div>
        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">Loading users…</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UsersRound size={26} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">No matching users</p>
            <p className="mt-1 text-sm text-slate-500">Restaurant accounts will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Restaurant</th><th className="px-5 py-3">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => {
                  const restaurant = user.restaurantId && typeof user.restaurantId !== "string" ? user.restaurantId : null;
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4"><Badge variant={user.role === "restaurant_owner" ? "info" : user.role === "restaurant_manager" ? "warning" : "default"}>{user.role === "restaurant_owner" ? "Owner" : user.role === "restaurant_manager" ? "Manager" : "Staff"}</Badge></td>
                      <td className="px-5 py-4 text-sm text-slate-700">{restaurant?.name ?? "Not assigned"}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">{filtered.length} of {users.length} accounts</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminUsersPage;
