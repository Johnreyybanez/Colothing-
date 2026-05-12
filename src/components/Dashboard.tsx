import { BarChart3, TrendingUp, Users, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Product, Sale } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

export const Dashboard = ({ products, sales }: DashboardProps) => {
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalSalesCount = sales.length;
  const lowStockVariants = products.flatMap(p => 
    p.variants.filter(v => v.stock < 5).map(v => ({ ...v, productName: p.name }))
  );

  const stats = [
    { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', trend: '+12.5%' },
    { label: 'Total Sales', value: totalSalesCount, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+5.2%' },
    { label: 'Products', value: products.length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100', trend: '0%' },
    { label: 'Low Stock Items', value: lowStockVariants.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', trend: '-2.4%' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Business performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Recent Sales
          </h3>
          <div className="space-y-6">
            {sales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-gray-400">
                    S
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Sale #{sale.id.slice(0, 6)}</p>
                    <p className="text-xs text-gray-400">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">₱{sale.total}</p>
                  <p className="text-xs text-gray-400">{sale.items.length} items</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-center text-gray-400 py-10">No sales recorded yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Low Stock Alerts
          </h3>
          <div className="space-y-4">
            {lowStockVariants.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <div>
                  <p className="font-bold text-red-900">{v.productName}</p>
                  <p className="text-xs text-red-700">{v.color} - {v.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600">{v.stock} units left</p>
                  <button className="text-[10px] uppercase font-bold text-indigo-600 hover:underline">Reorder</button>
                </div>
              </div>
            ))}
            {lowStockVariants.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-green-500 opacity-60">
                <TrendingUp size={48} className="mb-2" />
                <p>All items are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
