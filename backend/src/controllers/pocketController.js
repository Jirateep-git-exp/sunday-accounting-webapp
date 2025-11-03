const Pocket = require('../models/Pocket');
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const catalog = require('../utils/pocketCatalog');
// pick a subset of essentials for first-time users
const defaultPockets = catalog.filter(c => [
  // income essentials
  'salary','bonus','side-income',
  // expense essentials
  'food','groceries','transport','housing','phone-internet','utilities','others'
].includes(c.id)).map(c => ({ name: c.nameEn, type: c.type, icon: c.icon }));

exports.createPocket = async (req, res) => {
  try {
  const { name, type, icon } = req.body;
    const user = await User.findById(req.user._id);
    
    const pocket = new Pocket({
      name,
      type,
      icon,
      userId: req.user._id,
      createdByEmail: user.email || `lineuser-${user._id}`
    });
    await pocket.save();
    res.status(201).json(pocket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPockets = async (req, res) => {
  try {
    const { email } = req.query;
    let query = { userId: req.user._id };
    
    // Add email filter if provided
    if (email) {
      query.createdByEmail = email;
    }
    
    const pockets = await Pocket.find(query);

    res.json(pockets);
  } catch (error) {
    console.error('GET POCKETS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePocket = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const pocket = await Pocket.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { name, icon },
      { new: true }
    );
    if (!pocket) {
      return res.status(404).json({ error: 'Pocket not found' });
    }
    res.json(pocket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePocket = async (req, res) => {
  try {
    const { id } = req.params;
    const pocket = await Pocket.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!pocket) {
      return res.status(404).json({ error: 'Pocket not found' });
    }
    // Cascade delete related transactions for this user and pocket
    await Promise.all([
      Income.deleteMany({ userId: req.user._id, pocketId: id }),
      Expense.deleteMany({ userId: req.user._id, pocketId: id })
    ])
    res.json({ message: 'Pocket and related transactions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New: list default pockets presets (for onboarding UI)
exports.getDefaultPresets = async (_req, res) => {
  res.json(defaultPockets)
}

// New: bulk create selected pockets with custom names
// body: { pockets: [{ id?: string, type: 'income'|'expense', name: string, icon?: string }] }
exports.bulkCreate = async (req, res) => {
  try {
    const payload = Array.isArray(req.body?.pockets) ? req.body.pockets : []
    if (!payload.length) return res.status(400).json({ error: 'No pockets provided' })

    const user = await User.findById(req.user._id)
    const docs = payload.map(p => ({
      name: p.name && String(p.name).trim() ? String(p.name).trim() : 'Unnamed',
      type: p.type,
      icon: p.icon || (catalog.find(c => c.id === p.id)?.icon) || 'fa-solid fa-folder',
      userId: req.user._id,
      createdByEmail: user.email || `lineuser-${user._id}`
    }))

    const inserted = await Pocket.insertMany(docs)
    res.status(201).json(inserted)
  } catch (e) {
    console.error('bulkCreate error:', e)
    res.status(500).json({ error: e.message })
  }
}
