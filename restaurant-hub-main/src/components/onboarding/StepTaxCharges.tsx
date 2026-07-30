import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

export function StepTaxCharges({ data, onUpdate }: Props) {
  const [gstSlab, setGstSlab] = useState(data.gstSlab ?? '5');
  const [serviceCharge, setServiceCharge] = useState(data.serviceCharge ?? true);
  const [serviceChargePct, setServiceChargePct] = useState(data.serviceChargePct ?? '5');
  const [packagingCharge, setPackagingCharge] = useState(data.packagingCharge ?? '30');
  const [roundOff, setRoundOff] = useState(data.roundOff ?? 'nearest');

  const save = () => onUpdate({ gstSlab, serviceCharge, serviceChargePct, packagingCharge, roundOff });

  const subtotal = 1000;
  const gst = subtotal * (Number(gstSlab) / 100);
  const cgst = gst / 2;
  const sgst = gst / 2;
  const sc = serviceCharge ? subtotal * (Number(serviceChargePct) / 100) : 0;
  const total = subtotal + gst + sc;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>GST Slab</Label>
          <Select value={gstSlab} onValueChange={(v) => { setGstSlab(v); setTimeout(save, 0); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['0', '5', '12', '18', '28'].map((s) => (
                <SelectItem key={s} value={s}>{s}%</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Service Charge</Label>
          <Switch checked={serviceCharge} onCheckedChange={(v) => { setServiceCharge(v); setTimeout(save, 0); }} />
        </div>
        {serviceCharge && (
          <div className="space-y-2">
            <Label>Service Charge %</Label>
            <Input type="number" value={serviceChargePct} onChange={(e) => { setServiceChargePct(e.target.value); setTimeout(save, 0); }} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Packaging Charge (₹)</Label>
          <Input type="number" value={packagingCharge} onChange={(e) => { setPackagingCharge(e.target.value); setTimeout(save, 0); }} />
        </div>

        <div className="space-y-2">
          <Label>Round-off Method</Label>
          <Select value={roundOff} onValueChange={(v) => { setRoundOff(v); setTimeout(save, 0); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">Nearest Rupee</SelectItem>
              <SelectItem value="fifty">Nearest 50 Paise</SelectItem>
              <SelectItem value="none">No Round-off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bill preview */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Tax Breakdown Preview</p>
        <div className="rounded bg-card p-4 text-sm font-mono text-card-foreground shadow-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>CGST ({Number(gstSlab)/2}%)</span><span>₹{cgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>SGST ({Number(gstSlab)/2}%)</span><span>₹{sgst.toFixed(2)}</span></div>
          {serviceCharge && (
            <div className="flex justify-between text-muted-foreground"><span>Service ({serviceChargePct}%)</span><span>₹{sc.toFixed(2)}</span></div>
          )}
          <hr className="border-dashed my-2" />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
