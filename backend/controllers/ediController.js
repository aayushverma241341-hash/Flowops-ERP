const db = require('../config/db');

exports.getIdocs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_idocs ORDER BY idoc_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
