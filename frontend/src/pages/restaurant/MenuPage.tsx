import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createCategory,
  createMenuItem,
  addCatalogMenuItems,
  deleteCategory,
  deleteMenuItem,
  getMenuData,
  updateMenuItem,
  updateCategory,
} from "../../services/restaurantDashboardService";
import type {
  MenuCategory,
  MenuItem,
} from "../../services/restaurantDashboardService";
import { menuCatalog } from "../../data/menuCatalog";

const getCategoryId = (item: MenuItem): string =>
  typeof item.categoryId === "string"
    ? item.categoryId
    : item.categoryId._id;

function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("All dishes");
  const [selectedCatalog, setSelectedCatalog] = useState<Record<string, boolean>>({});
  const [catalogPrices, setCatalogPrices] = useState<Record<string, string>>({});
  const [catalogNotice, setCatalogNotice] = useState("");

  const load = async () => {
    try {
      const data = await getMenuData();
      setCategories(data.categories);
      setItems(data.items);
      setCategoryId((current) => current || data.categories[0]?._id || "");
      setError("");
    } catch (err) {
      console.error("Failed to load restaurant menu:", err);
      setError(err instanceof Error ? err.message : "Unable to load the menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void getMenuData()
      .then((data) => {
        if (!active) return;
        setCategories(data.categories);
        setItems(data.items);
        setCategoryId((current) => current || data.categories[0]?._id || "");
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error("Failed to load restaurant menu:", err);
        setError(err instanceof Error ? err.message : "Unable to load the menu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          activeCategory === "All" ||
          getCategoryId(item) === activeCategory,
      ),
    [items, activeCategory],
  );

  const existingDishNames = useMemo(
    () => new Set(items.map((item) => item.name.trim().toLocaleLowerCase())),
    [items],
  );

  const catalogCategories = useMemo(
    () => ["All dishes", ...new Set(menuCatalog.map((dish) => dish.category))],
    [],
  );

  const visibleCatalogDishes = useMemo(() => {
    const query = catalogSearch.trim().toLocaleLowerCase();
    return menuCatalog.filter((dish) =>
      (catalogCategory === "All dishes" || dish.category === catalogCategory) &&
      (!query || dish.name.toLocaleLowerCase().includes(query)),
    );
  }, [catalogCategory, catalogSearch]);

  const selectedCatalogDishes = menuCatalog.filter(
    (dish) => selectedCatalog[dish.name] && !existingDishNames.has(dish.name.toLocaleLowerCase()),
  );

  const resetItemForm = () => {
    setEditingId("");
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(categories[0]?._id || "");
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const category = await createCategory({
        name: categoryName.trim(),
        description: categoryDescription.trim(),
      });
      setCategories((current) => [...current, category]);
      setCategoryName("");
      setCategoryDescription("");
      setCategoryId(category._id);
    } catch (err) {
      console.error("Failed to create menu category:", err);
      setError(err instanceof Error ? err.message : "Unable to create category.");
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryId) return;
    setSaving(true);
    setError("");
    const value = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: "",
      available: true,
      categoryId,
    };
    try {
      if (editingId) {
        await updateMenuItem(editingId, value);
      } else {
        await createMenuItem(value);
      }
      resetItemForm();
      await load();
    } catch (err) {
      console.error("Failed to save menu item:", err);
      setError(err instanceof Error ? err.message : "Unable to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: MenuItem) => {
    setEditingId(item._id);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategoryId(getCategoryId(item));
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item._id, {
        available: !item.available,
      });
      setItems((current) =>
        current.map((entry) => entry._id === updated._id ? updated : entry),
      );
    } catch (err) {
      console.error("Failed to update menu item availability:", err);
      setError(err instanceof Error ? err.message : "Unable to update item.");
    }
  };

  const removeItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await deleteMenuItem(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      setError(err instanceof Error ? err.message : "Unable to delete item.");
    }
  };

  const removeCategory = async (category: MenuCategory) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category._id);
      setCategories((current) => current.filter((entry) => entry._id !== category._id));
      if (activeCategory === category._id) setActiveCategory("All");
    } catch (err) {
      console.error("Failed to delete menu category:", err);
      setError(err instanceof Error ? err.message : "Unable to delete category.");
    }
  };

  const editCategory = async (category: MenuCategory) => {
    const name = window.prompt("Category name", category.name);
    if (name === null) return;
    const description = window.prompt("Category description", category.description || "");
    if (description === null) return;
    try {
      const updated = await updateCategory(category._id, {
        name: name.trim(),
        description: description.trim(),
      });
      setCategories((current) =>
        current.map((entry) => entry._id === updated._id ? updated : entry),
      );
    } catch (err) {
      console.error("Failed to edit menu category:", err);
      setError(err instanceof Error ? err.message : "Unable to edit category.");
    }
  };

  const addSelectedCatalogDishes = async () => {
    const missingPrice = selectedCatalogDishes.find(
      (dish) => catalogPrices[dish.name] === undefined || catalogPrices[dish.name] === "",
    );
    if (missingPrice) {
      setError(`Enter a price for ${missingPrice.name} before adding selected dishes.`);
      return;
    }

    setSaving(true);
    setError("");
    setCatalogNotice("");
    try {
      const result = await addCatalogMenuItems(
        selectedCatalogDishes.map((dish) => ({
          ...dish,
          price: Number(catalogPrices[dish.name]),
        })),
      );
      setSelectedCatalog({});
      setCatalogPrices({});
      await load();
      setCatalogNotice(
        `${result.added} dish${result.added === 1 ? "" : "es"} added to your menu` +
          (result.skipped ? ` · ${result.skipped} already existed and were skipped` : ""),
      );
    } catch (err) {
      console.error("Failed to add selected catalogue dishes:", err);
      setError(err instanceof Error ? err.message : "Unable to add selected dishes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card><p className="text-sm text-slate-500">Loading your menu…</p></Card>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-400">Restaurant menu</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Menu management</h2>
        <p className="mt-1 text-sm text-slate-500">Manage menu categories, dishes, prices, and availability.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs font-bold uppercase text-slate-400">Total items</p><p className="mt-2 text-3xl font-black">{items.length}</p></Card>
        <Card><p className="text-xs font-bold uppercase text-slate-400">Available</p><p className="mt-2 text-3xl font-black text-emerald-600">{items.filter((item) => item.available).length}</p></Card>
        <Card><p className="text-xs font-bold uppercase text-slate-400">Categories</p><p className="mt-2 text-3xl font-black">{categories.length}</p></Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Quick setup</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Choose dishes from the food list</h3>
            <p className="mt-1 text-sm text-slate-500">Tick the dishes you serve, set their prices, and add them all at once.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setCatalogOpen((open) => !open)}>
            {catalogOpen ? "Hide food list" : "Browse food list"}
          </Button>
        </div>

        {catalogNotice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{catalogNotice}</p>}

        {catalogOpen && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full lg:max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Search the food list"
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                  placeholder="Search dishes…"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"
                />
              </label>
              <p className="text-xs text-slate-500">Selected: <strong className="text-slate-800">{selectedCatalogDishes.length}</strong></p>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {catalogCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCatalogCategory(category)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${catalogCategory === category ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCatalogDishes.map((dish) => {
                const alreadyAdded = existingDishNames.has(dish.name.toLocaleLowerCase());
                const checked = Boolean(selectedCatalog[dish.name]) && !alreadyAdded;
                return (
                  <div
                    key={dish.name}
                    className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 ${alreadyAdded ? "border-slate-100 bg-slate-50 opacity-65" : checked ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <input
                      id={`catalog-${dish.name}`}
                      type="checkbox"
                      checked={alreadyAdded || checked}
                      disabled={alreadyAdded}
                      onChange={(event) => setSelectedCatalog((current) => ({
                        ...current,
                        [dish.name]: event.target.checked,
                      }))}
                      className="mt-1 h-4 w-4 accent-emerald-700"
                    />
                    <span className="min-w-0 flex-1">
                      <label htmlFor={`catalog-${dish.name}`} className="block truncate text-sm font-semibold text-slate-800">{dish.name}</label>
                      <span className="mt-0.5 block text-[11px] text-slate-500">{alreadyAdded ? "Already in your menu" : dish.category}</span>
                      {checked && (
                        <span className="mt-2 block">
                          <span className="relative block">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₨</span>
                            <input
                              aria-label={`Price for ${dish.name}`}
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={catalogPrices[dish.name] || ""}
                              onChange={(event) => setCatalogPrices((current) => ({
                                ...current,
                                [dish.name]: event.target.value,
                              }))}
                              onClick={(event) => event.stopPropagation()}
                              placeholder="Set price"
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-2 text-sm"
                            />
                          </span>
                        </span>
                      )}
                    </span>
                    {alreadyAdded && <Check size={15} className="mt-0.5 shrink-0 text-emerald-700" />}
                  </div>
                );
              })}
              {visibleCatalogDishes.length === 0 && <p className="py-8 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">No dishes match that search.</p>}
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">You can change prices and availability later in your menu.</p>
              <Button type="button" disabled={saving || selectedCatalogDishes.length === 0} onClick={() => void addSelectedCatalogDishes()}>
                <Plus size={16} /> {saving ? "Adding dishes…" : `Add ${selectedCatalogDishes.length || ""} selected dish${selectedCatalogDishes.length === 1 ? "" : "es"}`}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900">Categories</h3>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]" onSubmit={saveCategory}>
          <Input id="category-name" label="Name" required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
          <Input id="category-description" label="Description" value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} />
          <div className="self-end"><Button type="submit" disabled={saving}><Plus size={16} /> Add category</Button></div>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <button type="button" onClick={() => setActiveCategory(category._id)} className="text-sm font-semibold text-slate-700">{category.name}</button>
              <button type="button" onClick={() => void editCategory(category)} aria-label={`Edit ${category.name}`} className="text-slate-400 hover:text-slate-900"><Pencil size={14} /></button>
              <button type="button" onClick={() => void removeCategory(category)} aria-label={`Delete ${category.name}`} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-slate-500">Add a category before creating menu items.</p>}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-900">{editingId ? "Edit menu item" : "Add menu item"}</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={saveItem}>
          <Input id="item-name" label="Dish name" required value={name} onChange={(event) => setName(event.target.value)} />
          <Input id="item-price" label="Price (NPR)" type="number" min="0" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} />
          <div>
            <label htmlFor="item-category" className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <select id="item-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <option value="">Choose category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </div>
          <Input id="item-description" label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={saving || categories.length === 0}><Plus size={16} />{saving ? "Saving…" : editingId ? "Save item" : "Add item"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetItemForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <Card padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><h3 className="font-bold text-slate-900">Menu items</h3><p className="mt-1 text-xs text-slate-500">{filteredItems.length} dishes</p></div>
          <div className="flex gap-2 overflow-x-auto">
            {[{ id: "All", name: "All" }, ...categories.map(({ _id, name: label }) => ({ id: _id, name: label }))].map((category) => (
              <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeCategory === category.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{category.name}</button>
            ))}
          </div>
        </div>
        {filteredItems.length === 0 ? (
          <div className="py-14 text-center"><UtensilsCrossed className="mx-auto text-slate-300" size={28} /><p className="mt-3 font-semibold text-slate-700">No menu items yet</p><p className="mt-1 text-sm text-slate-500">Add your first dish using the form above.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const category = categories.find((entry) => entry._id === getCategoryId(item));
              return (
                <div key={item._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-900">{item.name}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{category?.name || "Uncategorized"}</span></div>
                    {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
                  </div>
                  <p className="font-bold text-slate-900">₨ {item.price.toLocaleString()}</p>
                  <button type="button" onClick={() => void toggleAvailability(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.available ? "Available" : "Unavailable"}</button>
                  <button type="button" onClick={() => editItem(item)} aria-label={`Edit ${item.name}`} className="text-slate-400 hover:text-slate-900"><Pencil size={16} /></button>
                  <button type="button" onClick={() => void removeItem(item)} aria-label={`Delete ${item.name}`} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default MenuPage;
