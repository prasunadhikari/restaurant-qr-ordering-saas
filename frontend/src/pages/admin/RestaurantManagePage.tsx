import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Image,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShieldAlert,
  Store,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import Button from "../../components/ui/Button";
import {
  getRestaurantById,
  type Restaurant,
} from "../../services/restaurantService";
import { apiRequest } from "../../services/api";

interface RestaurantOwner {
  _id: string;
  name: string;
  email: string;
  restaurantId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
}

interface OwnersResponse {
  success: boolean;
  data: {
    owners: RestaurantOwner[];
  };
}

interface RestaurantForm {
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  phone: string;
  address: string;
  opening: string;
  closing: string;
  plan: "starter" | "professional" | "custom";
  status: "active" | "pending" | "suspended";
}

interface EditOwnerForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RestaurantManagePage() {
  const { id } = useParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [owners, setOwners] = useState<RestaurantOwner[]>([]);

  const [loading, setLoading] = useState(true);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [creatingOwner, setCreatingOwner] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);

  const [error, setError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editOwnerError, setEditOwnerError] = useState("");
  const [success, setSuccess] = useState("");

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditOwnerModal, setShowEditOwnerModal] = useState(false);
  const [showNewOwnerPassword, setShowNewOwnerPassword] = useState(false);
  const [showConfirmOwnerPassword, setShowConfirmOwnerPassword] =
    useState(false);

  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [editOwnerForm, setEditOwnerForm] =
    useState<EditOwnerForm>({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [restaurantForm, setRestaurantForm] =
    useState<RestaurantForm>({
      name: "",
      slug: "",
      logo: "",
      coverImage: "",
      phone: "",
      address: "",
      opening: "09:00",
      closing: "22:00",
      plan: "starter",
      status: "active",
    });

  const loadRestaurant = async () => {
    if (!id) {
      setError("Restaurant ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getRestaurantById(id);

      setRestaurant(data);

      setRestaurantForm({
        name: data.name,
        slug: data.slug,
        logo: data.logo || "",
        coverImage: data.coverImage || "",
        phone: data.phone || "",
        address: data.address || "",
        opening: data.openingHours?.open || "09:00",
        closing: data.openingHours?.close || "22:00",
        plan: data.plan,
        status: data.status,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load restaurant",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOwners = async () => {
    try {
      setOwnersLoading(true);
      setOwnerError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response = await apiRequest<OwnersResponse>(
        "/users/restaurant-owners",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOwners(response.data.owners);
    } catch (err) {
      setOwnerError(
        err instanceof Error
          ? err.message
          : "Failed to load restaurant owners",
      );
    } finally {
      setOwnersLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const openOwnerModal = async () => {
    setSuccess("");
    setOwnerError("");
    setShowOwnerModal(true);
    setShowCreateOwner(false);

    await loadOwners();
  };

  const openEditModal = () => {
    if (!restaurant) {
      return;
    }

    setSaveError("");
    setSuccess("");

    setRestaurantForm({
      name: restaurant.name,
      slug: restaurant.slug,
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      phone: restaurant.phone || "",
      address: restaurant.address || "",
      opening: restaurant.openingHours?.open || "09:00",
      closing: restaurant.openingHours?.close || "22:00",
      plan: restaurant.plan,
      status: restaurant.status,
    });

    setShowEditModal(true);
  };

  const openEditOwnerModal = () => {
    if (!restaurant?.ownerId) {
      return;
    }

    setEditOwnerError("");
    setSuccess("");

    setEditOwnerForm({
      name: restaurant.ownerId.name,
      email: restaurant.ownerId.email,
      password: "",
      confirmPassword: "",
    });

    setShowNewOwnerPassword(false);
    setShowConfirmOwnerPassword(false);
    setShowEditOwnerModal(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setRestaurantForm((current) => ({
      ...current,
      name: value,
      slug:
        current.slug === generateSlug(current.name) ||
        !current.slug
          ? generateSlug(value)
          : current.slug,
    }));
  };

  const handleSaveRestaurant = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    try {
      setSavingRestaurant(true);
      setSaveError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      await apiRequest(`/restaurants/admin/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: restaurantForm.name.trim(),
          slug: restaurantForm.slug.trim(),
          logo: restaurantForm.logo.trim(),
          coverImage: restaurantForm.coverImage.trim(),
          phone: restaurantForm.phone.trim(),
          address: restaurantForm.address.trim(),
          openingHours: {
            open: restaurantForm.opening,
            close: restaurantForm.closing,
          },
          plan: restaurantForm.plan,
          status: restaurantForm.status,
        }),
      });

      await loadRestaurant();

      setShowEditModal(false);
      setSuccess("Restaurant information updated successfully.");
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update restaurant",
      );
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleSaveOwner = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!restaurant?.ownerId) {
      return;
    }

    const name = editOwnerForm.name.trim();
    const email = editOwnerForm.email.trim().toLowerCase();
    const password = editOwnerForm.password;

    if (!name) {
      setEditOwnerError("Owner name is required.");
      return;
    }

    if (!email) {
      setEditOwnerError("Owner email is required.");
      return;
    }

    if (password && password.length < 6) {
      setEditOwnerError(
        "New password must be at least 6 characters.",
      );
      return;
    }

    if (password !== editOwnerForm.confirmPassword) {
      setEditOwnerError("Passwords do not match.");
      return;
    }

    try {
      setSavingOwner(true);
      setEditOwnerError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      await apiRequest(
        `/users/restaurant-owners/${restaurant.ownerId._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      await loadRestaurant();

      setShowEditOwnerModal(false);

      setEditOwnerForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setSuccess(
        "Restaurant owner information updated successfully.",
      );
    } catch (err) {
      setEditOwnerError(
        err instanceof Error
          ? err.message
          : "Failed to update restaurant owner",
      );
    } finally {
      setSavingOwner(false);
    }
  };

  const handleAssignOwner = async (ownerId: string) => {
    if (!id) {
      return;
    }

    try {
      setAssigning(true);
      setOwnerError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      await apiRequest(`/restaurants/admin/${id}/owner`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ownerId,
        }),
      });

      await loadRestaurant();

      setShowOwnerModal(false);
      setSuccess("Restaurant owner assigned successfully.");
    } catch (err) {
      setOwnerError(
        err instanceof Error
          ? err.message
          : "Failed to assign restaurant owner",
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateOwner = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    try {
      setCreatingOwner(true);
      setOwnerError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      await apiRequest(`/users/admin/restaurants/${id}/owner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: ownerForm.name.trim(),
          email: ownerForm.email.trim(),
          password: ownerForm.password,
        }),
      });

      setOwnerForm({
        name: "",
        email: "",
        password: "",
      });

      setShowCreateOwner(false);
      setShowOwnerModal(false);

      await loadRestaurant();

      setSuccess(
        "Restaurant owner account created and assigned successfully.",
      );
    } catch (err) {
      setOwnerError(
        err instanceof Error
          ? err.message
          : "Failed to create restaurant owner",
      );
    } finally {
      setCreatingOwner(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="text-sm text-slate-500">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="p-6">
        <Link
          to="/admin/restaurants"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Restaurants
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-900">
                Failed to load restaurant
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "Restaurant not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusStyles = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    suspended:
      "bg-red-50 text-red-700 border-red-200",
  };

  const statusIcons = {
    active: CheckCircle2,
    pending: Clock3,
    suspended: ShieldAlert,
  };

  const StatusIcon = statusIcons[restaurant.status];

  const availableOwners = owners.filter(
    (owner) =>
      !owner.restaurantId ||
      owner.restaurantId._id === restaurant._id,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/restaurants"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Restaurants
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Store className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {restaurant.name}
                </h1>

                <p className="text-sm text-slate-500">
                  /{restaurant.slug}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={openEditModal}
              >
                <Edit3 className="h-4 w-4" />
                Edit Restaurant
              </Button>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${statusStyles[restaurant.status]}`}
              >
                <StatusIcon className="h-4 w-4" />

                {restaurant.status.charAt(0).toUpperCase() +
                  restaurant.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Restaurant information */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Restaurant Information
                </h2>

                <p className="text-sm text-slate-500">
                  Basic information about this restaurant
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={<Building2 className="h-4 w-4" />}
                label="Restaurant Name"
                value={restaurant.name}
              />

              <InfoItem
                icon={<Store className="h-4 w-4" />}
                label="Restaurant Slug"
                value={`/${restaurant.slug}`}
              />

              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={restaurant.phone || "Not provided"}
              />

              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={restaurant.address || "Not provided"}
              />
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Settings className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Subscription
                </h2>

                <p className="text-sm text-slate-500">
                  Current restaurant plan
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Plan
              </p>

              <p className="mt-2 text-2xl font-bold capitalize text-slate-900">
                {restaurant.plan}
              </p>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-5 w-5 text-blue-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Restaurant Owner
                </h2>

                <p className="text-sm text-slate-500">
                  Account assigned to this restaurant
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.ownerId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openEditOwnerModal}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Owner
                </Button>
              )}

              <Button
                type="button"
                onClick={openOwnerModal}
              >
                <UserPlus className="h-4 w-4" />
                {restaurant.ownerId
                  ? "Change Owner"
                  : "Manage Owner"}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            {restaurant.ownerId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={<Users className="h-4 w-4" />}
                    label="Owner Name"
                    value={restaurant.ownerId.name}
                  />

                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={restaurant.ownerId.email}
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <p className="text-sm leading-6 text-blue-700">
                    You can update the owner's name and email or
                    set a new password. The current password is
                    never displayed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />

                  <div>
                    <p className="font-medium text-amber-900">
                      No owner assigned
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Create or assign a restaurant owner account so
                      they can manage this restaurant.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Opening hours */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Clock3 className="h-5 w-5 text-purple-700" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Opening Hours
              </h2>

              <p className="text-sm text-slate-500">
                Restaurant operating hours
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Opens
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {restaurant.openingHours?.open || "09:00"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Closes
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {restaurant.openingHours?.close || "22:00"}
              </p>
            </div>
          </div>
        </div>

        {/* Restaurant tools */}
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Restaurant Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            More restaurant tools will be connected here as we
            build the Aagan system.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ManagementCard
              title="Menu"
              description="Manage food and categories"
            />

            <ManagementCard
              title="Tables"
              description="Manage tables and QR codes"
            />

            <ManagementCard
              title="Orders"
              description="View restaurant orders"
            />

            <ManagementCard
              title="Settings"
              description="Restaurant configuration"
            />
          </div>
        </div>

        <div className="mt-6">
          <Link to="/admin/restaurants">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Restaurants
            </Button>
          </Link>
        </div>
      </div>

      {/* Edit restaurant modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Restaurant
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update restaurant information and settings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveRestaurant}
              className="max-h-[75vh] overflow-y-auto"
            >
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                {saveError && (
                  <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />

                      <p className="text-sm text-red-700">
                        {saveError}
                      </p>
                    </div>
                  </div>
                )}

                <FormField
                  label="Restaurant Name"
                  value={restaurantForm.name}
                  onChange={handleNameChange}
                  placeholder="Restaurant name"
                  required
                />

                <FormField
                  label="Restaurant Slug"
                  value={restaurantForm.slug}
                  onChange={(value) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      slug: value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  placeholder="restaurant-slug"
                  required
                />

                <FormField
                  label="Phone"
                  value={restaurantForm.phone}
                  onChange={(value) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                  placeholder="9800000000"
                />

                <FormField
                  label="Address"
                  value={restaurantForm.address}
                  onChange={(value) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      address: value,
                    }))
                  }
                  placeholder="Thamel, Kathmandu"
                />

                <FormField
                  label="Logo URL"
                  value={restaurantForm.logo}
                  onChange={(value) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      logo: value,
                    }))
                  }
                  placeholder="https://..."
                  icon={<Image className="h-4 w-4" />}
                />

                <FormField
                  label="Cover Image URL"
                  value={restaurantForm.coverImage}
                  onChange={(value) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      coverImage: value,
                    }))
                  }
                  placeholder="https://..."
                  icon={<Image className="h-4 w-4" />}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Opening Time
                  </label>

                  <input
                    type="time"
                    required
                    value={restaurantForm.opening}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        opening: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Closing Time
                  </label>

                  <input
                    type="time"
                    required
                    value={restaurantForm.closing}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        closing: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subscription Plan
                  </label>

                  <select
                    value={restaurantForm.plan}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        plan: event.target.value as RestaurantForm["plan"],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">
                      Professional
                    </option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Restaurant Status
                  </label>

                  <select
                    value={restaurantForm.status}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        status:
                          event.target.value as RestaurantForm["status"],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingRestaurant}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={savingRestaurant}
                >
                  <Save className="h-4 w-4" />
                  {savingRestaurant
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit owner modal */}
      {showEditOwnerModal && restaurant.ownerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Restaurant Owner
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the owner account for {restaurant.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditOwnerModal(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveOwner}
              className="max-h-[75vh] overflow-y-auto"
            >
              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>
                      <p className="font-semibold text-blue-900">
                        Owner Account
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        Change the owner's name or email, or set a
                        new password. The existing password cannot
                        be viewed.
                      </p>
                    </div>
                  </div>
                </div>

                {editOwnerError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <p className="text-sm leading-6 text-red-700">
                        {editOwnerError}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Owner Name
                  </label>

                  <input
                    type="text"
                    required
                    value={editOwnerForm.name}
                    onChange={(event) =>
                      setEditOwnerForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Ram Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={editOwnerForm.email}
                    onChange={(event) =>
                      setEditOwnerForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewOwnerPassword
                          ? "text"
                          : "password"
                      }
                      value={editOwnerForm.password}
                      onChange={(event) =>
                        setEditOwnerForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Leave blank to keep current password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewOwnerPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showNewOwnerPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNewOwnerPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Leave this blank if you only want to change the
                    name or email. If provided, the password must
                    contain at least 6 characters.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmOwnerPassword
                          ? "text"
                          : "password"
                      }
                      value={editOwnerForm.confirmPassword}
                      onChange={(event) =>
                        setEditOwnerForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Repeat the new password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmOwnerPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showConfirmOwnerPassword
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                    >
                      {showConfirmOwnerPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingOwner}
                  onClick={() =>
                    setShowEditOwnerModal(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={savingOwner}
                >
                  <Save className="h-4 w-4" />
                  {savingOwner
                    ? "Saving..."
                    : "Save Owner Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Restaurant Owner
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the owner account for {restaurant.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowOwnerModal(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {!showCreateOwner ? (
                <>
                  <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-emerald-900">
                        Need a new owner account?
                      </p>

                      <p className="mt-1 text-sm text-emerald-700">
                        Create an account and Aagan will automatically
                        assign it to this restaurant.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setOwnerError("");
                        setShowCreateOwner(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Owner
                    </Button>
                  </div>

                  {ownersLoading ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                      <p className="text-sm text-slate-500">
                        Loading owner accounts...
                      </p>
                    </div>
                  ) : ownerError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />

                        <p className="text-sm text-red-700">
                          {ownerError}
                        </p>
                      </div>
                    </div>
                  ) : availableOwners.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-start gap-3">
                        <Users className="mt-0.5 h-5 w-5 text-amber-600" />

                        <div>
                          <p className="font-medium text-amber-900">
                            No available owner accounts
                          </p>

                          <p className="mt-1 text-sm text-amber-700">
                            Create a restaurant owner account above,
                            then it will be assigned automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Available owner accounts
                      </p>

                      {availableOwners.map((owner) => {
                        const isCurrentOwner =
                          restaurant.ownerId?._id === owner._id;

                        return (
                          <div
                            key={owner._id}
                            className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                              isCurrentOwner
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {owner.name}
                                </p>

                                {isCurrentOwner && (
                                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                    Current
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="h-4 w-4" />
                                {owner.email}
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant={
                                isCurrentOwner
                                  ? "outline"
                                  : "primary"
                              }
                              disabled={
                                isCurrentOwner || assigning
                              }
                              onClick={() =>
                                handleAssignOwner(owner._id)
                              }
                            >
                              {assigning && !isCurrentOwner
                                ? "Assigning..."
                                : isCurrentOwner
                                  ? "Assigned"
                                  : "Assign"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <form
                  onSubmit={handleCreateOwner}
                  className="space-y-5"
                >
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <UserPlus className="mt-0.5 h-5 w-5 text-blue-600" />

                      <div>
                        <p className="font-semibold text-blue-900">
                          Create Restaurant Owner
                        </p>

                        <p className="mt-1 text-sm text-blue-700">
                          This account will be created as a restaurant
                          owner and automatically assigned to{" "}
                          <strong>{restaurant.name}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {ownerError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-5 w-5 text-red-600" />

                        <p className="text-sm text-red-700">
                          {ownerError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Owner Name
                    </label>

                    <input
                      type="text"
                      required
                      value={ownerForm.name}
                      onChange={(event) =>
                        setOwnerForm({
                          ...ownerForm,
                          name: event.target.value,
                        })
                      }
                      placeholder="e.g. Ram Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      required
                      value={ownerForm.email}
                      onChange={(event) =>
                        setOwnerForm({
                          ...ownerForm,
                          email: event.target.value,
                        })
                      }
                      placeholder="owner@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Temporary Password
                    </label>

                    <input
                      type="password"
                      required
                      minLength={6}
                      value={ownerForm.password}
                      onChange={(event) =>
                        setOwnerForm({
                          ...ownerForm,
                          password: event.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Give this password to the restaurant owner.
                      They can change it later.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={creatingOwner}
                      onClick={() => {
                        setOwnerError("");
                        setShowCreateOwner(false);
                      }}
                    >
                      Back
                    </Button>

                    <Button
                      type="submit"
                      disabled={creatingOwner}
                    >
                      <UserPlus className="h-4 w-4" />
                      {creatingOwner
                        ? "Creating..."
                        : "Create & Assign Owner"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type="text"
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>

      <p className="break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

interface ManagementCardProps {
  title: string;
  description: string;
}

function ManagementCard({
  title,
  description,
}: ManagementCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default RestaurantManagePage;