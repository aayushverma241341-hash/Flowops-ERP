const db = require('../config/db');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, COUNT(e.employee_id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id
      ORDER BY d.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  const { name, head_of_department, budget, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO departments (name, head_of_department, budget, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, head_of_department, budget || 0, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, head_of_department, budget, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name=$1, head_of_department=$2, budget=$3, description=$4 WHERE id=$5 RETURNING *',
      [name, head_of_department, budget || 0, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM departments WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};
