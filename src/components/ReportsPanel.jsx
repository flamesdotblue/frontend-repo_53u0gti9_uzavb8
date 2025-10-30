import { useEffect, useState } from 'react';

export default function ReportsPanel() {
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('medisense_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('medisense_reports', JSON.stringify(reports));
  }, [reports]);

  const remove = (idx) => {
    setReports((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Reports</h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports yet. Upload images from the chat to see them here.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {reports.map((r, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden bg-white">
              {r.preview ? (
                <img src={r.preview} alt={r.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 grid place-items-center text-gray-400 text-sm">{r.name}</div>
              )}
              <div className="p-2 flex items-center justify-between text-xs text-gray-600">
                <span className="truncate" title={r.name}>{r.name}</span>
                <button className="text-red-500 hover:underline" onClick={() => remove(idx)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
