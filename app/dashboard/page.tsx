'use client';

import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { dailyMetrics, topProducts, categorySales } from '@/lib/data/analytics';
import { orders } from '@/lib/data/orders';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCompany } from '@/lib/context/CompanyContext';
import { Button } from '@/components/ui/button';

function DashboardContent() {
  const { companyName, setCompanyName } = useCompany();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(companyName);
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = dailyMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalOrders = dailyMetrics.reduce((sum, m) => sum + m.orders, 0);
    const totalCustomers = dailyMetrics.reduce((sum, m) => sum + m.customers, 0);
    const avgOrderValue = totalRevenue / totalOrders;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      revenueGrowth: 12.5,
      ordersGrowth: 8.2,
      customersGrowth: 15.3,
    };
  }, []);

  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  const handleSaveCompanyName = () => {
    if (tempName.trim()) {
      setCompanyName(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your sales, revenue, and customer metrics in real-time.
            </p>
          </div>
          <div className="hidden md:block">
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Company name"
                />
                <Button
                  onClick={handleSaveCompanyName}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingName(false);
                    setTempName(companyName);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditingName(true)}
                variant="outline"
                size="sm"
              >
                Edit Company Name: {companyName}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${(metrics.totalRevenue / 1000).toFixed(1)}K`}
              change={metrics.revenueGrowth}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatCard
              title="Total Orders"
              value={metrics.totalOrders}
              change={metrics.ordersGrowth}
              icon={<ShoppingCart className="h-6 w-6" />}
            />
            <StatCard
              title="Total Customers"
              value={metrics.totalCustomers}
              change={metrics.customersGrowth}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Avg Order Value"
              value={`$${metrics.avgOrderValue.toFixed(2)}`}
              change={5.8}
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders & Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Orders */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Daily Orders</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Top Products</h2>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">${product.revenue.toFixed(2)} revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{product.sales}</p>
                      <p className="text-xs text-muted-foreground">units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.customer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed'
                              ? 'bg-accent/10 text-accent'
                              : order.status === 'shipped'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardContent />
    </ProtectedRoute>
  );
}
