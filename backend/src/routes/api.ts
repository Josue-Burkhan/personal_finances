import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../db/database.js';

const router = Router();

// ==================== TRANSACTIONS ====================
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    let transactions: any[];
    if (month && typeof month === 'string') {
      transactions = queryAll('SELECT * FROM transactions WHERE month = ? ORDER BY date DESC, id DESC', [month]);
    } else {
      transactions = queryAll('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    }

    const mapped = transactions.map((t: any) => ({
      id: t.id,
      date: t.date,
      month: t.month,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      ruleId: t.rule_id
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transactions', (req: Request, res: Response) => {
  try {
    const { type, category, amount, description, date, ruleId } = req.body;
    if (!amount || !date || !type || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const id = Date.now().toString();
    const month = date.substring(0, 7);

    execute(
      'INSERT INTO transactions (id, date, month, type, category, description, amount, rule_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, date, month, type, category, description || category, parseFloat(amount), ruleId || null]
    );

    const created = {
      id,
      date,
      month,
      type,
      category,
      description: description || category,
      amount: parseFloat(amount),
      ruleId: ruleId || null
    };

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/transactions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    execute('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALLOCATION RULES ====================
router.get('/rules', (_req: Request, res: Response) => {
  try {
    const rules = queryAll('SELECT * FROM allocation_rules');
    const mapped = rules.map((r: any) => ({
      id: r.id,
      name: r.name,
      percent: r.percent,
      color: r.color,
      icon: r.icon,
      defaultCategory: r.default_category
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rules', (req: Request, res: Response) => {
  try {
    const { name, percent, color, icon, defaultCategory } = req.body;
    if (!name || percent === undefined) {
      return res.status(400).json({ error: 'Nombre y porcentaje son obligatorios' });
    }

    const id = `rule-${Date.now()}`;
    execute(
      'INSERT INTO allocation_rules (id, name, percent, color, icon, default_category) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, parseFloat(percent), color || '#3b82f6', icon || '🎯', defaultCategory || 'Ahorro / Inversión']
    );

    const created = {
      id,
      name,
      percent: parseFloat(percent),
      color: color || '#3b82f6',
      icon: icon || '🎯',
      defaultCategory: defaultCategory || 'Ahorro / Inversión'
    };

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/rules/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { percent, name, color, icon, defaultCategory } = req.body;

    const existing: any = queryOne('SELECT * FROM allocation_rules WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    const newPercent = percent !== undefined ? parseFloat(percent) : existing.percent;
    const newName = name || existing.name;
    const newColor = color || existing.color;
    const newIcon = icon || existing.icon;
    const newDefaultCat = defaultCategory || existing.default_category;

    execute(
      'UPDATE allocation_rules SET name = ?, percent = ?, color = ?, icon = ?, default_category = ? WHERE id = ?',
      [newName, newPercent, newColor, newIcon, newDefaultCat, id]
    );

    res.json({
      id,
      name: newName,
      percent: newPercent,
      color: newColor,
      icon: newIcon,
      defaultCategory: newDefaultCat
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/rules/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = queryOne('SELECT * FROM allocation_rules WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }
    execute('DELETE FROM allocation_rules WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BUDGETS ====================
router.get('/budgets', (_req: Request, res: Response) => {
  try {
    const rows = queryAll('SELECT * FROM budgets');
    const budgetsMap: Record<string, { income: Record<string, number>; expense: Record<string, number> }> = {};

    rows.forEach((r: any) => {
      if (!budgetsMap[r.month]) {
        budgetsMap[r.month] = { income: {}, expense: {} };
      }
      if (r.type === 'income') {
        budgetsMap[r.month].income[r.category] = r.amount;
      } else {
        budgetsMap[r.month].expense[r.category] = r.amount;
      }
    });

    res.json(budgetsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/budgets', (req: Request, res: Response) => {
  try {
    const { month, type, category, amount } = req.body;
    if (!month || !type || !category) {
      return res.status(400).json({ error: 'Mes, tipo y categoría son obligatorios' });
    }

    const val = parseFloat(amount) || 0;
    const existing = queryOne('SELECT * FROM budgets WHERE month = ? AND type = ? AND category = ?', [month, type, category]);
    if (existing) {
      execute('UPDATE budgets SET amount = ? WHERE month = ? AND type = ? AND category = ?', [val, month, type, category]);
    } else {
      execute('INSERT INTO budgets (month, type, category, amount) VALUES (?, ?, ?, ?)', [month, type, category, val]);
    }

    res.json({ success: true, month, type, category, amount: val });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/budgets/copy', (req: Request, res: Response) => {
  try {
    const { targetMonth, sourceMonth } = req.body;
    if (!targetMonth || !sourceMonth) {
      return res.status(400).json({ error: 'Mes origen y mes destino son obligatorios' });
    }

    const sourceRows = queryAll('SELECT * FROM budgets WHERE month = ?', [sourceMonth]);
    if (sourceRows.length === 0) {
      return res.status(404).json({ error: `No hay presupuesto registrado para el mes ${sourceMonth}` });
    }

    for (const row of sourceRows) {
      const existing = queryOne('SELECT * FROM budgets WHERE month = ? AND type = ? AND category = ?', [targetMonth, row.type, row.category]);
      if (existing) {
        execute('UPDATE budgets SET amount = ? WHERE month = ? AND type = ? AND category = ?', [row.amount, targetMonth, row.type, row.category]);
      } else {
        execute('INSERT INTO budgets (month, type, category, amount) VALUES (?, ?, ?, ?)', [targetMonth, row.type, row.category, row.amount]);
      }
    }

    res.json({ success: true, targetMonth, copiedCount: sourceRows.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS ====================
router.get('/settings/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const row = queryOne<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
    if (!row) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json(JSON.parse(row.value));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = req.body;
    const stringified = JSON.stringify(value);

    const existing = queryOne('SELECT * FROM settings WHERE key = ?', [key]);
    if (existing) {
      execute('UPDATE settings SET value = ? WHERE key = ?', [stringified, key]);
    } else {
      execute('INSERT INTO settings (key, value) VALUES (?, ?)', [key, stringified]);
    }

    res.json({ success: true, key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
