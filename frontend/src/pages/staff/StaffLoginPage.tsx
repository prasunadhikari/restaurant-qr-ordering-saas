import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, UtensilsCrossed } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      restaurantId?: string | null;
    };
    token: string;
  };
}

function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("staffToken")) {
    return <Navigate to="/staff" replace />;
  }
  if (localStorage.getItem("ownerToken")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (localStorage.getItem("adminToken")) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (response.data.user.role !== "restaurant_staff") {
        setError("This account does not have restaurant staff access.");
        return;
      }
      if (!response.data.user.restaurantId) {
        setError("This staff account is not assigned to a restaurant yet.");
        return;
      }
      localStorage.setItem("staffToken", response.data.token);
      localStorage.setItem("staffUser", JSON.stringify(response.data.user));
      localStorage.removeItem("ownerToken");
      localStorage.removeItem("ownerUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/staff", { replace: true });
    } catch (cause) {
      console.error("Staff login failed:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f5f1] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#173b32] text-white">
            <UtensilsCrossed size={22} />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-semibold">Aagan</h1>
          <p className="mt-1 text-sm text-slate-500">Restaurant Staff Portal</p>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Sign in to your shift</h2>
          <p className="mt-1 text-sm text-slate-500">
            View incoming orders and keep service moving.
          </p>
          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="staff-email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="staff-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="staff@restaurant.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="staff-password" className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="staff-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </section>
        <p className="mt-5 text-center text-xs text-slate-400">
          Aagan · Where Every Table Welcomes You
        </p>
      </div>
    </main>
  );
}

export default StaffLoginPage;
