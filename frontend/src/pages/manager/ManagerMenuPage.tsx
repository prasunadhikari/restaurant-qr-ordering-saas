import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createManagerCategory,
  createManagerMenuItem,
  deleteManagerCategory,
  deleteManagerMenuItem,
  getManagerMenu,
  updateManagerCategory,
  updateManagerMenuItem,
  uploadManagerMenuItemImage,
  type ManagerCategory,
  type ManagerMenuItem,
} from "../../services/managerService";

function ManagerMenuPage() {
  const [categories, setCategories] = useState<ManagerCategory[]>([]);
  const [items, setItems] = useState<ManagerMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editing, setEditing] = useState<ManagerMenuItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  const imageFile = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await getManagerMenu();
      setCategories(data.categories);
      setItems(data.items);
    } catch (cause) {
      console.error("Failed to load manager menu:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load menu.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void Promise.resolve().then(load); }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(categories.find((category) => category.isActive)?._id ?? "");
    setImage("");
    setAvailable(true);
    if (imageFile.current) imageFile.current.value = "";
  };

  const startEdit = (item: ManagerMenuItem) => {
    setEditing(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategoryId(typeof item.categoryId === "string" ? item.categoryId : item.categoryId._id);
    setImage(item.image);
    setAvailable(item.available);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const category = await createManagerCategory(categoryName.trim(), "");
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
      if (!categoryId) setCategoryId(category._id);
    } catch (cause) {
      console.error("Failed to add manager menu category:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to add category.");
    }
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const selectedFile = imageFile.current?.files?.[0];
      const value = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        available,
        categoryId,
      };
      const updated = editing
        ? await updateManagerMenuItem(editing._id, value)
        : await createManagerMenuItem(value);
      setItems((current) => editing
        ? current.map((item) => item._id === updated._id ? { ...updated, image: updated.image || image } : item)
        : [updated, ...current]);
      if (selectedFile) {
        setUploading(updated._id);
        const withImage = await uploadManagerMenuItemImage(updated._id, selectedFile);
        setItems((current) => current.map((item) => item._id === withImage._id ? withImage : item));
      }
      resetForm();
    } catch (cause) {
      console.error("Failed to save manager menu item:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to save menu item.");
    } finally {
      setSaving(false);
      setUploading("");
    }
  };

  const toggleCategory = async (category: ManagerCategory) => {
    try {
      const updated = await updateManagerCategory(category._id, { isActive: !category.isActive });
      setCategories((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to update category availability:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update category.");
    }
  };

  const removeCategory = async (category: ManagerCategory) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    try {
      await deleteManagerCategory(category._id);
      setCategories((current) => current.filter((entry) => entry._id !== category._id));
    } catch (cause) {
      console.error("Failed to delete menu category:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to delete category.");
    }
  };

  const toggleItem = async (item: ManagerMenuItem) => {
    try {
      const updated = await updateManagerMenuItem(item._id, { available: !item.available });
      setItems((current) => current.map((entry) => entry._id === updated._id ? { ...updated, image: item.image } : entry));
    } catch (cause) {
      console.error("Failed to update menu item availability:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update menu item.");
    }
  };

  const removeItem = async (item: ManagerMenuItem) => {
    if (!window.confirm(`Delete ${item.name}? Items with order history cannot be deleted.`)) return;
    try {
      await deleteManagerMenuItem(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (cause) {
      console.error("Failed to delete menu item:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to delete menu item.");
    }
  };

  if (loading) return <Card><p className="text-sm text-slate-500">Loading menu…</p></Card>;
  const activeCategories = categories.filter((category) => category.isActive);

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Menu operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Menu</h1><p className="mt-2 text-sm text-slate-500">Keep categories, dish details, pricing, and availability current.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <Card>
        <h2 className="font-semibold">Categories</h2>
        <form onSubmit={addCategory} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input id="manager-category-name" label="New category" required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Breakfast" />
          <div className="self-end"><Button type="submit"><Plus size={16} /> Add category</Button></div>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <span className="text-sm font-medium">{category.name}</span>
              <Badge variant={category.isActive ? "success" : "default"}>{category.isActive ? "Active" : "Disabled"}</Badge>
              <button type="button" onClick={() => void toggleCategory(category)} className="text-xs font-semibold text-[#173b32] hover:underline">{category.isActive ? "Disable" : "Enable"}</button>
              <button type="button" onClick={() => void removeCategory(category)} aria-label={`Delete ${category.name}`} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="font-semibold">{editing ? `Edit ${editing.name}` : "Add menu item"}</h2><p className="mt-1 text-xs text-slate-500">Use a restaurant-owned dish photo for the best customer menu.</p></div>
          {editing && <button type="button" onClick={resetForm} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Cancel edit</button>}
        </div>
        {activeCategories.length === 0 ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Add and enable a category before adding dishes.</p> : (
          <form onSubmit={saveItem} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input id="manager-item-name" label="Dish name" required value={name} onChange={(event) => setName(event.target.value)} />
            <Input id="manager-item-price" label="Price (NPR)" type="number" min="0" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} />
            <div>
              <label htmlFor="manager-item-category" className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select id="manager-item-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="">Choose category</option>
                {activeCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} className="h-4 w-4 accent-emerald-700" /> Available to order</label>
            <div className="sm:col-span-2">
              <label htmlFor="manager-item-description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea id="manager-item-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="manager-menu-image" className="mb-2 block text-sm font-medium text-slate-700">Dish photo (JPEG, PNG, WebP · max 5 MB)</label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {image && <img src={image} alt={name || "Dish preview"} className="h-20 w-20 rounded-xl object-cover" />}
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <ImagePlus size={16} /> {uploading ? "Uploading…" : "Choose photo"}
                  <input ref={imageFile} id="manager-menu-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setImage(URL.createObjectURL(file));
                  }} />
                </label>
              </div>
            </div>
            <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving || Boolean(uploading)}>{saving ? "Saving…" : editing ? "Save item" : "Add item"}</Button>{editing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}</div>
          </form>
        )}
      </Card>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Current dishes</h2><span className="text-sm text-slate-500">{items.length} items</span></div>
        {items.length === 0 ? <Card className="text-sm text-slate-500">No menu items yet.</Card> : (
          <div className="space-y-2">
            {items.map((item) => {
              const category = typeof item.categoryId === "string" ? categories.find((entry) => entry._id === item.categoryId)?.name : item.categoryId?.name;
              return <Card key={item._id} padding="sm" className="flex flex-wrap items-center gap-3">
                {item.image ? <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><ImagePlus size={18} /></div>}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.name}</p><Badge variant={item.available ? "success" : "warning"}>{item.available ? "Available" : "Sold out"}</Badge></div><p className="mt-1 truncate text-xs text-slate-500">{category} · NPR {item.price.toLocaleString()}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.description}</p></div>
                <button type="button" onClick={() => void toggleItem(item)} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#173b32] hover:bg-emerald-50">{item.available ? "Mark sold out" : "Make available"}</button>
                <button type="button" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>
                <button type="button" onClick={() => void removeItem(item)} aria-label={`Delete ${item.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
              </Card>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ManagerMenuPage;
