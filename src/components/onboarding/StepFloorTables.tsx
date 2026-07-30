import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Floor { id: string; name: string; tables: TableItem[]; }
interface TableItem { id: string; number: string; capacity: number; shape: string; }

interface Props {
  data: Record<string, any>;
  onUpdate: (d: Record<string, any>) => void;
}

let idCounter = 0;
const uid = () => `t${++idCounter}`;

export function StepFloorTables({ data, onUpdate }: Props) {
  const [floors, setFloors] = useState<Floor[]>(data.floors ?? [
    { id: uid(), name: 'Main Hall', tables: [
      { id: uid(), number: '1', capacity: 4, shape: 'square' },
      { id: uid(), number: '2', capacity: 4, shape: 'square' },
      { id: uid(), number: '3', capacity: 2, shape: 'round' },
      { id: uid(), number: '4', capacity: 6, shape: 'rectangle' },
    ]},
    { id: uid(), name: 'Terrace', tables: [
      { id: uid(), number: '5', capacity: 4, shape: 'round' },
      { id: uid(), number: '6', capacity: 8, shape: 'rectangle' },
    ]},
  ]);

  const save = (updated: Floor[]) => { setFloors(updated); onUpdate({ floors: updated }); };

  const addFloor = () => {
    save([...floors, { id: uid(), name: `Area ${floors.length + 1}`, tables: [] }]);
  };

  const addTable = (floorIdx: number) => {
    const updated = [...floors];
    const totalTables = floors.reduce((a, f) => a + f.tables.length, 0);
    updated[floorIdx].tables.push({ id: uid(), number: `${totalTables + 1}`, capacity: 4, shape: 'square' });
    save(updated);
  };

  const quickAdd = (floorIdx: number) => {
    const updated = [...floors];
    let total = floors.reduce((a, f) => a + f.tables.length, 0);
    for (let i = 0; i < 10; i++) {
      updated[floorIdx].tables.push({ id: uid(), number: `${++total}`, capacity: 4, shape: 'square' });
    }
    save(updated);
  };

  const removeTable = (fi: number, ti: number) => {
    const updated = [...floors];
    updated[fi].tables.splice(ti, 1);
    save(updated);
  };

  const removeFloor = (fi: number) => {
    const updated = [...floors];
    updated.splice(fi, 1);
    save(updated);
  };

  const shapeColors: Record<string, string> = {
    square: 'bg-primary/20 text-primary',
    round: 'bg-accent/20 text-accent',
    rectangle: 'bg-success/20 text-success',
  };

  return (
    <div className="space-y-6">
      {floors.map((floor, fi) => (
        <div key={floor.id} className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <Input
              value={floor.name}
              onChange={(e) => {
                const u = [...floors];
                u[fi].name = e.target.value;
                save(u);
              }}
              className="max-w-xs font-semibold"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => quickAdd(fi)}>+ 10 Tables</Button>
              <Button variant="ghost" size="sm" onClick={() => removeFloor(fi)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {floor.tables.map((table, ti) => (
              <div
                key={table.id}
                className={`group relative flex h-16 flex-col items-center justify-center rounded-lg text-xs font-medium ${shapeColors[table.shape] ?? shapeColors.square} ${table.shape === 'round' ? 'rounded-full' : ''}`}
              >
                <span className="font-bold">T{table.number}</span>
                <span className="text-[10px] opacity-70">{table.capacity} seats</span>
                <button
                  onClick={() => removeTable(fi, ti)}
                  className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground group-hover:flex"
                >×</button>
              </div>
            ))}
            <button
              onClick={() => addTable(fi)}
              className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addFloor}>
        <Plus className="mr-1 h-4 w-4" /> Add Floor / Area
      </Button>
    </div>
  );
}
