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

export function getDefaultMenuForType(restaurantType?: string): { categories: Category[]; menuItems: MenuItem[] } {
  const type = (restaurantType || '').toLowerCase();
  
  let idS = 0;
  const uid = () => `seeded_${++idS}`;

  if (type.includes('icecream') || type.includes('ice cream')) {
    const c1 = { id: uid(), name: 'Scoops', type: 'veg', active: true };
    const c2 = { id: uid(), name: 'Sundaes', type: 'veg', active: true };
    const c3 = { id: uid(), name: 'Waffles & Crepes', type: 'veg', active: true };
    const c4 = { id: uid(), name: 'Shakes', type: 'veg', active: true };

    const categories = [c1, c2, c3, c4];
    const menuItems: MenuItem[] = [
      { id: uid(), name: 'Vanilla Double Scoop', categoryId: c1.id, price: 80, itemType: 'Veg', description: 'Classic vanilla bean double scoop' },
      { id: uid(), name: 'Double Chocolate Fudge Scoop', categoryId: c1.id, price: 100, itemType: 'Veg', description: 'Rich dark chocolate scoop with fudge swirl' },
      { id: uid(), name: 'Alphonso Mango Scoop', categoryId: c1.id, price: 90, itemType: 'Veg', description: 'Real Alphonso mango pulp' },
      { id: uid(), name: 'Strawberry Ripple Scoop', categoryId: c1.id, price: 80, itemType: 'Veg', description: 'Sweet strawberry puree ripple' },
      { id: uid(), name: 'Butterscotch Crunch Scoop', categoryId: c1.id, price: 90, itemType: 'Veg', description: 'Creamy butterscotch with cashew crunch' },
      { id: uid(), name: 'Mint Choco Chip Scoop', categoryId: c1.id, price: 100, itemType: 'Veg', description: 'Cool mint with dark chocolate chips' },
      { id: uid(), name: 'Cookies & Cream Scoop', categoryId: c1.id, price: 110, itemType: 'Veg', description: 'Oreo cookies crushed in sweet cream' },
      { id: uid(), name: 'Kesar Pista Kulfi Scoop', categoryId: c1.id, price: 95, itemType: 'Veg', description: 'Traditional saffron and pistachio' },
      
      { id: uid(), name: 'Death by Chocolate Sundae', categoryId: c2.id, price: 210, itemType: 'Veg', description: 'Chocolate scoops, warm brownie, hot fudge, and chips' },
      { id: uid(), name: 'Hot Fudge Brownie Sundae', categoryId: c2.id, price: 190, itemType: 'Veg', description: 'Warm walnut brownie with vanilla ice cream and fudge' },
      { id: uid(), name: 'Banana Split Sundae', categoryId: c2.id, price: 220, itemType: 'Veg', description: 'Vanilla, chocolate, strawberry scoops with banana slices' },
      { id: uid(), name: 'Fruit Overload Sundae', categoryId: c2.id, price: 230, itemType: 'Veg', description: 'Mixed fruit slices with vanilla and strawberry scoops' },
      { id: uid(), name: 'Caramel Butterscotch Sundae', categoryId: c2.id, price: 180, itemType: 'Veg', description: 'Butterscotch scoops topped with caramel sauce and nuts' },

      { id: uid(), name: 'Nutella Waffle', categoryId: c3.id, price: 160, itemType: 'Veg', description: 'Freshly baked waffle with Nutella spread' },
      { id: uid(), name: 'Belgian Chocolate Waffle', categoryId: c3.id, price: 170, itemType: 'Veg', description: 'Waffle loaded with melted Belgian dark chocolate' },
      { id: uid(), name: 'Strawberry Whipped Waffle', categoryId: c3.id, price: 165, itemType: 'Veg', description: 'Waffle topped with fresh strawberries and whipped cream' },
      { id: uid(), name: 'Maple Butter Waffle', categoryId: c3.id, price: 140, itemType: 'Veg', description: 'Classic waffle served with maple syrup and butter' },
      { id: uid(), name: 'Sweet Chocolate Crepe', categoryId: c3.id, price: 150, itemType: 'Veg', description: 'French crepe stuffed with melted chocolate' },

      { id: uid(), name: 'Chocolate Oreo Freakshake', categoryId: c4.id, price: 180, itemType: 'Veg', description: 'Thick shake made with vanilla ice cream and Oreos' },
      { id: uid(), name: 'Mango Blast Thickshake', categoryId: c4.id, price: 190, itemType: 'Veg', description: 'Monster mango shake topped with ice cream and mango bits' },
      { id: uid(), name: 'Strawberry Cream Shake', categoryId: c4.id, price: 170, itemType: 'Veg', description: 'Rich shake made with fresh strawberries and ice cream' },
      { id: uid(), name: 'Cold Coffee with Ice Cream', categoryId: c4.id, price: 180, itemType: 'Veg', description: 'Classic cold brew blended with vanilla ice cream' }
    ];
    return { categories, menuItems };
  }

  if (type.includes('cafe')) {
    const c1 = { id: uid(), name: 'Hot Coffees', type: 'veg', active: true };
    const c2 = { id: uid(), name: 'Cold Brews', type: 'veg', active: true };
    const c3 = { id: uid(), name: 'Sandwiches & Toast', type: 'veg', active: true };
    const c4 = { id: uid(), name: 'Bakery & Pastries', type: 'veg', active: true };

    const categories = [c1, c2, c3, c4];
    const menuItems: MenuItem[] = [
      { id: uid(), name: 'Espresso', categoryId: c1.id, price: 90, itemType: 'Veg', description: 'Rich double shot of espresso' },
      { id: uid(), name: 'Cafe Americano', categoryId: c1.id, price: 120, itemType: 'Veg', description: 'Hot water poured over double espresso' },
      { id: uid(), name: 'Cappuccino', categoryId: c1.id, price: 150, itemType: 'Veg', description: 'Espresso with steamed milk and thick foam' },
      { id: uid(), name: 'Cafe Latte', categoryId: c1.id, price: 160, itemType: 'Veg', description: 'Espresso with steamed milk and light foam' },
      { id: uid(), name: 'Cafe Mocha', categoryId: c1.id, price: 180, itemType: 'Veg', description: 'Espresso with chocolate and steamed milk' },
      { id: uid(), name: 'Flat White', categoryId: c1.id, price: 170, itemType: 'Veg', description: 'Double espresso with microfoam milk' },
      
      { id: uid(), name: 'Classic Iced Coffee', categoryId: c2.id, price: 150, itemType: 'Veg', description: 'Chilled coffee served over ice' },
      { id: uid(), name: 'Iced Latte', categoryId: c2.id, price: 170, itemType: 'Veg', description: 'Espresso and milk served over ice' },
      { id: uid(), name: 'Hazelnut Cold Coffee', categoryId: c2.id, price: 210, itemType: 'Veg', description: 'Sweet hazelnut cold brew with cream' },
      { id: uid(), name: 'Caramel Macchiato Iced', categoryId: c2.id, price: 220, itemType: 'Veg', description: 'Iced espresso with caramel syrup drizzle' },
      { id: uid(), name: 'Oreo Cold Frappe', categoryId: c2.id, price: 195, itemType: 'Veg', description: 'Blended espresso with vanilla and Oreo crumbs' },

      { id: uid(), name: 'Classic Veg Grilled Sandwich', categoryId: c3.id, price: 140, itemType: 'Veg', description: 'Grilled sandwich with cheese, tomatoes, and herbs' },
      { id: uid(), name: 'Cheese & Tomato Panini', categoryId: c3.id, price: 160, itemType: 'Veg', description: 'Warm panini bread filled with melted cheese' },
      { id: uid(), name: 'Mushroom & Spinach Toastie', categoryId: c3.id, price: 190, itemType: 'Veg', description: 'Toasted sourdough with sautéed mushrooms and spinach' },
      { id: uid(), name: 'Avocado Sourdough Toast', categoryId: c3.id, price: 250, itemType: 'Veg', description: 'Freshly smashed avocado on toasted sourdough' },
      { id: uid(), name: 'Paneer Tikka Wrap', categoryId: c3.id, price: 180, itemType: 'Veg', description: 'Warm tortilla wrap with spiced cottage cheese' },

      { id: uid(), name: 'Butter Croissant', categoryId: c4.id, price: 110, itemType: 'Veg', description: 'Flaky baked French butter croissant' },
      { id: uid(), name: 'Walnut Chocolate Brownie', categoryId: c4.id, price: 140, itemType: 'Veg', description: 'Dense fudge brownie topped with chopped walnuts' },
      { id: uid(), name: 'Red Velvet Pastry', categoryId: c4.id, price: 160, itemType: 'Veg', description: 'Velvety red velvet cake slice with cream cheese' },
      { id: uid(), name: 'Blueberry Muffin', categoryId: c4.id, price: 125, itemType: 'Veg', description: 'Soft muffin loaded with fresh blueberries' },
      { id: uid(), name: 'Warm Apple Pie', categoryId: c4.id, price: 150, itemType: 'Veg', description: 'Flaky pie filled with sweetened apples and cinnamon' }
    ];
    return { categories, menuItems };
  }

  if (type.includes('fine dining') || type.includes('fine')) {
    const c1 = { id: uid(), name: 'Appetizers', type: 'veg', active: true };
    const c2 = { id: uid(), name: 'Gourmet Mains', type: 'veg', active: true };
    const c3 = { id: uid(), name: 'Artisanal Pasta', type: 'veg', active: true };
    const c4 = { id: uid(), name: 'Signature Desserts', type: 'veg', active: true };

    const categories = [c1, c2, c3, c4];
    const menuItems: MenuItem[] = [
      { id: uid(), name: 'Truffle Edamame Dumplings', categoryId: c1.id, price: 350, itemType: 'Veg', description: 'Dumplings filled with edamame and truffle oil' },
      { id: uid(), name: 'Pesto Paneer Tikka', categoryId: c1.id, price: 380, itemType: 'Veg', description: 'Grilled cottage cheese marinated in fresh pesto' },
      { id: uid(), name: 'Crispy Lotus Stem', categoryId: c1.id, price: 320, itemType: 'Veg', description: 'Fried lotus stems tossed in sweet chilli honey' },
      { id: uid(), name: 'Stuffed Mushroom Caps', categoryId: c1.id, price: 340, itemType: 'Veg', description: 'Baked mushrooms filled with cream cheese and herbs' },
      { id: uid(), name: 'Bruschetta Pomodoro', categoryId: c1.id, price: 290, itemType: 'Veg', description: 'Toasted baguette topped with tomatoes, garlic, and basil' },

      { id: uid(), name: 'Exotic Veg Sizzler', categoryId: c2.id, price: 490, itemType: 'Veg', description: 'Sizzling platter with rice, grilled veggies, and gravy' },
      { id: uid(), name: 'Paneer Pasanda', categoryId: c2.id, price: 450, itemType: 'Veg', description: 'Rich layered paneer sandwiches in creamy onion gravy' },
      { id: uid(), name: 'Kofta Lajawab', categoryId: c2.id, price: 420, itemType: 'Veg', description: 'Fried vegetable dumplings in spiced cashew sauce' },
      { id: uid(), name: 'Dal Bukhara', categoryId: c2.id, price: 380, itemType: 'Veg', description: 'Slow-cooked black lentils in creamy tomato puree' },
      { id: uid(), name: 'Kashmiri Pulao', categoryId: c2.id, price: 350, itemType: 'Veg', description: 'Basmati rice cooked with saffron, nuts, and dry fruits' },
      { id: uid(), name: 'Garlic Butter Naan', categoryId: c2.id, price: 80, itemType: 'Veg', description: 'Soft tandoori flatbread brushed with garlic and butter' },

      { id: uid(), name: 'Wild Mushroom Risotto', categoryId: c3.id, price: 460, itemType: 'Veg', description: 'Arborio rice cooked in mushroom broth with parmesan' },
      { id: uid(), name: 'Penne All Arrabbiata', categoryId: c3.id, price: 390, itemType: 'Veg', description: 'Penne tossed in spicy garlic tomato sauce' },
      { id: uid(), name: 'Fettuccine Alfredo', categoryId: c3.id, price: 420, itemType: 'Veg', description: 'Flat pasta tossed in creamy parmesan butter sauce' },
      { id: uid(), name: 'Spinach & Ricotta Ravioli', categoryId: c3.id, price: 450, itemType: 'Veg', description: 'Handmade ravioli filled with fresh spinach and ricotta' },

      { id: uid(), name: 'Classic Tiramisu', categoryId: c4.id, price: 280, itemType: 'Veg', description: 'Layered coffee-flavoured Italian dessert' },
      { id: uid(), name: 'Creme Brulee', categoryId: c4.id, price: 250, itemType: 'Veg', description: 'Rich custard base topped with hardened caramelized sugar' },
      { id: uid(), name: 'New York Cheesecake', categoryId: c4.id, price: 290, itemType: 'Veg', description: 'Dense, creamy cheesecake slice with berry sauce' },
      { id: uid(), name: 'Sizzling Chocolate Brownie', categoryId: c4.id, price: 220, itemType: 'Veg', description: 'Walnut brownie served on a hot iron plate with vanilla scoop' }
    ];
    return { categories, menuItems };
  }

  if (type.includes('dhaba')) {
    const c1 = { id: uid(), name: 'Tandoor Se', type: 'veg', active: true };
    const c2 = { id: uid(), name: 'Handi Sabzi', type: 'veg', active: true };
    const c3 = { id: uid(), name: 'Rice & Lassi', type: 'veg', active: true };
    const c4 = { id: uid(), name: 'Dhaba Sweets', type: 'veg', active: true };

    const categories = [c1, c2, c3, c4];
    const menuItems: MenuItem[] = [
      { id: uid(), name: 'Paneer Tikka Tandoori', categoryId: c1.id, price: 280, itemType: 'Veg', description: 'Cottage cheese cubes charred in tandoor' },
      { id: uid(), name: 'Soya Chaap Tandoori', categoryId: c1.id, price: 250, itemType: 'Veg', description: 'Soybean rolls marinated in yogurt and clay-baked' },
      { id: uid(), name: 'Tandoori Roti Plain', categoryId: c1.id, price: 30, itemType: 'Veg', description: 'Whole wheat bread baked in tandoor' },
      { id: uid(), name: 'Butter Tandoori Roti', categoryId: c1.id, price: 35, itemType: 'Veg', description: 'clay-baked roti smeared with butter' },
      { id: uid(), name: 'Butter Naan', categoryId: c1.id, price: 60, itemType: 'Veg', description: 'Refined flour bread loaded with butter' },
      { id: uid(), name: 'Lachha Paratha', categoryId: c1.id, price: 65, itemType: 'Veg', description: 'Multi-layered crispy whole wheat bread' },

      { id: uid(), name: 'Kadhai Paneer', categoryId: c2.id, price: 290, itemType: 'Veg', description: 'Spiced cottage cheese cooked with bell peppers' },
      { id: uid(), name: 'Paneer Butter Masala', categoryId: c2.id, price: 310, itemType: 'Veg', description: 'Rich paneer cubes in tomato cream gravy' },
      { id: uid(), name: 'Dhaba Dal Makhani', categoryId: c2.id, price: 240, itemType: 'Veg', description: 'Creamy black lentils simmered overnight' },
      { id: uid(), name: 'Yellow Dal Tadka', categoryId: c2.id, price: 190, itemType: 'Veg', description: 'Yellow split lentils tempered with cumin, garlic and chilli' },
      { id: uid(), name: 'Aloo Gobhi Adraki', categoryId: c2.id, price: 180, itemType: 'Veg', description: 'Dry cauliflower and potato tossed with ginger' },
      { id: uid(), name: 'Chana Masala', categoryId: c2.id, price: 190, itemType: 'Veg', description: 'Chickpeas cooked in aromatic Indian spices' },

      { id: uid(), name: 'Jeera Basmati Rice', categoryId: c3.id, price: 130, itemType: 'Veg', description: 'Fluffy basmati rice tempered with cumin seeds' },
      { id: uid(), name: 'Dhaba Veg Biryani', categoryId: c3.id, price: 260, itemType: 'Veg', description: 'Basmati layered with spiced veg and saffron' },
      { id: uid(), name: 'Sweet Dhaba Lassi', categoryId: c3.id, price: 90, itemType: 'Veg', description: 'Churned yogurt sweet drink in earthen pot' },
      { id: uid(), name: 'Mango Thick Lassi', categoryId: c3.id, price: 110, itemType: 'Veg', description: 'Thick lassi flavored with alphonso mango' },
      { id: uid(), name: 'Masala Chaas', categoryId: c3.id, price: 60, itemType: 'Veg', description: 'Spiced buttermilk drink' },

      { id: uid(), name: 'Gulab Jamun (2 pcs)', categoryId: c4.id, price: 70, itemType: 'Veg', description: 'Warm sweet milk dumplings' },
      { id: uid(), name: 'Moong Dal Halwa', categoryId: c4.id, price: 110, itemType: 'Veg', description: 'Rich split green gram pudding cooked in ghee' },
      { id: uid(), name: 'Rabdi Kheer', categoryId: c4.id, price: 90, itemType: 'Veg', description: 'Slow-reduced milk rice pudding' }
    ];
    return { categories, menuItems };
  }

  // Fallback / Standard / QSR / Cloud Kitchen / Bar generic rich vegetarian list
  const c1 = { id: uid(), name: 'Starters', type: 'veg', active: true };
  const c2 = { id: uid(), name: 'Main Course', type: 'veg', active: true };
  const c3 = { id: uid(), name: 'Breads & Rice', type: 'veg', active: true };
  const c4 = { id: uid(), name: 'Desserts & Drinks', type: 'veg', active: true };

  const categories = [c1, c2, c3, c4];
  const menuItems: MenuItem[] = [
    { id: uid(), name: 'Paneer Tikka', categoryId: c1.id, price: 280, itemType: 'Veg', description: 'Grilled marinated cottage cheese' },
    { id: uid(), name: 'Veg Spring Rolls', categoryId: c1.id, price: 180, itemType: 'Veg', description: 'Crispy fried rolls filled with veggies' },
    { id: uid(), name: 'Hara Bhara Kabab', categoryId: c1.id, price: 220, itemType: 'Veg', description: 'Spinach and potato fried patties' },
    { id: uid(), name: 'Crispy Corn Pepper Salt', categoryId: c1.id, price: 190, itemType: 'Veg', description: 'Golden fried corn kernels tossed with spices' },
    { id: uid(), name: 'Honey Chilli Potato', categoryId: c1.id, price: 200, itemType: 'Veg', description: 'Crispy potatoes coated in sweet spicy sauce' },
    { id: uid(), name: 'French Fries', categoryId: c1.id, price: 100, itemType: 'Veg', description: 'Salted potato fingers fried golden' },

    { id: uid(), name: 'Paneer Butter Masala', categoryId: c2.id, price: 320, itemType: 'Veg', description: 'Cottage cheese in creamy tomato curry' },
    { id: uid(), name: 'Dal Makhani', categoryId: c2.id, price: 250, itemType: 'Veg', description: 'Slow-cooked black lentils with cream' },
    { id: uid(), name: 'Kadhai Paneer', categoryId: c2.id, price: 310, itemType: 'Veg', description: 'Paneer tossed in bell pepper onion gravy' },
    { id: uid(), name: 'Mix Vegetable Curry', categoryId: c2.id, price: 220, itemType: 'Veg', description: 'Seasoned vegetables cooked in onion gravy' },
    { id: uid(), name: 'Malai Kofta', categoryId: c2.id, price: 330, itemType: 'Veg', description: 'Paneer dumplings in sweet cashew cream' },
    { id: uid(), name: 'Aloo Jeera', categoryId: c2.id, price: 160, itemType: 'Veg', description: 'Boiled potatoes tempered with cumin seeds' },

    { id: uid(), name: 'Tandoori Roti Butter', categoryId: c3.id, price: 35, itemType: 'Veg', description: 'clay-baked wheat bread smeared with butter' },
    { id: uid(), name: 'Garlic Naan', categoryId: c3.id, price: 80, itemType: 'Veg', description: 'Soft tandoori flour bread with garlic bits' },
    { id: uid(), name: 'Butter Naan', categoryId: c3.id, price: 65, itemType: 'Veg', description: 'Tandoori flatbread layered with butter' },
    { id: uid(), name: 'Jeera Rice', categoryId: c3.id, price: 130, itemType: 'Veg', description: 'Steamed basmati rice tempered with cumin' },
    { id: uid(), name: 'Veg Dum Biryani', categoryId: c3.id, price: 280, itemType: 'Veg', description: 'Basmati rice cooked slow with vegetables' },
    { id: uid(), name: 'Steamed Plain Rice', categoryId: c3.id, price: 100, itemType: 'Veg', description: 'Steamed basmati plain rice' },

    { id: uid(), name: 'Gulab Jamun', categoryId: c4.id, price: 100, itemType: 'Veg', description: 'Sweet hot milk solids dumplings' },
    { id: uid(), name: 'Rasmalai (2 pcs)', categoryId: c4.id, price: 120, itemType: 'Veg', description: 'Flattened paneer balls soaked in saffron milk' },
    { id: uid(), name: 'Vanilla Ice Cream Scoop', categoryId: c4.id, price: 80, itemType: 'Veg', description: 'Classic vanilla bean scoop' },
    { id: uid(), name: 'Masala Chai', categoryId: c4.id, price: 50, itemType: 'Veg', description: 'Indian tea brewed with milk and spices' },
    { id: uid(), name: 'Sweet Lassi', categoryId: c4.id, price: 90, itemType: 'Veg', description: 'Chilled sweetened yogurt drink' },
    { id: uid(), name: 'Virgin Mojito', categoryId: c4.id, price: 150, itemType: 'Veg', description: 'Muddled mint leaves, lemon juice, soda' }
  ];
  return { categories, menuItems };
}

export function StepMenuSetup({ data, onUpdate }: Props) {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (data.categories) return data.categories;
    return getDefaultMenuForType(data.type).categories;
  });
  const [items, setItems] = useState<MenuItem[]>(() => {
    if (data.menuItems) return data.menuItems;
    return getDefaultMenuForType(data.type).menuItems;
  });
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
