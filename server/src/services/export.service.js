import { Parser } from '@json2csv/plainjs';
import ExcelJS from 'exceljs';
import Lead from '../models/Lead.js';

const DEFAULT_FIELDS = [
  'businessName', 'category', 'address', 'phone', 'website',
  'email', 'rating', 'reviews', 'score', 'tags', 'mapsLink',
];

export const exportLeads = async ({ userId, jobId, format = 'csv', fields = DEFAULT_FIELDS, filters = {} }) => {
  const query = { userId };
  if (jobId) query.jobId = jobId;
  if (filters.tags) query.tags = { $in: [].concat(filters.tags) };
  if (filters.minScore) query.score = { $gte: parseInt(filters.minScore) };
  if (filters.minRating) query.rating = { ...query.rating, $gte: parseFloat(filters.minRating) };

  const leads = await Lead.find(query).select(fields.join(' ')).lean();

  switch (format) {
    case 'csv':
      return exportCSV(leads, fields);
    case 'excel':
      return exportExcel(leads, fields);
    case 'json':
      return { data: JSON.stringify(leads, null, 2), contentType: 'application/json', extension: 'json' };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

const exportCSV = (leads, fields) => {
  const parser = new Parser({ fields });
  const csv = parser.parse(leads);
  return { data: csv, contentType: 'text/csv', extension: 'csv' };
};

const exportExcel = async (leads, fields) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Leads');

  // Header row with styling
  sheet.columns = fields.map(f => ({
    header: f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    key: f,
    width: f === 'mapsLink' || f === 'website' ? 40 : 20,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
  headerRow.alignment = { horizontal: 'center' };

  // Data rows
  leads.forEach(lead => {
    const row = {};
    fields.forEach(f => {
      row[f] = Array.isArray(lead[f]) ? lead[f].join(', ') : lead[f];
    });
    sheet.addRow(row);
  });

  // Alternate row shading
  for (let i = 2; i <= leads.length + 1; i++) {
    if (i % 2 === 0) {
      sheet.getRow(i).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { data: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' };
};
