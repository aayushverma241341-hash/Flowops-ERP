const db = require('./config/db');

const seedPPIM = async () => {
    try {
        console.log('Starting PP and IM Seeding (50 records each)...');

        const plants = ['1000', '2000', '3000', '4000'];
        const statuses = ['CREATED', 'RELEASED', 'CONFIRMED', 'COMPLETED', 'ACTIVE', 'COUNTED', 'POSTED'];

        // 1. PP: Production Orders
        for (let i = 1; i <= 50; i++) {
            await db.query(`
                INSERT INTO sap_production_orders (order_number, material_id, plant, quantity, start_date, end_date, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (order_number) DO NOTHING
            `, [
                `PROD-ORD-${100000 + i}`,
                `MAT-${2000 + i}`,
                plants[i % 4],
                Math.floor(Math.random() * 500) + 10,
                new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30))),
                new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 30))),
                statuses[i % 3] // CREATED, RELEASED, CONFIRMED
            ]);
        }
        console.log('Seeded 50 sap_production_orders');

        // 2. PP: MRP Runs
        for (let i = 1; i <= 50; i++) {
            await db.query(`
                INSERT INTO sap_mrp_runs (run_number, material_id, plant, total_requirements, planned_orders_qty, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (run_number) DO NOTHING
            `, [
                `MRP-RUN-${300000 + i}`,
                `MAT-${2000 + i}`,
                plants[i % 4],
                Math.floor(Math.random() * 1000) + 100,
                Math.floor(Math.random() * 800) + 50,
                statuses[3] // COMPLETED
            ]);
        }
        console.log('Seeded 50 sap_mrp_runs');

        // 3. PP: Routings
        for (let i = 1; i <= 50; i++) {
            const operations = JSON.stringify([
                { op: '0010', work_center: 'WC01', desc: 'Assembly', time: '2H' },
                { op: '0020', work_center: 'WC02', desc: 'Testing', time: '1H' }
            ]);
            await db.query(`
                INSERT INTO sap_routings (routing_number, material_id, plant, operations, status)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (routing_number) DO NOTHING
            `, [
                `RTG-${400000 + i}`,
                `MAT-${2000 + i}`,
                plants[i % 4],
                operations,
                statuses[4] // ACTIVE
            ]);
        }
        console.log('Seeded 50 sap_routings');

        // 4. PP: BOMs
        for (let i = 1; i <= 50; i++) {
            const components = JSON.stringify([
                { comp_id: `COMP-A-${i}`, qty: 2, uom: 'PC' },
                { comp_id: `COMP-B-${i}`, qty: 5, uom: 'G' }
            ]);
            await db.query(`
                INSERT INTO sap_boms (bom_number, material_id, plant, base_quantity, components, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (bom_number) DO NOTHING
            `, [
                `BOM-${500000 + i}`,
                `MAT-${2000 + i}`,
                plants[i % 4],
                1.0,
                components,
                statuses[4] // ACTIVE
            ]);
        }
        console.log('Seeded 50 sap_boms');

        // 5. IM: Stock Overview
        for (let i = 1; i <= 50; i++) {
            await db.query(`
                INSERT INTO sap_stock_overview (material_id, plant, storage_loc, batch, unrestricted_stock, quality_inspection, blocked_stock, in_transit)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                `MAT-${2000 + i}`,
                plants[i % 4],
                `SL${(i % 5) + 1}`,
                `BATCH-${i}`,
                Math.floor(Math.random() * 5000),
                Math.floor(Math.random() * 200),
                Math.floor(Math.random() * 50),
                Math.floor(Math.random() * 300)
            ]);
        }
        console.log('Seeded 50 sap_stock_overview');

        // 6. PI: Physical Inventory
        for (let i = 1; i <= 50; i++) {
            const items = JSON.stringify([
                { item: 10, material: `MAT-${2000 + i}`, book_qty: 100, counted_qty: 98, diff: -2 }
            ]);
            await db.query(`
                INSERT INTO sap_physical_inventory (doc_number, plant, storage_loc, doc_date, planned_count_date, status, items)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (doc_number) DO NOTHING
            `, [
                `PIDOC-${600000 + i}`,
                plants[i % 4],
                `SL${(i % 5) + 1}`,
                new Date(),
                new Date(new Date().setDate(new Date().getDate() + 1)),
                (i % 3 === 0) ? 'CREATED' : (i % 2 === 0 ? 'COUNTED' : 'POSTED'),
                items
            ]);
        }
        console.log('Seeded 50 sap_physical_inventory');

        console.log('Seeding PP and IM complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedPPIM();
