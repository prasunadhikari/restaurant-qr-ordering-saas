import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Store,
  Users,
  X,
} from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import {
  getAllRestaurants,
  type Restaurant as ApiRestaurant,
} from "../../services/restaurantService";

import { apiRequest } from "../../services/api";

type RestaurantStatus = "Active" | "Pending" | "Suspended";

type RestaurantPlan = "Starter" | "Professional" | "Custom";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  location: string;
  owner: string;
  email: string;
  phone: string;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  joined: string;
};

type CreateRestaurantForm = {
  name: string;
  slug: string;
  phone: string;
  address: string;
  plan: "starter" | "professional" | "custom";
  opening: string;
  closing: string;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapRestaurant(restaurant: ApiRestaurant): Restaurant {
  return {
    id: restaurant._id,
    name: restaurant.name,
    slug: restaurant.slug,
    location: restaurant.address || "No address provided",
    owner: restaurant.ownerId?.name || "No owner assigned",
    email: restaurant.ownerId?.email || "No email available",
    phone: restaurant.phone || "No phone available",
    plan:
      restaurant.plan === "professional"
        ? "Professional"
        : restaurant.plan === "custom"
          ? "Custom"
          : "Starter",
    status:
      restaurant.status === "active"
        ? "Active"
        : restaurant.status === "pending"
          ? "Pending"
          : "Suspended",
    joined: new Date(restaurant.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function statusVariant(status: RestaurantStatus) {
  if (status === "Active") return "success";
  if (status === "Pending") return "warning";
  return "danger";
}

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | RestaurantStatus>("All");

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [form, setForm] = useState<CreateRestaurantForm>({
    name: "",
    slug: "",
    phone: "",
    address: "",
    plan: "starter",
    opening: "09:00",
    closing: "22:00",
  });

  const loadRestaurants = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAllRestaurants();

      setRestaurants(data.map(mapRestaurant));
    } catch (loadError) {
      console.error("Failed to load restaurants:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load restaurants",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadRestaurants(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadRestaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !query ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.slug.toLowerCase().includes(query) ||
        restaurant.location.toLowerCase().includes(query) ||
        restaurant.owner.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || restaurant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  const activeCount = restaurants.filter(
    (restaurant) => restaurant.status === "Active",
  ).length;

  const pendingCount = restaurants.filter(
    (restaurant) => restaurant.status === "Pending",
  ).length;

  const suspendedCount = restaurants.filter(
    (restaurant) => restaurant.status === "Suspended",
  ).length;

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      phone: "",
      address: "",
      plan: "starter",
      opening: "09:00",
      closing: "22:00",
    });

    setCreateError("");
    setCreateSuccess("");
  };

  const closeCreateModal = () => {
    if (creatingRestaurant) return;

    setShowAddRestaurant(false);
    resetForm();
  };

  const handleCreateRestaurant = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    const name = form.name.trim();
    const slug = createSlug(form.slug || form.name);

    if (!name) {
      setCreateError("Restaurant name is required.");
      return;
    }

    if (!slug) {
      setCreateError("A valid restaurant slug is required.");
      return;
    }

    try {
      setCreatingRestaurant(true);

      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error("Admin session expired. Please log in again.");
      }

      await apiRequest("/restaurants/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name,
          slug,
          phone: form.phone.trim(),
          address: form.address.trim(),
          plan: form.plan,
          openingHours: {
            open: form.opening,
            close: form.closing,
          },
        }),
      });

      await loadRestaurants();

      setCreateSuccess("Restaurant created successfully.");

      window.setTimeout(() => {
        setShowAddRestaurant(false);
        resetForm();
      }, 700);
    } catch (createError) {
      console.error("Failed to create restaurant:", createError);

      setCreateError(
        createError instanceof Error
          ? createError.message
          : "Failed to create restaurant",
      );
    } finally {
      setCreatingRestaurant(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Building2 className="h-4 w-4" />
            <span>Platform management</span>
          </div>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Restaurants
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage restaurants using Aagan, their subscription plans,
            ownership, and account status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadRestaurants(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddRestaurant(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add restaurant
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-bold text-red-700">
              Failed to load restaurants
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total restaurants
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading ? "—" : restaurants.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <Store className="h-5 w-5 text-slate-700" />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            All registered restaurants
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active</p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading ? "—" : activeCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <p className="mt-4 text-xs text-emerald-600">
            Currently operating
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading ? "—" : pendingCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <p className="mt-4 text-xs text-amber-600">
            Awaiting activation
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Suspended
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading ? "—" : suspendedCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
          </div>

          <p className="mt-4 text-xs text-red-600">
            Requires attention
          </p>
        </Card>
      </div>

      {/* Main table */}
      <Card padding="none">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-lg">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="restaurant-search"
                  className="pl-10"
                  placeholder="Search restaurant, owner, location, or slug..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                ["All", "Active", "Pending", "Suspended"] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === status
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {loading ? "—" : filteredRestaurants.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {loading ? "—" : restaurants.length}
              </span>{" "}
              restaurants
            </p>

            <span className="hidden text-xs text-slate-400 sm:block">
              {loading ? "Loading..." : "Live database data"}
            </span>
          </div>
        </div>

        {loading && (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading restaurants...
            </p>
          </div>
        )}

        {!loading && filteredRestaurants.length > 0 && (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Restaurant
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Owner
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Plan
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRestaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                            {restaurant.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {restaurant.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              /r/{restaurant.slug}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                              <MapPin className="h-3 w-3" />
                              {restaurant.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <Users className="mt-0.5 h-4 w-4 text-slate-400" />

                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {restaurant.owner}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {restaurant.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            restaurant.plan === "Professional"
                              ? "info"
                              : "default"
                          }
                        >
                          {restaurant.plan}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(restaurant.status)}>
                          {restaurant.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRestaurant(restaurant)}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                      {restaurant.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {restaurant.name}
                        </p>

                        <Badge variant={statusVariant(restaurant.status)}>
                          {restaurant.status}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {restaurant.location}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        /r/{restaurant.slug}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Owner:{" "}
                        <span className="font-medium text-slate-600">
                          {restaurant.owner}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">Plan</p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {restaurant.plan}
                      </p>
                    </div>

                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mt-3"
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    View restaurant
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && filteredRestaurants.length === 0 && (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No restaurants found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {restaurants.length === 0
                ? "Create your first restaurant to start using the platform."
                : "Try changing your search or status filter."}
            </p>

            {restaurants.length === 0 && (
              <Button
                type="button"
                className="mt-5"
                onClick={() => {
                  resetForm();
                  setShowAddRestaurant(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add restaurant
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Database status */}
      <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

        <div>
          <p className="text-sm font-bold text-slate-900">
            Connected to platform database
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Restaurant records are loaded from MongoDB through the
            authenticated Aagan backend API.
          </p>
        </div>
      </div>

      {/* View restaurant modal */}
      {selectedRestaurant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={() => setSelectedRestaurant(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Restaurant details
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  {selectedRestaurant.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                  {selectedRestaurant.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {selectedRestaurant.name}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    /r/{selectedRestaurant.slug}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Owner</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.owner}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    {selectedRestaurant.email}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Joined</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.joined}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Phone</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Plan</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.plan}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-xs text-slate-400">Account status</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedRestaurant.status}
                  </p>
                </div>

                <Badge variant={statusVariant(selectedRestaurant.status)}>
                  {selectedRestaurant.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setSelectedRestaurant(null)}
                >
                  Close
                </Button>

                <Link to={`/admin/restaurants/${selectedRestaurant.id}`} className="w-full">
                  <Button type="button" fullWidth>
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add restaurant modal */}
      {showAddRestaurant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={closeCreateModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform administration
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  Add restaurant
                </h3>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creatingRestaurant}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="restaurant-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Restaurant name
                  </label>

                  <Input
                    id="restaurant-name"
                    placeholder="e.g. Himalayan Brew Cafe"
                    value={form.name}
                    onChange={(event) => {
                      const name = event.target.value;

                      setForm((current) => ({
                        ...current,
                        name,
                        slug:
                          current.slug === "" ||
                          current.slug === createSlug(current.name)
                            ? createSlug(name)
                            : current.slug,
                      }));
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="restaurant-slug"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Restaurant slug
                  </label>

                  <Input
                    id="restaurant-slug"
                    placeholder="himalayan-brew-cafe"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: createSlug(event.target.value),
                      }))
                    }
                    required
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Used for the public restaurant URL.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="restaurant-phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone
                  </label>

                  <Input
                    id="restaurant-phone"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="restaurant-plan"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Plan
                  </label>

                  <select
                    id="restaurant-plan"
                    value={form.plan}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        plan: event.target.value as CreateRestaurantForm["plan"],
                      }))
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="restaurant-address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Address
                  </label>

                  <Input
                    id="restaurant-address"
                    placeholder="e.g. Thamel, Kathmandu"
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="restaurant-opening"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Opening time
                  </label>

                  <Input
                    id="restaurant-opening"
                    type="time"
                    value={form.opening}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        opening: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="restaurant-closing"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Closing time
                  </label>

                  <Input
                    id="restaurant-closing"
                    type="time"
                    value={form.closing}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        closing: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {createError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    {createError}
                  </p>
                </div>
              )}

              {createSuccess && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">
                    {createSuccess}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCreateModal}
                  disabled={creatingRestaurant}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={creatingRestaurant}>
                  {creatingRestaurant ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create restaurant
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantsPage;