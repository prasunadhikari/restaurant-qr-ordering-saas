import type { MenuItem } from "../../types/menu";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <Card
      padding="none"
      className="group overflow-hidden"
      hover
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.popular && (
            <Badge variant="warning">Popular</Badge>
          )}

          {item.vegetarian && (
            <Badge variant="success">Veg</Badge>
          )}

          {item.spicy && (
            <Badge variant="danger">Spicy</Badge>
          )}
        </div>

        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-900">
            {item.name}
          </h3>

          <span className="shrink-0 text-sm font-bold text-emerald-600">
            NPR {item.price.toLocaleString()}
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500">
          {item.description}
        </p>

        <Button
          type="button"
          variant={item.available ? "primary" : "ghost"}
          size="sm"
          fullWidth
          disabled={!item.available}
          className="mt-4"
          onClick={() => onAdd(item)}
        >
          {item.available ? "+ Add to order" : "Unavailable"}
        </Button>
      </div>
    </Card>
  );
}

export default MenuItemCard;