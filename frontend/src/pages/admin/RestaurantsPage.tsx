import { useEffect, useMemo, useState } from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

import {
  getAllRestaurants,
  type Restaurant as ApiRestaurant,
} from "../../services/restaurantService";

type RestaurantStatus =
  | "Active"
  | "Pending"
  | "Suspended";

type RestaurantPlan =
  | "Starter"
  | "Professional"
  | "Custom";

type Restaurant = {
  id: string;
  name: string;
  location: string;
  owner: string;
  email: string;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  tables: number | null;
  orders: number | null;
  joined: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function mapRestaurant(
  restaurant: ApiRestaurant,
): Restaurant {
  return {
    id: restaurant._id,
    name: restaurant.name,
    location: restaurant.address || "No address provided",
    owner:
      restaurant.ownerId?.name ||
      "No owner assigned",
    email:
      restaurant.ownerId?.email ||
      "No email available",
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
    tables: null,
    orders: null,
    joined: new Date(
      restaurant.createdAt,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<
    Restaurant[]
  >([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | RestaurantStatus>("All");

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllRestaurants();

        setRestaurants(
          data.map(mapRestaurant),
        );
      } catch (error) {
        console.error(
          "Failed to load restaurants:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load restaurants",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !query ||
        restaurant.name
          .toLowerCase()
          .includes(query) ||
        restaurant.location
          .toLowerCase()
          .includes(query) ||
        restaurant.owner
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        restaurant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    restaurants,
    search,
    statusFilter,
  ]);

  const activeCount = restaurants.filter(
    (restaurant) =>
      restaurant.status === "Active",
  ).length;

  const pendingCount = restaurants.filter(
    (restaurant) =>
      restaurant.status === "Pending",
  ).length;

  const suspendedCount = restaurants.filter(
    (restaurant) =>
      restaurant.status === "Suspended",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Platform management
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Restaurants
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage restaurants using the QR ordering
            platform, their plans, and account status.
          </p>
        </div>

        <Button type="button">
          <span className="text-lg leading-none">
            +
          </span>
          Add restaurant
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Failed to load restaurants
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total restaurants
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading
                  ? "—"
                  : restaurants.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
              🏪
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            All registered accounts
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading ? "—" : activeCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
              ✓
            </div>
          </div>

          <p className="mt-4 text-xs text-emerald-600">
            Currently operating
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {loading
                  ? "—"
                  : pendingCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg">
              ⏳
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
                {loading
                  ? "—"
                  : suspendedCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lg">
              !
            </div>
          </div>

          <p className="mt-4 text-xs text-red-600">
            Requires attention
          </p>
        </Card>
      </div>

      {/* Main card */}
      <Card padding="none">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-md">
              <Input
                id="restaurant-search"
                placeholder="Search restaurant, owner, or location..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Active",
                  "Pending",
                  "Suspended",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(status)
                  }
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
                {loading
                  ? "—"
                  : filteredRestaurants.length}
              </span>{" "}
              of{" "}
              {loading
                ? "—"
                : restaurants.length}{" "}
              restaurants
            </p>

            <span className="hidden text-xs text-slate-400 sm:block">
              {loading
                ? "Loading..."
                : "Updated just now"}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading restaurants...
            </p>
          </div>
        )}

        {/* Desktop table */}
        {!loading && (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Restaurant
                  </th>

                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Owner
                  </th>

                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>

                  <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tables
                  </th>

                  <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Orders
                  </th>

                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRestaurants.map(
                  (restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                            {restaurant.name.charAt(
                              0,
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {restaurant.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {restaurant.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {restaurant.owner}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {restaurant.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            restaurant.plan ===
                            "Professional"
                              ? "info"
                              : "default"
                          }
                        >
                          {restaurant.plan}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                        {restaurant.tables ===
                        null
                          ? "—"
                          : restaurant.tables}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                        {restaurant.orders ===
                        null
                          ? "—"
                          : formatNumber(
                              restaurant.orders,
                            )}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            restaurant.status ===
                            "Active"
                              ? "success"
                              : restaurant.status ===
                                  "Pending"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {restaurant.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRestaurant(
                              restaurant,
                            )
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && (
          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredRestaurants.map(
              (restaurant) => (
                <div
                  key={restaurant.id}
                  className="p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                      {restaurant.name.charAt(
                        0,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {restaurant.name}
                        </p>

                        <Badge
                          variant={
                            restaurant.status ===
                            "Active"
                              ? "success"
                              : restaurant.status ===
                                  "Pending"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {restaurant.status}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {restaurant.location}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Owner:{" "}
                        <span className="font-medium text-slate-600">
                          {restaurant.owner}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">
                        Plan
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {restaurant.plan}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">
                        Tables
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {restaurant.tables ===
                        null
                          ? "—"
                          : restaurant.tables}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-400">
                        Orders
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {restaurant.orders ===
                        null
                          ? "—"
                          : formatNumber(
                              restaurant.orders,
                            )}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mt-3"
                    onClick={() =>
                      setSelectedRestaurant(
                        restaurant,
                      )
                    }
                  >
                    View restaurant
                  </Button>
                </div>
              ),
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          filteredRestaurants.length ===
            0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                🔍
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No restaurants found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status
                filter.
              </p>
            </div>
          )}
      </Card>

      {/* Database notice */}
      <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <div className="mt-0.5 text-lg">
          ✓
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">
            Connected to platform database
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Restaurant records are now loaded from
            MongoDB through the authenticated backend
            API.
          </p>
        </div>
      </div>

      {/* Restaurant details modal */}
      {selectedRestaurant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            setSelectedRestaurant(null)
          }
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
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
                onClick={() =>
                  setSelectedRestaurant(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                  {selectedRestaurant.name.charAt(
                    0,
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {selectedRestaurant.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRestaurant.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Owner
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.owner}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Joined
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.joined}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Tables
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.tables ===
                    null
                      ? "Not configured"
                      : selectedRestaurant.tables}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Orders
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedRestaurant.orders ===
                    null
                      ? "No order data yet"
                      : formatNumber(
                          selectedRestaurant.orders,
                        )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Subscription
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedRestaurant.plan}
                  </p>
                </div>

                <Badge
                  variant={
                    selectedRestaurant.status ===
                    "Active"
                      ? "success"
                      : selectedRestaurant.status ===
                          "Pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {selectedRestaurant.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    setSelectedRestaurant(null)
                  }
                >
                  Close
                </Button>

                <Button
                  type="button"
                  fullWidth
                >
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantsPage;