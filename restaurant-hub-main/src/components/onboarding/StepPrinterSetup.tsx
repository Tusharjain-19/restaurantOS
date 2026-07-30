import { useState } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface PrinterConfig {
  id: string; name: string; type: string; connection: string;
  ipAddress: string; paperWidth: string; isDefault: boolean; hasCashDrawer: boolean;
}

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

let pc = 0;
const uid = () => `p${++pc}`;

export function StepPrinterSetup({ data, onUpdate }: Props) {
  const [printers, setPrinters] = useState<PrinterConfig[]>(data.printers ?? [
    { id: uid(), name: 'Main Bill Printer', type: 'Bill', connection: 'LAN', ipAddress: '192.168.1.100', paperWidth: '80mm', isDefault: true, hasCashDrawer: true },
    { id: uid(), name: 'Kitchen Printer', type: 'KOT', connection: 'LAN', ipAddress: '192.168.1.101', paperWidth: '80mm', isDefault: false, hasCashDrawer: false },
  ]);

  const save = (updated: PrinterConfig[]) => { setPrinters(updated); onUpdate({ printers: updated }); };

  const addPrinter = () => {
    save([...printers, { id: uid(), name: 'New Printer', type: 'Bill', connection: 'USB', ipAddress: '', paperWidth: '80mm', isDefault: false, hasCashDrawer: false }]);
  };

  const updatePrinter = (id: string, key: keyof PrinterConfig, value: any) => {
    const updated = printers.map((p) => p.id === id ? { ...p, [key]: value } : p);
    save(updated);
  };

  const removePrinter = (id: string) => save(printers.filter((p) => p.id !== id));

  return (
    <div className="space-y-4">
      {printers.map((printer) => (
        <div key={printer.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <Input
                value={printer.name}
                onChange={(e) => updatePrinter(printer.id, 'name', e.target.value)}
                className="max-w-[200px] font-medium"
              />
              {printer.isDefault && <Badge className="bg-success/10 text-success text-[10px]">Default</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => alert('Test print sent!')}>Test Print</Button>
              <button onClick={() => removePrinter(printer.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={printer.type} onValueChange={(v) => updatePrinter(printer.id, 'type', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Bill', 'KOT', 'Bar', 'Label'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Connection</Label>
              <Select value={printer.connection} onValueChange={(v) => updatePrinter(printer.id, 'connection', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['USB', 'LAN', 'Bluetooth', 'Cloud Print'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {printer.connection === 'LAN' && (
              <div className="space-y-1">
                <Label className="text-xs">IP Address</Label>
                <Input value={printer.ipAddress} onChange={(e) => updatePrinter(printer.id, 'ipAddress', e.target.value)} className="h-9" placeholder="192.168.1.x" />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Paper Width</Label>
              <Select value={printer.paperWidth} onValueChange={(v) => updatePrinter(printer.id, 'paperWidth', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="57mm">57mm</SelectItem>
                  <SelectItem value="80mm">80mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={printer.isDefault} onCheckedChange={(v) => updatePrinter(printer.id, 'isDefault', v)} />
              <Label className="text-xs">Default Printer</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={printer.hasCashDrawer} onCheckedChange={(v) => updatePrinter(printer.id, 'hasCashDrawer', v)} />
              <Label className="text-xs">Cash Drawer</Label>
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addPrinter}>
        <Plus className="mr-1 h-4 w-4" /> Add Printer
      </Button>
    </div>
  );
}
