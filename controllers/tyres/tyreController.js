const Tyre = require('../../models/Tyre');

exports.getAllTyres = async (req, res) => {
  const tyres = await Tyre.find();

  res.json(tyres);
};

exports.getTyreById = async (req, res) => {
  const tyre = await Tyre.findById(req.params.id);

  if (tyre) {
    res.json(tyre);
  } else {
    res.status(404).json({ message: 'Не знайдено' });
  }
};

exports.createTyre = async (req, res) => {
  const newTyre = new Tyre({
    ...req.body,
    userId: req.user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await newTyre.save();
  res.status(201).json(newTyre);
};

exports.updateTyre = async (req, res) => {
  const tyre = await Tyre.findById(req.params.id);

  if (!tyre) {
    return res.status(404).json({ message: 'Оголошення не знайдено' });
  }

  if (tyre.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Недостатньо прав' });
  }

  const updated = await Tyre.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.json(updated);
};

exports.renewTyre = async (req, res) => {
  try {
    const tyre = await Tyre.findById(req.params.id);

    if (!tyre) {
      return res.status(404).json({ message: 'Оголошення не знайдено' });
    }

    if (tyre.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Недостатньо прав' });
    }

    tyre.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // продовжити на 30 днів
    await tyre.save();

    res.json({ message: 'Оголошення оновлено на 30 днів' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося продовжити оголошення' });
  }
};


exports.deleteTyre = async (req, res) => {
  const tyre = await Tyre.findById(req.params.id);

  if (!tyre) {
    return res.status(404).json({ message: 'Оголошення не знайдено' });
  }

  if (tyre.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Недостатньо прав' });
  }

  await Tyre.findByIdAndDelete(req.params.id);
  
  res.json({ message: 'Оголошення видалено' });
};
