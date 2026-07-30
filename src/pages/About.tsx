import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, LayoutDashboard, UtensilsCrossed, Table, Package, Users, BarChart3, Settings, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Real-time Order Management",
      icon: <UtensilsCrossed className="h-6 w-6 text-zinc-950" />,
      desc: "Manage dine-in, takeaway, and delivery orders from a single screen. Track live status from 'Pending' to 'Served' and 'Billed'.",
      details: ["Instant KOT generation", "Order modification history", "Automated split-billing", "Discount & tax handling"]
    },
    {
      title: "Kitchen Display System (KDS)",
      icon: <LayoutDashboard className="h-6 w-6 text-zinc-950" />,
      desc: "Instant routing of Kitchen Order Tickets (KOT) to relevant sections. No more paper confusion or lost orders.",
      details: ["Color-coded delay alerts", "Item-wise preparation status", "Section-wise routing", "Kitchen performance analytics"]
    },
    {
      title: "Table & Floor Management",
      icon: <Table className="h-6 w-6 text-zinc-950" />,
      desc: "Visual interactive floor plan with real-time occupancy tracking. Optimize guest flow and seating efficiency.",
      details: ["Table reservation system", "Live occupancy timer", "Visual table status (Free, Occupied, Billed)", "Table merging for large groups"]
    },
    {
      title: "Inventory & Stock Control",
      icon: <Package className="h-6 w-6 text-zinc-950" />,
      desc: "Ingredient-level tracking linked to your menu. Get notified before you run out of essential items.",
      details: ["Low stock notifications", "Automated reordering", "Vendor management", "Waste tracking & cost analysis"]
    },
    {
      title: "Staff & Role Management",
      icon: <Users className="h-6 w-6 text-zinc-950" />,
      desc: "Control who sees what. Secure access for admins, managers, captains, and kitchen staff with role-based permissions.",
      details: ["PIN-based quick access", "Performance tracking", "Attendance logging", "Permission control panel"]
    },
    {
      title: "Advanced Reporting & Analytics",
      icon: <BarChart3 className="h-6 w-6 text-zinc-950" />,
      desc: "Data-driven insights into your restaurant's health. Monitor sales, peak hours, and popular items in real-time.",
      details: ["Daily sales summaries", "Historical data analysis", "Best-selling items report", "Staff productivity metrics"]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-950">RestaurantOS Guide</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-zinc-950 text-white hover:bg-zinc-900"
          >
            Go to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-bold text-zinc-950 tracking-tight">The Unified Dining Ecosystem.</h1>
          <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">
            RestaurantOS is more than just a POS—it's a comprehensive platform designed to elevate 
            operational efficiency and guest experiences in modern restaurants.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-3">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Usage Guide */}
        <div className="bg-zinc-950 rounded-[2.5rem] p-12 md:p-20 text-white overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Quick Start Guide</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Get up and running with RestaurantOS in minutes. Follow these simple steps to 
                  experience the full power of the platform.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { step: "01", title: "Login via Demo", text: "Use the 'Try Demo Account' button on the login screen for instant access without registration." },
                  { step: "02", title: "Set Up Tables", text: "Go to Table Management to define your floor plan and active dining areas." },
                  { step: "03", title: "Configure Menu", text: "Add your categories, items, and modifiers in the Settings panel." },
                  { step: "04", title: "Start Service", text: "Head to POS to take orders and watch them sync live across all devices." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-3xl font-black text-white/20 group-hover:text-white/40 transition-colors">{item.step}</span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold">Security & Reliability</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-sm mb-1 text-zinc-300 uppercase tracking-widest">Offline-First</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Orders are saved locally first, ensuring service never stops even if the internet goes down.
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-sm mb-1 text-zinc-300 uppercase tracking-widest">Real-time Sync</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Data is instantly synchronized with Supabase cloud whenever a connection is available.
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-sm mb-1 text-zinc-300 uppercase tracking-widest">Encrypted Auth</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    All staff access is protected by industry-standard encryption and secure PIN codes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="text-center mt-32 space-y-6">
          <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-zinc-950" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-950">Need further assistance?</h2>
          <p className="text-zinc-500">Our support team and project leads are ready to help you optimize your workflow.</p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => window.location.href = 'mailto:jaint0910@gmail.com'}
              className="bg-zinc-950 text-white h-12 px-8 rounded-xl font-bold"
            >
              Contact Support
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="h-12 px-8 rounded-xl font-bold border-zinc-200"
            >
              Back to App
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-400 text-sm font-medium">
          © 2026 RestaurantOS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
