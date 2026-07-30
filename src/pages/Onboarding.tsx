import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepRestaurantProfile } from '@/components/onboarding/StepRestaurantProfile';
import { StepLocation } from '@/components/onboarding/StepLocation';
import { StepFloorTables } from '@/components/onboarding/StepFloorTables';
import { StepMenuSetup } from '@/components/onboarding/StepMenuSetup';
import { StepTaxCharges } from '@/components/onboarding/StepTaxCharges';
import { StepPrinterSetup } from '@/components/onboarding/StepPrinterSetup';

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

  const updateData = (stepData: Record<string, any>) => {
    setData((prev) => ({ ...prev, ...stepData }));
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };
  const finish = () => navigate('/dashboard');

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
            <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
              Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={next}>Next Step</Button>
            ) : (
              <Button onClick={finish} className="bg-success text-success-foreground hover:bg-success/90">
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
