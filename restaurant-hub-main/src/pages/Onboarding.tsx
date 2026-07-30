import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepRestaurantProfile } from '@/components/onboarding/StepRestaurantProfile';
import { StepLocation } from '@/components/onboarding/StepLocation';
import { StepFloorTables } from '@/components/onboarding/StepFloorTables';
import { StepMenuSetup } from '@/components/onboarding/StepMenuSetup';
import { StepTaxCharges } from '@/components/onboarding/StepTaxCharges';
import { StepPrinterSetup } from '@/components/onboarding/StepPrinterSetup';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const STEPS = [
  'Restaurant Profile',
  'Location & Legal',
  'Floor & Tables',
  'Menu Setup',
  'Tax & Charges',
  'Printer Setup',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const updateData = (stepData: Record<string, any>) => {
    setData((prev) => ({ ...prev, ...stepData }));
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const finish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated. Please log in.');

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .single();

      if (profileErr) throw profileErr;
      const restaurantId = profile?.restaurant_id;
      if (!restaurantId) throw new Error('Restaurant ID not found on user profile.');

      // 1. Delete and Insert floors & tables
      const { error: delTablesErr } = await supabase.from('tables').delete().eq('restaurant_id', restaurantId);
      if (delTablesErr) throw delTablesErr;
      const { error: delFloorsErr } = await supabase.from('floors').delete().eq('restaurant_id', restaurantId);
      if (delFloorsErr) throw delFloorsErr;

      if (data.floors && Array.isArray(data.floors)) {
        for (let idx = 0; idx < data.floors.length; idx++) {
          const floor = data.floors[idx];
          const { data: floorData, error: floorErr } = await supabase
            .from('floors')
            .insert({
              restaurant_id: restaurantId,
              name: floor.name,
              display_order: idx,
              is_active: true
            })
            .select()
            .single();

          if (floorErr) throw floorErr;

          if (floor.tables && Array.isArray(floor.tables) && floor.tables.length > 0) {
            const tablesToInsert = floor.tables.map((t: any) => ({
              floor_id: floorData.id,
              restaurant_id: restaurantId,
              number: t.number,
              capacity: Number(t.capacity),
              shape: t.shape,
              status: 'available'
            }));
            const { error: tablesErr } = await supabase.from('tables').insert(tablesToInsert);
            if (tablesErr) throw tablesErr;
          }
        }
      }

      // 2. Delete and Insert menu categories & items
      const { error: delItemsErr } = await supabase.from('menu_items').delete().eq('restaurant_id', restaurantId);
      if (delItemsErr) throw delItemsErr;
      const { error: delCatsErr } = await supabase.from('menu_categories').delete().eq('restaurant_id', restaurantId);
      if (delCatsErr) throw delCatsErr;

      if (data.categories && Array.isArray(data.categories)) {
        for (let catIdx = 0; catIdx < data.categories.length; catIdx++) {
          const cat = data.categories[catIdx];
          const { data: catData, error: catErr } = await supabase
            .from('menu_categories')
            .insert({
              restaurant_id: restaurantId,
              name: cat.name,
              type: cat.type || 'both',
              display_order: catIdx,
              is_active: true
            })
            .select()
            .single();

          if (catErr) throw catErr;

          if (data.menuItems && Array.isArray(data.menuItems)) {
            const itemsToInsert = data.menuItems
              .filter((item: any) => item.categoryId === cat.id)
              .map((item: any) => ({
                category_id: catData.id,
                restaurant_id: restaurantId,
                name: item.name,
                price: Number(item.price),
                base_price: Number(item.price),
                item_type: item.itemType || 'Veg',
                is_available: true,
                description: item.description || ''
              }));

            if (itemsToInsert.length > 0) {
              const { error: itemsErr } = await supabase.from('menu_items').insert(itemsToInsert);
              if (itemsErr) throw itemsErr;
            }
          }
        }
      }

      // 3. Upsert tax config
      const { error: taxErr } = await supabase.from('tax_config').upsert({
        restaurant_id: restaurantId,
        service_charge_enabled: !!data.serviceCharge,
        service_charge_pct: Number(data.serviceChargePct || 0),
        packaging_charge: Number(data.packagingCharge || 0),
        round_off: data.roundOff || 'nearest'
      });
      if (taxErr) throw taxErr;

      // 4. Delete and Insert printers
      const { error: delPrintersErr } = await supabase.from('printers').delete().eq('restaurant_id', restaurantId);
      if (delPrintersErr) throw delPrintersErr;

      if (data.printers && Array.isArray(data.printers) && data.printers.length > 0) {
        const printersToInsert = data.printers.map((p: any) => ({
          restaurant_id: restaurantId,
          name: p.name,
          type: p.type.toLowerCase(),
          connection: p.connection,
          ip_address: p.ipAddress || null,
          paper_width: p.paperWidth,
          is_default: !!p.isDefault,
          has_cash_drawer: !!p.hasCashDrawer
        }));
        const { error: printersErr } = await supabase.from('printers').insert(printersToInsert);
        if (printersErr) throw printersErr;
      }

      // 5. Update restaurant profile details and mark onboarding complete
      const { error: restErr } = await supabase
        .from('restaurants')
        .update({
          name: data.name,
          type: data.type,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          instagram: data.instagram || null,
          facebook: data.facebook || null,
          address_1: data.address_1 || null,
          address_2: data.address_2 || null,
          city: data.city || null,
          state: data.state || null,
          pin: data.pin || null,
          gstin: data.gstin || null,
          fssai: data.fssai || null,
          pan: data.pan || null,
          onboarding_complete: true
        })
        .eq('id', restaurantId);

      if (restErr) throw restErr;

      toast.success('Restaurant setup completed successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const stepComponents = [
    <StepRestaurantProfile data={data} onUpdate={updateData} />,
    <StepLocation data={data} onUpdate={updateData} />,
    <StepFloorTables data={data} onUpdate={updateData} />,
    <StepMenuSetup data={data} onUpdate={updateData} />,
    <StepTaxCharges data={data} onUpdate={updateData} />,
    <StepPrinterSetup data={data} onUpdate={updateData} />,
  ];

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Restaurant Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {currentStep + 1} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < currentStep
                  ? 'bg-success text-success-foreground'
                  : i === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 w-8 md:w-16 ${
                  i < currentStep ? 'bg-success' : 'bg-muted-foreground/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-card-foreground">{STEPS[currentStep]}</h2>
          {stepComponents[currentStep]}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0 || loading}>
              Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={next} disabled={loading}>Next Step</Button>
            ) : (
              <Button onClick={finish} disabled={loading} className="bg-success text-success-foreground hover:bg-success/90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

