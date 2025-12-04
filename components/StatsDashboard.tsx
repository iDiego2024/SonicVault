import React, { useMemo } from 'react';
import { Album } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface StatsProps {
  albums: Album[];
}

export const StatsDashboard: React.FC<StatsProps> = ({ albums }) => {
  
  const ratingData = useMemo(() => {
    const domain = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'];
    const counts: Record<string, number> = {};
    domain.forEach(r => counts[r] = 0);
    
    albums.forEach(a => {
      if (a.rating !== null) {
        const rStr = a.rating.toString();
        if (counts[rStr] !== undefined) {
          counts[rStr]++;
        }
      }
    });

    return domain.map(k => ({ name: k, value: counts[k] }));
  }, [albums]);

  const ownershipData = useMemo(() => {
    const counts: Record<string, number> = {};
    albums.forEach(a => {
      const type = a.ownership || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [albums]);

  // Neon Palette
  const COLORS = ['#22d3ee', '#818cf8', '#e879f9', '#f472b6', '#34d399', '#facc15'];

  if (albums.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
      {/* Rating Chart */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <BarChart3 size={64} className="text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-6 flex items-center gap-2">
          Rating Distribution
        </h3>
        <div className="h-64 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData}>
              <XAxis 
                dataKey="name" 
                stroke="rgba(148, 163, 184, 0.5)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  color: '#f8fafc'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {ratingData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.8}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Format Chart */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PieChartIcon size={64} className="text-pink-500" />
        </div>
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300 mb-6">
          Formats Owned
        </h3>
        <div className="h-64 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ownershipData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {ownershipData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity cursor-pointer stroke-black stroke-2"
                  />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  color: '#f8fafc'
                }}
                 itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};