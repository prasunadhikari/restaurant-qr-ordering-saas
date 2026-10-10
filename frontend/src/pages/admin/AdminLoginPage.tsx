import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";
import { clearAdminSession } from "../../services/authSession";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

const ADMIN_EMAIL = "admin@restaurantos.local";

function AdminLoginPage() {
  const navigate = useNavigate();

  const existingToken = localStorage.getItem("adminToken");

  const [email] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (existingToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<LoginResponse>(
        "/auth/admin/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
      );

      if (response.data.user.role !== "platform_admin") {
        setError(
          "This account does not have platform admin access.",
        );

        return;
      }

      clearAdminSession();
      localStorage.setItem(
        "adminToken",
        response.data.token,
      );
      localStorage.setItem("adminUser", JSON.stringify(response.data.user));

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/20">
              R
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
              Aagan
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Platform Admin Console
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Sign in to admin
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Manage restaurants, users, orders, billing,
                and the platform.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Admin email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="admin-email"
                    type="email"
                    placeholder={ADMIN_EMAIL}
                    value={email}
                    readOnly
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in to Admin"}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-center text-xs leading-5 text-slate-400">
                Authorized platform administrators only.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Aagan · Restaurant platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;