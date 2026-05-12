import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/utils';

const AdminSalesChart: React.FC = () => {
  const { orders, settings } = useApp();

  // Generate last 7 days of data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Sum orders for this day
    const dayTotal = orders
      .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + o.total, 0);

    return {
      name: dateStr,
      sales: dayTotal
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-800 text-xs">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-primary" style={{ color: settings.primaryColor }}>
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full bg-white rounded-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={settings.primaryColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={settings.primaryColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
             dataKey="name" 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
             dy={10}
          />
          <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
             tickFormatter={(val) => `৳${val/1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke={settings.primaryColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminSalesChart;
