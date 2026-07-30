import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface PinLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchUser: () => void;
}

export function PinLoginModal({ open, onClose, onSwitchUser }: PinLoginModalProps) {
  const { profile } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length === 4) {
      // In production, verify against pin_hash
      setTimeout(() => {
        setPin('');
        onClose();
      }, 500);
    }
  }, [pin, onClose]);

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  useEffect(() => {
    if (!open) setPin('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Quick PIN Login</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg">
            {profile?.name?.charAt(0) ?? 'U'}
          </div>
          <span className="font-medium text-card-foreground">{profile?.name ?? 'User'}</span>
        </div>

        <div className="mb-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}
            />
          ))}
        </div>

        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === '⌫') handleDelete();
                else if (key) handleDigit(key);
              }}
              disabled={!key}
              className={`flex h-14 items-center justify-center rounded-lg text-xl font-medium transition-colors ${
                key
                  ? 'bg-secondary text-secondary-foreground hover:bg-muted active:bg-primary active:text-primary-foreground'
                  : ''
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <Button variant="ghost" className="mt-4 w-full text-destructive" onClick={onSwitchUser}>
          Reset App Data
        </Button>
      </div>
    </div>
  );
}
