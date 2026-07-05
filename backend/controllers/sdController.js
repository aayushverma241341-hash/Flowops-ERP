const db = require('../config/db');

exports.getSalesOrders = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sd_sales_orders ORDER BY order_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching Sales Orders' });
    }
};
