import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, UserMinus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PinLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchUser: () => void;
}

export function PinLoginModal({ open, onClose, onSwitchUser }: PinLoginModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { signInWithPin, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Enter 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signInWithPin(pin);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setPin('');
    } else {
      setPin('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-lg">Session Locked</DialogTitle>
          <DialogDescription>
            {profile?.name ? `Hi ${profile.name}, enter your PIN to continue` : 'Enter your PIN to unlock'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-2 text-center text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-center gap-3 cursor-text" onClick={() => inputRef.current?.focus()}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                  pin[i]
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                {pin[i] ? '•' : ''}
              </div>
            ))}
          </div>

          <Input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="opacity-0 absolute h-0 w-0 -z-10"
            autoFocus
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading || pin.length < 4}>
              Unlock
            </Button>
            <Button type="button" variant="outline" onClick={onSwitchUser} className="gap-1.5">
              <UserMinus className="h-4 w-4" /> Switch User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
