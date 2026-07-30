import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

const revenueData = [
  { time: '10AM', revenue: 3200 }, { time: '11AM', revenue: 5100 },
  { time: '12PM', revenue: 8400 }, { time: '1PM', revenue: 9200 },
  { time: '2PM', revenue: 6800 }, { time: '3PM', revenue: 4200 },
  { time: '4PM', revenue: 3600 }, { time: '5PM', revenue: 5400 },
  { time: '6PM', revenue: 7800 }, { time: '7PM', revenue: 9600 },
];

const orderData = [
  { day: 'Mon', dine: 45, delivery: 22, takeaway: 15 },
  { day: 'Tue', dine: 52, delivery: 28, takeaway: 18 },
  { day: 'Wed', dine: 48, delivery: 25, takeaway: 12 },
  { day: 'Thu', dine: 61, delivery: 30, takeaway: 20 },
  { day: 'Fri', dine: 72, delivery: 35, takeaway: 25 },
  { day: 'Sat', dine: 85, delivery: 40, takeaway: 30 },
  { day: 'Sun', dine: 78, delivery: 38, takeaway: 28 },
];

export default function DashboardCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-sm">Today's Revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Weekly Orders by Type</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="dine" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
              <Bar dataKey="delivery" fill="hsl(var(--accent))" radius={[2,2,0,0]} />
              <Bar dataKey="takeaway" fill="hsl(var(--success))" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
