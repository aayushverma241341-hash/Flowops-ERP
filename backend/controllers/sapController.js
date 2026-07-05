const db = require('../config/db');

// --- MATERIAL MASTER (MM01 / MM02 / MM03) ---
exports.getMaterials = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_materials ORDER BY material_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  const { material_number, description, base_unit, material_group } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO sap_materials (material_number, description, base_unit, material_group) VALUES ($1, $2, $3, $4) RETURNING *',
      [material_number, description, base_unit, material_group]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- VENDOR MASTER (XK01 / XK02 / XK03) ---
exports.getVendors = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_vendors ORDER BY vendor_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVendor = async (req, res) => {
  const { vendor_number, name, city, contact_no } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO sap_vendors (vendor_number, name, city, contact_no) VALUES ($1, $2, $3, $4) RETURNING *',
      [vendor_number, name, city, contact_no]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- PURCHASE ORDERS (ME21N / ME23N) ---
exports.getPurchaseOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT po.po_id, po.po_number, po.doc_date, po.status, v.name as vendor_name 
      FROM sap_purchase_orders po
      JOIN sap_vendors v ON po.vendor_id = v.vendor_id
      ORDER BY po.po_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  const { po_number, vendor_id, items } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const poResult = await client.query(
      'INSERT INTO sap_purchase_orders (po_number, vendor_id) VALUES ($1, $2) RETURNING po_id',
      [po_number, vendor_id]
    );
    const po_id = poResult.rows[0].po_id;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(
        'INSERT INTO sap_po_items (po_id, item_no, material_id, po_quantity, net_price) VALUES ($1, $2, $3, $4, $5)',
        [po_id, (i + 1) * 10, item.material_id, item.po_quantity, item.net_price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Purchase Order created successfully (ME21N)', po_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// --- GOODS RECEIPT (MIGO) ---
exports.getGoodsReceipts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT gr.gr_id, gr.migo_document, gr.posting_date, gr.movement_type, po.po_number 
      FROM sap_goods_receipts gr
      JOIN sap_purchase_orders po ON gr.po_id = po.po_id
      ORDER BY gr.gr_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGoodsReceipt = async (req, res) => {
  const { migo_document, po_id } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Create GR Record
    await client.query(
      'INSERT INTO sap_goods_receipts (migo_document, po_id) VALUES ($1, $2)',
      [migo_document, po_id]
    );

    // 2. Fetch PO Items
    const items = await client.query('SELECT material_id, po_quantity FROM sap_po_items WHERE po_id = $1', [po_id]);
    
    // 3. Update Material Master Stock
    for (const item of items.rows) {
      await client.query(
        'UPDATE sap_materials SET total_stock = total_stock + $1 WHERE material_id = $2',
        [item.po_quantity, item.material_id]
      );
    }

    // 4. Update PO Status
    await client.query("UPDATE sap_purchase_orders SET status = 'Received' WHERE po_id = $1", [po_id]);
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Goods Receipt posted successfully (MIGO)' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// --- MM EXPANSION (PR, RFQ, Info, Contracts, MIRO, MatDocs) ---
exports.getPRs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_purchase_requisitions ORDER BY pr_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRFQs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_rfqs ORDER BY rfq_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getInfoRecords = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_info_records ORDER BY info_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getContracts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_contracts ORDER BY contract_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMiroInvoices = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_miro_invoices ORDER BY invoice_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMaterialDocuments = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_material_documents ORDER BY doc_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStockOverview = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_stock_overview ORDER BY stock_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPhysicalInventory = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sap_physical_inventory ORDER BY pi_doc_id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
