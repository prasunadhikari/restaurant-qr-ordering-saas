import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  getRestaurantSettings,
  updateRestaurantSettings,
} from "../../services/restaurantDashboardService";
import type { Restaurant } from "../../services/restaurantService";

function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getRestaurantSettings()
      .then(setRestaurant)
      .catch((err: unknown) => {
        console.error("Failed to load restaurant settings:", err);
        setError(err instanceof Error ? err.message : "Unable to load settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const setField = <K extends keyof Restaurant>(
    key: K,
    value: Restaurant[K],
  ) => {
    setRestaurant((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setSaved(false);
  };

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateRestaurantSettings({
        name: restaurant.name,
        slug: restaurant.slug,
        phone: restaurant.phone,
        address: restaurant.address,
        restaurantType: restaurant.restaurantType || "",
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        openingHours: restaurant.openingHours,
        acceptingOrders: restaurant.acceptingOrders,
      });
      setRestaurant(updated);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save restaurant settings:", err);
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card><p className="text-sm text-slate-500">Loading restaurant settings…</p></Card>;
  }

  if (!restaurant) {
    return (
      <Card>
        <p className="font-semibold text-slate-900">Settings unavailable</p>
        <p className="mt-2 text-sm text-red-700">{error || "Restaurant not found."}</p>
      </Card>
    );
  }

  return (
    <form className="mx-auto max-w-5xl space-y-6" onSubmit={saveSettings}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Restaurant configuration</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your changes are saved to the restaurant record.
          </p>
        </div>
        {saved && <Badge variant="success">Changes saved</Badge>}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-lg font-bold text-slate-900">Restaurant information</h3>
          <p className="mt-1 text-sm text-slate-500">Details shown on your restaurant profile.</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            id="restaurant-name"
            label="Restaurant name"
            required
            value={restaurant.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          <Input
            id="restaurant-slug"
            label="Restaurant URL slug"
            required
            pattern="[A-Za-z0-9-]+"
            value={restaurant.slug}
            onChange={(event) => setField("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))}
          />
          <Input
            id="restaurant-phone"
            label="Phone number"
            value={restaurant.phone || ""}
            onChange={(event) => setField("phone", event.target.value)}
          />
          <div>
            <label htmlFor="restaurant-type" className="mb-2 block text-sm font-medium text-slate-700">
              Restaurant type
            </label>
            <select
              id="restaurant-type"
              value={restaurant.restaurantType || ""}
              onChange={(event) => setField("restaurantType", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Select a type</option>
              {["Restaurant", "Cafe", "Fast Food", "Bakery", "Fine Dining", "Bar & Restaurant", "Cafe & Restaurant"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Input
              id="restaurant-address"
              label="Address"
              value={restaurant.address || ""}
              onChange={(event) => setField("address", event.target.value)}
            />
          </div>
          <Input
            id="restaurant-logo"
            label="Logo image URL"
            type="url"
            value={restaurant.logo || ""}
            onChange={(event) => setField("logo", event.target.value)}
          />
          <Input
            id="restaurant-cover"
            label="Cover image URL"
            type="url"
            value={restaurant.coverImage || ""}
            onChange={(event) => setField("coverImage", event.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900">Opening hours</h3>
        <p className="mt-1 text-sm text-slate-500">Daily hours shown to your customers.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="opening-time" className="mb-2 block text-sm font-medium text-slate-700">Opening time</label>
            <input
              id="opening-time"
              type="time"
              required
              value={restaurant.openingHours?.open || ""}
              onChange={(event) => setField("openingHours", {
                open: event.target.value,
                close: restaurant.openingHours?.close || "",
              })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="closing-time" className="mb-2 block text-sm font-medium text-slate-700">Closing time</label>
            <input
              id="closing-time"
              type="time"
              required
              value={restaurant.openingHours?.close || ""}
              onChange={(event) => setField("openingHours", {
                open: restaurant.openingHours?.open || "",
                close: event.target.value,
              })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Accepting orders</h3>
            <p className="mt-1 text-sm text-slate-500">Pause or resume new restaurant orders.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(restaurant.acceptingOrders)}
            onClick={() => setField("acceptingOrders", !restaurant.acceptingOrders)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${restaurant.acceptingOrders ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${restaurant.acceptingOrders ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {restaurant.acceptingOrders ? "Your restaurant is accepting orders." : "New orders are paused."}
        </p>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900">Customer menu URL</h3>
        <p className="mt-2 break-all text-sm text-slate-600">
          {window.location.origin}/r/{restaurant.slug}/t/[table-number]
        </p>
      </Card>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <Button type="submit" size="lg" disabled={saving}>
          <Save size={16} />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export default SettingsPage;
