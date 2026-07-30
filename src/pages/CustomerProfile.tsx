import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Crown, Award, Phone, Mail, MapPin, Calendar, Edit2, Ban, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { db, type Customer } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/lib/utils';

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; gradient: string }> = {
  bronze: { label: 'Bronze', icon: Award, color: 'text-amber-700', bg: 'bg-amber-100', gradient: 'from-amber-500 to-amber-700' },
  silver: { label: 'Silver', icon: Star, color: 'text-gray-500', bg: 'bg-gray-100', gradient: 'from-gray-400 to-gray-600' },
  gold: { label: 'Gold', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-400 to-yellow-600' },
  platinum: { label: 'Platinum', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-500 to-purple-700' },
};

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useLiveQuery(() => db.customers.get(Number(id)), [id]);
  const orders = useLiveQuery(() => db.orders.where('customer_phone').equals(customer?.phone || '').toArray(), [customer?.phone]);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [showPoints, setShowPoints] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);

  if (!customer) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Customer not found</p>
        <Button variant="outline" className="mt-2" onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[customer.tier] || TIER_CONFIG.bronze;
  const TierIcon = tierConfig.icon;

  const saveEdit = async () => {
    await db.customers.update(customer.id!, editForm);
    setShowEdit(false);
    toast.success('Profile updated');
  };

  const addPoints = async () => {
    if (pointsToAdd <= 0) return;
    const newPoints = customer.loyalty_points + pointsToAdd;
    let newTier = customer.tier;
    if (newPoints >= 5000) newTier = 'platinum';
    else if (newPoints >= 2000) newTier = 'gold';
    else if (newPoints >= 500) newTier = 'silver';
    await db.customers.update(customer.id!, { loyalty_points: newPoints, tier: newTier });
    setShowPoints(false);
    setPointsToAdd(0);
    toast.success(`${pointsToAdd} points added!`);
  };

  const toggleBlacklist = async () => {
    await db.customers.update(customer.id!, { is_blacklisted: !customer.is_blacklisted });
    toast.success(customer.is_blacklisted ? 'Customer unblocked' : 'Customer blacklisted');
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/customers')} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={cn("text-white text-2xl font-bold bg-gradient-to-br", tierConfig.gradient)}>
                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
                <Badge className={cn("gap-1", tierConfig.bg, tierConfig.color)} variant="outline">
                  <TierIcon className="h-3.5 w-3.5" /> {tierConfig.label}
                </Badge>
                {customer.is_blacklisted && <Badge variant="destructive">Blocked</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer.phone}</span>
                {customer.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email}</span>}
                {customer.address && <span className="flex items-center gap-1 max-w-xs truncate"><MapPin className="h-3.5 w-3.5" />{customer.address}</span>}
              </div>
              {customer.birthday && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Birthday: {new Date(customer.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditForm(customer); setShowEdit(true); }} className="gap-1">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPoints(true)} className="gap-1">
                <Gift className="h-3.5 w-3.5" /> Add Points
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleBlacklist} className={cn("gap-1", customer.is_blacklisted ? "text-success" : "text-destructive")}>
                <Ban className="h-3.5 w-3.5" /> {customer.is_blacklisted ? 'Unblock' : 'Block'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{customer.loyalty_points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Loyalty Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{customer.total_spend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Spend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{customer.total_visits}</p>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-6 w-6 text-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">₹{customer.total_visits > 0 ? Math.round(customer.total_spend / customer.total_visits) : 0}</p>
            <p className="text-xs text-muted-foreground">Avg per Visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Tier Progress */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Loyalty Tier Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            {Object.entries(TIER_CONFIG).map(([tier, config]) => {
              const thresholds: Record<string, number> = { bronze: 0, silver: 500, gold: 2000, platinum: 5000 };
              const isActive = customer.tier === tier;
              const isPast = thresholds[tier] <= thresholds[customer.tier];
              return (
                <div key={tier} className="flex-1 text-center">
                  <div className={cn("h-8 w-8 rounded-full mx-auto mb-1 flex items-center justify-center",
                    isActive ? `bg-gradient-to-br ${config.gradient} text-white` :
                    isPast ? config.bg : 'bg-muted'
                  )}>
                    <config.icon className={cn("h-4 w-4", isActive ? 'text-white' : isPast ? config.color : 'text-muted-foreground')} />
                  </div>
                  <p className={cn("text-xs font-medium", isActive ? config.color : 'text-muted-foreground')}>{config.label}</p>
                  <p className="text-[10px] text-muted-foreground">{thresholds[tier]}+ pts</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Order History</CardTitle></CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 10).map(o => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                  <div>
                    <span className="font-medium text-foreground">{o.order_number}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{o.order_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-foreground">₹{o.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Email</Label><Input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Address</Label><Input value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Notes</Label><Input value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={saveEdit}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog open={showPoints} onOpenChange={setShowPoints}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Loyalty Points</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <p className="text-xs text-muted-foreground">Current Points</p>
              <p className="text-3xl font-bold text-primary">{customer.loyalty_points}</p>
            </div>
            <div className="space-y-1">
              <Label>Points to Add</Label>
              <Input type="number" min={1} value={pointsToAdd || ''} onChange={e => setPointsToAdd(Number(e.target.value))} placeholder="Enter points" />
            </div>
            <p className="text-xs text-muted-foreground">New balance: {customer.loyalty_points + pointsToAdd} points</p>
          </div>
          <DialogFooter><Button onClick={addPoints} disabled={pointsToAdd <= 0}>Add Points</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
