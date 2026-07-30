import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh',
];

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

export function StepLocation({ data, onUpdate }: Props) {
  const set = (key: string, value: string) => onUpdate({ [key]: value });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Address Line 1</Label>
          <Input value={data.address_1 ?? ''} onChange={(e) => set('address_1', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Address Line 2</Label>
          <Input value={data.address_2 ?? ''} onChange={(e) => set('address_2', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={data.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>PIN Code</Label>
            <Input value={data.pin ?? ''} onChange={(e) => set('pin', e.target.value)} maxLength={6} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select value={data.state ?? ''} onValueChange={(v) => set('state', v)}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>{INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>GSTIN</Label>
          <Input value={data.gstin ?? ''} onChange={(e) => set('gstin', e.target.value.toUpperCase())} maxLength={15} placeholder="15-char alphanumeric" />
        </div>
        <div className="space-y-2">
          <Label>FSSAI License</Label>
          <Input value={data.fssai ?? ''} onChange={(e) => set('fssai', e.target.value)} maxLength={14} placeholder="14 digits" />
        </div>
        <div className="space-y-2">
          <Label>PAN Number</Label>
          <Input value={data.pan ?? ''} onChange={(e) => set('pan', e.target.value.toUpperCase())} maxLength={10} placeholder="AAAAA9999A" />
        </div>
      </div>

      {/* Receipt preview */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Bill Preview</p>
        <div className="rounded bg-card p-4 text-xs font-mono leading-relaxed text-card-foreground shadow-sm">
          <p className="text-center font-bold">{data.name || 'Restaurant Name'}</p>
          <p className="text-center">{data.address_1 || 'Address Line 1'}</p>
          {data.address_2 && <p className="text-center">{data.address_2}</p>}
          <p className="text-center">{[data.city, data.state, data.pin].filter(Boolean).join(', ') || 'City, State, PIN'}</p>
          <hr className="my-2 border-dashed" />
          {data.gstin && <p>GSTIN: {data.gstin}</p>}
          {data.fssai && <p>FSSAI: {data.fssai}</p>}
          <hr className="my-2 border-dashed" />
          <p className="text-center text-muted-foreground">--- Sample Bill ---</p>
        </div>
      </div>
    </div>
  );
}
