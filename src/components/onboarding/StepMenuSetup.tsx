import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Category { id: string; name: string; type: string; active: boolean; }
interface MenuItem { id: string; name: string; categoryId: string; price: number; itemType: string; description: string; }

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

let idC = 0;
const uid = () => `m${++idC}`;

const ITEM_TYPES = ['Veg', 'Non-Veg', 'Egg', 'Vegan'];

const defaultCategories: Category[] = [
  { id: uid(), name: 'Starters', type: 'both', active: true },
  { id: uid(), name: 'Main Course', type: 'both', active: true },
  { id: uid(), name: 'Beverages', type: 'veg', active: true },
  { id: uid(), name: 'Desserts', type: 'veg', active: true },
];

const defaultItems: MenuItem[] = [
  { id: uid(), name: 'Paneer Tikka', categoryId: defaultCategories[0].id, price: 280, itemType: 'Veg', description: 'Grilled cottage cheese' },
  { id: uid(), name: 'Chicken 65', categoryId: defaultCategories[0].id, price: 320, itemType: 'Non-Veg', description: 'Spicy fried chicken' },
  { id: uid(), name: 'Butter Chicken', categoryId: defaultCategories[1].id, price: 380, itemType: 'Non-Veg', description: 'Creamy tomato curry' },
  { id: uid(), name: 'Dal Makhani', categoryId: defaultCategories[1].id, price: 250, itemType: 'Veg', description: 'Slow-cooked black lentils' },
  { id: uid(), name: 'Masala Chai', categoryId: defaultCategories[2].id, price: 50, itemType: 'Veg', description: 'Indian spiced tea' },
  { id: uid(), name: 'Gulab Jamun', categoryId: defaultCategories[3].id, price: 120, itemType: 'Veg', description: 'Sweet milk dumplings' },
];

export function StepMenuSetup({ data, onUpdate }: Props) {
  const [categories, setCategories] = useState<Category[]>(data.categories ?? defaultCategories);
  const [items, setItems] = useState<MenuItem[]>(data.menuItems ?? defaultItems);
  const [selectedCat, setSelectedCat] = useState<string>(categories[0]?.id ?? '');

  const save = (cats: Category[], its: MenuItem[]) => {
    setCategories(cats); setItems(its);
    onUpdate({ categories: cats, menuItems: its });
  };

  const addCategory = () => {
    const cat: Category = { id: uid(), name: 'New Category', type: 'both', active: true };
    const updated = [...categories, cat];
    save(updated, items);
    setSelectedCat(cat.id);
  };

  const addItem = () => {
    const item: MenuItem = { id: uid(), name: 'New Item', categoryId: selectedCat, price: 0, itemType: 'Veg', description: '' };
    save(categories, [...items, item]);
  };

  const filteredItems = items.filter((i) => i.categoryId === selectedCat);

  const typeColor = (t: string) => {
    if (t === 'Veg') return 'bg-success/10 text-success border-success/30';
    if (t === 'Non-Veg') return 'bg-destructive/10 text-destructive border-destructive/30';
    if (t === 'Egg') return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-success/10 text-success border-success/30';
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Categories</Label>
          <Button variant="ghost" size="sm" onClick={addCategory}><Plus className="h-4 w-4" /></Button>
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              selectedCat === cat.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
            }`}
          >
            <span className="font-medium">{cat.name}</span>
            <Badge variant="outline" className="text-[10px]">{cat.type}</Badge>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Items in {categories.find((c) => c.id === selectedCat)?.name}</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Import CSV</Button>
            <Button size="sm" onClick={addItem}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
          </div>
        </div>
        <div className="space-y-2">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground cursor-grab" />
              <div className="flex-1 grid gap-2 sm:grid-cols-3">
                <Input
                  value={item.name}
                  onChange={(e) => {
                    const u = [...items];
                    const i = u.findIndex((x) => x.id === item.id);
                    u[i].name = e.target.value;
                    save(categories, u);
                  }}
                  className="text-sm"
                  placeholder="Item name"
                />
                <Input
                  type="number"
                  value={item.price || ''}
                  onChange={(e) => {
                    const u = [...items];
                    const i = u.findIndex((x) => x.id === item.id);
                    u[i].price = Number(e.target.value);
                    save(categories, u);
                  }}
                  className="text-sm"
                  placeholder="Price"
                />
                <div className="flex items-center gap-2">
                  <Badge className={`${typeColor(item.itemType)} text-[10px]`}>{item.itemType}</Badge>
                  <button
                    onClick={() => {
                      save(categories, items.filter((x) => x.id !== item.id));
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No items yet. Click "Add Item" to start.</p>
          )}
        </div>
      </div>
    </div>
  );
}
