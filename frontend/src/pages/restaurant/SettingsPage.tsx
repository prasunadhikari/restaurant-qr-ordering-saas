import { useState } from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

function SettingsPage() {
  const [restaurantName, setRestaurantName] =
    useState("Kathmandu Cafe");

  const [slug, setSlug] =
    useState("kathmandu-cafe");

  const [phone, setPhone] =
    useState("+977 9812345678");

  const [address, setAddress] =
    useState("Thamel, Kathmandu");

  const [restaurantType, setRestaurantType] =
    useState("Cafe & Restaurant");

  const [openingTime, setOpeningTime] =
    useState("08:00");

  const [closingTime, setClosingTime] =
    useState("22:00");

  const [isOpen, setIsOpen] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Restaurant configuration
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage your restaurant information, opening
            hours, and customer-facing details.
          </p>
        </div>

        {saved && (
          <Badge variant="success">
            ✓ Changes saved
          </Badge>
        )}
      </div>

      {/* Restaurant information */}
      <Card>
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-lg font-bold text-slate-900">
            Restaurant information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Basic information shown to customers on the
            digital menu.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input
            id="restaurant-name"
            label="Restaurant name"
            value={restaurantName}
            onChange={(event) =>
              setRestaurantName(event.target.value)
            }
          />

          <Input
            id="restaurant-slug"
            label="Restaurant slug"
            value={slug}
            onChange={(event) =>
              setSlug(event.target.value)
            }
          />

          <Input
            id="restaurant-phone"
            label="Phone number"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />

          <div>
            <label
              htmlFor="restaurant-type"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Restaurant type
            </label>

            <select
              id="restaurant-type"
              value={restaurantType}
              onChange={(event) =>
                setRestaurantType(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option>Cafe & Restaurant</option>
              <option>Restaurant</option>
              <option>Cafe</option>
              <option>Fast Food</option>
              <option>Bakery</option>
              <option>Bar & Restaurant</option>
              <option>Fine Dining</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Input
              id="restaurant-address"
              label="Address"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
            />
          </div>
        </div>
      </Card>

      {/* Restaurant status */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Restaurant status
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Control whether customers can place orders
              through the digital menu.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsOpen((current) => !current)
            }
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
              isOpen
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
            aria-label="Toggle restaurant status"
            aria-pressed={isOpen}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                isOpen
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <span
            className={`h-3 w-3 rounded-full ${
              isOpen
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isOpen
                ? "Restaurant is open"
                : "Restaurant is closed"}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {isOpen
                ? "Customers can currently place orders."
                : "Customers can view the menu but ordering is disabled."}
            </p>
          </div>
        </div>
      </Card>

      {/* Opening hours */}
      <Card>
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-lg font-bold text-slate-900">
            Opening hours
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Set the normal operating hours displayed to
            customers.
          </p>
        </div>

        <div className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="opening-time"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Opening time
              </label>

              <input
                id="opening-time"
                type="time"
                value={openingTime}
                onChange={(event) =>
                  setOpeningTime(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="closing-time"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Closing time
              </label>

              <input
                id="closing-time"
                type="time"
                value={closingTime}
                onChange={(event) =>
                  setClosingTime(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Current schedule
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Daily · {openingTime} – {closingTime}
            </p>
          </div>
        </div>
      </Card>

      {/* Branding */}
      <Card>
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-lg font-bold text-slate-900">
            Branding
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Restaurant logo and cover image will appear on
            the customer menu.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Logo */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Restaurant logo
            </p>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">
                K
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  Kathmandu Cafe
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Logo upload will be connected later.
                </p>
              </div>
            </div>
          </div>

          {/* Cover */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Cover image
            </p>

            <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Cover image
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Upload functionality will be added later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer preview */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Customer menu
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Customers access your menu using their table
              QR code.
            </p>
          </div>

          <Badge variant="info">
            /r/{slug}/t/01
          </Badge>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Customer URL example
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-slate-700">
            {typeof window !== "undefined"
              ? `${window.location.origin}/r/${slug}/t/01`
              : `/r/${slug}/t/01`}
          </p>
        </div>
      </Card>

      {/* Save */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Discard
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>

      {/* Demo notice */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 text-lg">
            🧪
          </div>

          <div>
            <p className="text-sm font-bold text-amber-900">
              Demo mode
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              These settings currently exist only in the
              browser. Once the backend and MongoDB are
              connected, restaurant settings will be stored
              securely and persist between sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;