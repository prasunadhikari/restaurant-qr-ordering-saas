import type { MenuCategory } from "../../types/menu";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-0 z-30 border-y border-[#e9e4d9] bg-[#f8f6f0]/95 shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 scrollbar-hide sm:px-8">
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "bg-[#173b32] text-white shadow-sm"
              : "border border-[#e8e2d6] bg-white text-slate-600 hover:border-[#b28a50] hover:text-[#173b32]"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category.id
                ? "bg-[#173b32] text-white shadow-sm"
                : "border border-[#e8e2d6] bg-white text-slate-600 hover:border-[#b28a50] hover:text-[#173b32]"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CategoryTabs;