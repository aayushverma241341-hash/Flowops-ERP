const db = require('./config/db');

const migratePPIM = async () => {
    try {
        console.log('Starting PP and IM Migration...');

        // 1. PP: Production Orders
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_production_orders (
                order_id SERIAL PRIMARY KEY,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                material_id VARCHAR(50) NOT NULL,
                plant VARCHAR(10) NOT NULL,
                quantity DECIMAL(10, 2) NOT NULL,
                uom VARCHAR(10) DEFAULT 'PC',
                start_date DATE,
                end_date DATE,
                status VARCHAR(50) DEFAULT 'CREATED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. PP: MRP Runs
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_mrp_runs (
                mrp_id SERIAL PRIMARY KEY,
                run_number VARCHAR(50) UNIQUE NOT NULL,
                material_id VARCHAR(50) NOT NULL,
                plant VARCHAR(10) NOT NULL,
                run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_requirements DECIMAL(10, 2),
                planned_orders_qty DECIMAL(10, 2),
                status VARCHAR(50) DEFAULT 'COMPLETED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. PP: Routings
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_routings (
                routing_id SERIAL PRIMARY KEY,
                routing_number VARCHAR(50) UNIQUE NOT NULL,
                material_id VARCHAR(50) NOT NULL,
                plant VARCHAR(10) NOT NULL,
                operations JSONB,
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. PP: BOMs (Bill of Materials)
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_boms (
                bom_id SERIAL PRIMARY KEY,
                bom_number VARCHAR(50) UNIQUE NOT NULL,
                material_id VARCHAR(50) NOT NULL,
                plant VARCHAR(10) NOT NULL,
                base_quantity DECIMAL(10, 2) DEFAULT 1.0,
                components JSONB,
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. IM: Stock Overview
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_stock_overview (
                stock_id SERIAL PRIMARY KEY,
                material_id VARCHAR(50) NOT NULL,
                plant VARCHAR(10) NOT NULL,
                storage_loc VARCHAR(10) NOT NULL,
                batch VARCHAR(50),
                unrestricted_stock DECIMAL(10, 2) DEFAULT 0.0,
                quality_inspection DECIMAL(10, 2) DEFAULT 0.0,
                blocked_stock DECIMAL(10, 2) DEFAULT 0.0,
                in_transit DECIMAL(10, 2) DEFAULT 0.0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 6. PI: Physical Inventory
        await db.query(`
            CREATE TABLE IF NOT EXISTS sap_physical_inventory (
                pi_doc_id SERIAL PRIMARY KEY,
                doc_number VARCHAR(50) UNIQUE NOT NULL,
                plant VARCHAR(10) NOT NULL,
                storage_loc VARCHAR(10) NOT NULL,
                doc_date DATE,
                planned_count_date DATE,
                status VARCHAR(50) DEFAULT 'CREATED',
                items JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('PP and IM tables created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migratePPIM();
