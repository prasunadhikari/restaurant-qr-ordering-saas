import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  UtensilsCrossed,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { apiRequest } from "../../services/api";
import { clearOwnerSession } from "../../services/authSession";

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

function OwnerLoginPage() {
  const navigate = useNavigate();

  const existingToken = localStorage.getItem("ownerToken");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (existingToken) {
    return <Navigate to="/dashboard" replace />;
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
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
      );

      if (response.data.user.role !== "restaurant_owner") {
        setError(
          "This account does not have restaurant owner access.",
        );

        return;
      }

      if (!response.data.user.restaurantId) {
        setError(
          "This owner account is not assigned to a restaurant yet.",
        );

        return;
      }

      clearOwnerSession();
      localStorage.setItem(
        "ownerToken",
        response.data.token,
      );

      localStorage.setItem(
        "ownerUser",
        JSON.stringify(response.data.user),
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Owner login error:", error);

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
    <div className="min-h-screen bg-[#f5f1e8]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#191815] text-[#f5f1e8] shadow-xl">
              <UtensilsCrossed
                size={25}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#191815]">
              Aagan
            </h1>

            <p className="mt-1 text-sm text-[#8b786b]">
              Restaurant Owner Portal
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-3xl border border-[#ded5c7] bg-white p-6 shadow-[0_20px_60px_rgba(25,24,21,0.08)] sm:p-8">
            <div className="mb-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ece3] text-[#9a6248]">
                <UtensilsCrossed
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold text-[#191815]">
                Welcome back
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#756b62]">
                Sign in to manage your restaurant, menu,
                tables, and orders.
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
                  htmlFor="owner-email"
                  className="mb-2 block text-sm font-semibold text-[#403b36]"
                >
                  Login ID or email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a39a91]"
                  />

                  <Input
                    id="owner-email"
                    type="text"
                    placeholder="owner-name or contact email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    className="border-[#ddd4c8] bg-white pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="owner-password"
                  className="mb-2 block text-sm font-semibold text-[#403b36]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a39a91]"
                  />

                  <Input
                    id="owner-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="border-[#ddd4c8] bg-white pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="!bg-[#191815] hover:!bg-[#302d28]"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in to Aagan"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#eee7dd] pt-5">
              <p className="text-center text-xs leading-5 text-[#9b9187]">
                Restaurant owners can manage their
                restaurant from this portal.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#9b9187]">
            Aagan · Where Every Table Welcomes You
          </p>
        </div>
      </div>
    </div>
  );
}

export default OwnerLoginPage;