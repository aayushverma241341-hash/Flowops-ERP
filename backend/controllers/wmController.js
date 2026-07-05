const db = require('../config/db');

exports.getBins = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_wm_master ORDER BY bin_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTRs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_wm_tr ORDER BY tr_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTOs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_wm_to ORDER BY to_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
