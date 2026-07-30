import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronRight } from 'lucide-react';

export default function WaiterProfile() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (profile?.name ?? 'W').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div>
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center">
        <h1 className="text-base font-bold">My profile</h1>
      </header>
      <div className="p-4 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold">{profile?.name ?? '—'}</div>
            <div className="text-xs text-muted-foreground capitalize">{profile?.role ?? 'staff'}</div>
            <div className="text-[11px] text-muted-foreground">{profile?.email}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <Row label="Connection" right={<span className="flex items-center gap-1.5 text-success text-xs"><span className="h-2 w-2 rounded-full bg-success" />Online</span>} />
          <Row label="App version" right={<span className="text-xs text-muted-foreground">1.0.0</span>} />
        </div>

        <Button onClick={handleLogout} variant="destructive" className="w-full h-12">
          <LogOut className="h-4 w-4 mr-2" />Log out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 h-12">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1.5">{right}</div>
    </div>
  );
}
