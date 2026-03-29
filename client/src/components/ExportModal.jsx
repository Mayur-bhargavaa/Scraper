import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';

const AVAILABLE_FIELDS = [
  { key: 'businessName', label: 'Business Name', default: true },
  { key: 'category', label: 'Category', default: true },
  { key: 'address', label: 'Address', default: true },
  { key: 'phone', label: 'Phone', default: true },
  { key: 'website', label: 'Website', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'rating', label: 'Rating', default: true },
  { key: 'reviews', label: 'Reviews', default: true },
  { key: 'score', label: 'Score', default: true },
  { key: 'tags', label: 'Tags', default: true },
  { key: 'workingHours', label: 'Working Hours', default: false },
  { key: 'mapsLink', label: 'Maps Link', default: false },
  { key: 'latitude', label: 'Latitude', default: false },
  { key: 'longitude', label: 'Longitude', default: false },
];

const formats = [
  { key: 'csv', label: 'CSV', icon: FileText, desc: 'Comma-separated values' },
  { key: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'Spreadsheet with styling' },
  { key: 'json', label: 'JSON', icon: FileJson, desc: 'Structured data format' },
];

const ExportModal = ({ isOpen, onClose, jobId, filters = {} }) => {
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_FIELDS.filter(f => f.default).map(f => f.key)
  );
  const [downloading, setDownloading] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleField = (key) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        format,
        fields: selectedFields.join(','),
        ...(jobId && { jobId }),
        ...filters,
      });

      const response = await fetch(`/api/export?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('stitchbyte_token')}`,
        },
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stitchbyte-leads.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg mx-4 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Export Leads</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-8">
          <label className="input-label">Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {formats.map(f => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                  format === f.key
                    ? 'border-black bg-zinc-50 text-black'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                }`}
              >
                <f.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-bold">{f.label}</p>
                <p className="text-[10px] mt-1 font-medium">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Field Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="input-label !mb-0">Include Fields</label>
            <button
              onClick={() => setSelectedFields(
                selectedFields.length === AVAILABLE_FIELDS.length
                  ? AVAILABLE_FIELDS.filter(f => f.default).map(f => f.key)
                  : AVAILABLE_FIELDS.map(f => f.key)
              )}
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors"
            >
              {selectedFields.length === AVAILABLE_FIELDS.length ? 'Reset' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
            {AVAILABLE_FIELDS.map(f => (
              <label
                key={f.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border ${
                  selectedFields.includes(f.key)
                    ? 'bg-zinc-50 border-zinc-300 text-black shadow-sm'
                    : 'bg-white border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-black'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.key)}
                  onChange={() => toggleField(f.key)}
                  className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black"
                />
                <span className="text-sm font-semibold">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleExport}
            disabled={downloading || selectedFields.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting...' : 'Export Results'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExportModal;
