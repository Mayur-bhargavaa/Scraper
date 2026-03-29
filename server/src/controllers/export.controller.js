import * as exportService from '../services/export.service.js';

export const exportLeads = async (req, res) => {
  try {
    const { format = 'csv', jobId, fields, tags, minScore, minRating } = req.query;

    const parsedFields = fields ? fields.split(',') : undefined;
    const result = await exportService.exportLeads({
      userId: req.user._id,
      jobId,
      format,
      fields: parsedFields,
      filters: { tags, minScore, minRating },
    });

    const filename = `stitchbyte-leads-${Date.now()}.${result.extension}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', result.contentType);
    res.send(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
