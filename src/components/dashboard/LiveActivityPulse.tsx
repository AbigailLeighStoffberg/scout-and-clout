import { motion } from "framer-motion";
import { Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { mockAnalytics } from "@/data/mockData";

export function LiveActivityPulse() {
  const currentHour = new Date().getHours();
  const data = mockAnalytics.hourlyActivity;
  
  // Calculate trend
  const currentGuests = data[currentHour]?.guests || 0;
  const avgGuests = data.reduce((sum, d) => sum + d.guests, 0) / data.length;
  const trendPercent = ((currentGuests - avgGuests) / avgGuests * 100).toFixed(0);
  const isPositive = currentGuests > avgGuests;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vibe-blue/10">
              <Activity className="h-5 w-5 text-vibe-blue" />
            </div>
            {/* Live pulse indicator */}
            <motion.div
              className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-vibe-green"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">Live Activity Pulse</h3>
            <p className="text-sm text-muted-foreground">Hourly guest traffic</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? 'text-vibe-green' : 'text-vibe-orange'}`}>
          <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
          {isPositive ? '+' : ''}{trendPercent}% vs avg
        </div>
      </div>

      {/* Trend message */}
      <div className="mb-4 rounded-xl bg-vibe-blue/5 border border-vibe-blue/10 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Traffic is trending {isPositive ? 'higher' : 'lower'}</span> — {Math.abs(Number(trendPercent))}% {isPositive ? 'above' : 'below'} average for a {new Date().toLocaleDateString('en-US', { weekday: 'long' })}.
        </p>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(h) => h % 6 === 0 ? `${h}:00` : ''}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
              }}
              labelFormatter={(h) => `${h}:00`}
              formatter={(value: number) => [`${value} guests`, 'Activity']}
            />
            <Area
              type="monotone"
              dataKey="guests"
              stroke="hsl(210, 90%, 55%)"
              strokeWidth={2.5}
              fill="url(#pulseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Current time indicator */}
        <motion.div
          className="absolute top-0 bottom-8 w-0.5 bg-vibe-green"
          style={{ left: `calc(${(currentHour / 24) * 100}% + 10px)` }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-vibe-green" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-vibe-green whitespace-nowrap">
            Now
          </div>
        </motion.div>
      </div>
    </div>
  );
}
