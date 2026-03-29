const ScoreBadge = ({ score, tags = [] }) => {
  const getScoreColor = (s) => {
    if (s >= 60) return 'bg-white text-zinc-900 border-zinc-300 shadow-sm';
    if (s >= 40) return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    return 'bg-zinc-100 text-zinc-500 border-zinc-200';
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'High Potential': return 'bg-black text-white border-black shadow';
      case 'Premium': return 'bg-white text-black border-2 border-black font-bold';
      case 'Cold': return 'bg-zinc-100 text-zinc-500 border-zinc-200';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${getScoreColor(score)}`}>
        {score}
      </span>
      {tags.map(tag => (
        <span key={tag} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getTagColor(tag)}`}>
          {tag}
        </span>
      ))}
    </div>
  );
};

export default ScoreBadge;
