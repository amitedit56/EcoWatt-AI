import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Lightbulb, CheckCircle2, TrendingDown, DollarSign } from 'lucide-react';

const savingTips = [
  { id: 1, title: 'Optimize AC Thermostat', category: 'HVAC', impact: 'High', savings: '₹450 / month', desc: 'Set your AC temperature to 24-25°C. Every degree lower increases power consumption by 6%.' },
  { id: 2, title: 'Switch to LED Lighting', category: 'Lighting', impact: 'Medium', savings: '₹180 / month', desc: 'Replace remaining traditional bulbs with energy-efficient LED alternatives.' },
  { id: 3, title: 'Unplug Idle Electronics', category: 'General', impact: 'Low', savings: '₹90 / month', desc: 'Eliminate phantom power draw by turning off power strips when devices are not in use.' },
  { id: 4, title: 'Smart Refrigerator Placement', category: 'Kitchen', impact: 'Medium', savings: '₹150 / month', desc: 'Keep your fridge away from direct sunlight and allow space for proper ventilation behind coils.' },
];

const Savings = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Savings & Tips" 
        subtitle="AI-curated recommendations to lower your electricity bills without compromising comfort." 
      />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Lightbulb className="w-4 h-4" /> Potential Monthly Savings
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100">₹870 <span className="text-sm font-normal text-slate-400">/ month</span></h2>
          <p className="text-xs text-slate-300 mt-1">Implementing all suggested tips can reduce your total consumption by up to 18%.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
            <p className="text-xs text-slate-400">Active Tips</p>
            <p className="text-lg font-bold text-emerald-400">04</p>
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
            <p className="text-xs text-slate-400">Difficulty</p>
            <p className="text-lg font-bold text-blue-400">Easy</p>
          </div>
        </div>
      </div>

      {/* Tips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savingTips.map((tip) => (
          <Card key={tip.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">
                  {tip.category}
                </span>
                <Badge variant={tip.impact === 'High' ? 'danger' : tip.impact === 'Medium' ? 'warning' : 'success'}>
                  {tip.impact} Impact
                </Badge>
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">{tip.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{tip.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">Estimated Benefit:</span>
              <span className="font-extrabold text-emerald-400 text-sm">{tip.savings}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Savings;