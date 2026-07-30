import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RESTAURANT_TYPES = ['QSR', 'Fine Dining', 'Cafe', 'Dhaba', 'Cloud Kitchen', 'Bar'];

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

export function StepRestaurantProfile({ data, onUpdate }: Props) {
  const set = (key: string, value: string) => onUpdate({ [key]: value });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label>Restaurant Name *</Label>
        <Input value={data.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="My Restaurant" />
      </div>

      <div className="space-y-2">
        <Label>Restaurant Type</Label>
        <Select value={data.type ?? ''} onValueChange={(v) => set('type', v)}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {RESTAURANT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input value={data.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 9876543210" />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={data.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="info@restaurant.com" />
      </div>

      <div className="space-y-2">
        <Label>Website</Label>
        <Input value={data.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label>Instagram</Label>
        <Input value={data.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="@restaurant" />
      </div>

      <div className="space-y-2">
        <Label>Facebook</Label>
        <Input value={data.facebook ?? ''} onChange={(e) => set('facebook', e.target.value)} placeholder="facebook.com/restaurant" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Logo</Label>
        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-sm text-muted-foreground cursor-pointer hover:border-primary/50">
          Click to upload logo (PNG/JPG, max 2MB)
        </div>
      </div>
    </div>
  );
}
