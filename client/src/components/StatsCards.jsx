import { useEffect, useRef } from 'react';
import { Users, Mail, Globe, BarChart2 } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      label: 'Total Leads',
      value: stats?.totalLeads ?? 0,
      icon: Users,
    },
    {
      label: 'With Email',
      value: stats?.withEmail ?? 0,
      icon: Mail,
    },
    {
      label: 'With Website',
      value: stats?.withWebsite ?? 0,
      icon: Globe,
    },
    {
      label: 'Avg Score',
      value: stats?.avgScore ? Math.round(stats.avgScore) : 0,
      icon: BarChart2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <AnimatedCard key={card.label} card={card} index={i} />
      ))}
    </div>
  );
};

const AnimatedCard = ({ card, index }) => {
  const countRef = useRef(null);
  const Icon = card.icon;

  useEffect(() => {
    const target = card.value;
    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (countRef.current) {
        countRef.current.textContent = current.toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [card.value]);

  return (
    <div
      className={`fade-in fade-in-delay-${index + 1} border border-zinc-200 bg-white rounded-xl p-5 transition-colors duration-300 cursor-default`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6 text-black" />
      </div>
      <p ref={countRef} className="text-3xl font-bold text-black tabular-nums tracking-tight">0</p>
      <p className="text-sm text-zinc-500 mt-1 font-semibold">{card.label}</p>
    </div>
  );
};

export default StatsCards;
