import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Medal, Award, Star, Gift, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

const TIER_CONFIG: Record<Tier, { label: string; color: string; icon: typeof Crown; next: string; nextAt: number }> = {
  bronze: { label: 'Bronze', color: 'bg-amber-700/20 text-amber-700', icon: Medal, next: 'Silver', nextAt: 500 },
  silver: { label: 'Silver', color: 'bg-gray-400/20 text-gray-600', icon: Award, next: 'Gold', nextAt: 2000 },
  gold: { label: 'Gold', color: 'bg-yellow-500/20 text-yellow-700', icon: Star, next: 'Platinum', nextAt: 5000 },
  platinum: { label: 'Platinum', color: 'bg-purple-500/20 text-purple-700', icon: Crown, next: '', nextAt: 0 },
};

const MOCK_CUSTOMER = {
  id: 'c1', name: 'Priya Sharma', phone: '9876543210', email: 'priya@email.com',
  birthday: '1990-03-15', tier: 'platinum' as Tier, total_points: 6200,
  total_visits: 48, total_spent: 72400, member_since: '2024-06-10',
  preferences: { dietary: 'Non-Veg', seating: 'Window', allergies: 'None' },
  favorite_items: ['Paneer Tikka', 'Butter Chicken', 'Masala Chai'],
};

const MOCK_VISITS = [
  { date: '2026-04-09', bill: '#1247', items: 'Paneer Tikka, Naan x2, Chai', amount: 680, payment: 'UPI', points: 68 },
  { date: '2026-04-05', bill: '#1198', items: 'Butter Chicken, Rice, Raita', amount: 520, payment: 'Cash', points: 52 },
  { date: '2026-03-30', bill: '#1142', items: 'Thali, Lassi', amount: 350, payment: 'Card', points: 35 },
  { date: '2026-03-22', bill: '#1089', items: 'Biryani, Kebab Platter', amount: 890, payment: 'UPI', points: 89 },
  { date: '2026-03-15', bill: '#1034', items: 'Pizza, Pasta, Mocktail x2', amount: 1200, payment: 'Card', points: 120 },
];

const MOCK_POINTS_LOG = [
  { date: '2026-04-09', type: 'earn', points: 68, balance: 6200, reason: 'Bill #1247' },
  { date: '2026-04-05', type: 'earn', points: 52, balance: 6132, reason: 'Bill #1198' },
  { date: '2026-04-01', type: 'redeem', points: -200, balance: 6080, reason: 'Redeemed ₹50 discount' },
  { date: '2026-03-30', type: 'earn', points: 35, balance: 6280, reason: 'Bill #1142' },
  { date: '2026-03-22', type: 'earn', points: 89, balance: 6245, reason: 'Bill #1089' },
  { date: '2026-03-15', type: 'adjust', points: 500, balance: 6156, reason: 'Birthday bonus' },
];

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = MOCK_CUSTOMER;
  const tier = TIER_CONFIG[c.tier];
  const TierIcon = tier.icon;
  const avgBill = Math.round(c.total_spent / c.total_visits);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Customers
      </Button>

      {/* Header */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {c.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{c.name}</h1>
              <Badge className={cn('text-xs', tier.color)}><TierIcon className="h-3 w-3 mr-0.5" /> {tier.label}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{c.phone} • {c.email}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Member since {c.member_since}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { icon: Calendar, label: 'Total Visits', value: c.total_visits },
            { icon: CreditCard, label: 'Total Spent', value: `₹${c.total_spent.toLocaleString()}` },
            { icon: Gift, label: 'Points Balance', value: c.total_points.toLocaleString() },
            { icon: TrendingUp, label: 'Avg Bill', value: `₹${avgBill}` },
          ].map(s => (
            <div key={s.label} className="rounded-lg bg-muted/50 p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="points">Loyalty Points</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="comms">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="rounded-lg border bg-card mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_VISITS.map((v, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{v.date}</TableCell>
                  <TableCell className="font-medium">{v.bill}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{v.items}</TableCell>
                  <TableCell>₹{v.amount}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{v.payment}</Badge></TableCell>
                  <TableCell className="text-success font-medium">+{v.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="points" className="space-y-4 mt-2">
          <div className="rounded-lg border bg-card p-5 text-center">
            <div className="text-xs text-muted-foreground">Points Balance</div>
            <div className="text-4xl font-bold text-foreground">{c.total_points.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Worth ₹{(c.total_points * 0.25).toLocaleString()} in discounts</div>
            <div className="text-[10px] text-muted-foreground">Earning rate: 10 pts per ₹100 spent • Redemption: 1 pt = ₹0.25</div>
            <Button size="sm" className="mt-3"><Gift className="h-3.5 w-3.5 mr-1" /> Redeem Points</Button>
          </div>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_POINTS_LOG.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{p.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px]',
                        p.type === 'earn' ? 'bg-success/10 text-success' :
                        p.type === 'redeem' ? 'bg-destructive/10 text-destructive' :
                        'bg-primary/10 text-primary'
                      )}>{p.type}</Badge>
                    </TableCell>
                    <TableCell className={cn('font-medium', p.points > 0 ? 'text-success' : 'text-destructive')}>
                      {p.points > 0 ? '+' : ''}{p.points}
                    </TableCell>
                    <TableCell>{p.balance}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-2">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Dietary Preferences</div>
              <div className="flex gap-2">
                {['Vegetarian', 'Non-Veg', 'Vegan', 'Jain'].map(d => (
                  <Badge key={d} variant={c.preferences.dietary === d ? 'default' : 'outline'} className="cursor-pointer">{d}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-1">Allergies</div>
              <div className="text-sm text-muted-foreground">{c.preferences.allergies || 'None reported'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-1">Seating Preference</div>
              <div className="text-sm text-muted-foreground">{c.preferences.seating || 'No preference'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Favorite Items (auto-detected)</div>
              <div className="flex gap-2">
                {c.favorite_items.map(item => (
                  <Badge key={item} variant="secondary">{item}</Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comms" className="mt-2">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">WhatsApp Opt-in</div>
                <div className="text-xs text-muted-foreground">Receive bills and offers via WhatsApp</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">SMS Opt-in</div>
                <div className="text-xs text-muted-foreground">Receive SMS notifications</div>
              </div>
              <Switch />
            </div>
            <div className="border-t pt-3">
              <div className="text-sm font-medium text-foreground mb-2">Recent Communications</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Bill #1247 sent via WhatsApp</span><span>09 Apr 2026</span></div>
                <div className="flex justify-between"><span>Birthday offer sent via SMS</span><span>15 Mar 2026</span></div>
                <div className="flex justify-between"><span>Bill #1034 sent via WhatsApp</span><span>15 Mar 2026</span></div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
