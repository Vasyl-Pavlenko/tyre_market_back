const Tyre = require('../../models/Tyre');

exports.getAllTyres = async (req, res) => {
  try {
    const {
      sort,
      brand,
      size,
      condition,
      city,
      priceMin,
      priceMax,
      season,
      vehicle,
      page = 1,
      limit = 10,
    } = req.query;

    // Стартові умови пошуку
    const query = {
      isActive: true,
      isDeleted: false,
    };

    // Додаємо фільтри, якщо є
    switch (true) {
      case !!brand:
        query.brand = brand;
        break;
      case !!size:
        query.size = size;
        break;
      case !!condition:
        query.condition = condition;
        break;
      case !!season:
        query.season = season;
        break;
      case !!vehicle:
        query.vehicle = vehicle;
        break;
      case !!city:
        query.city = city;
        break;
      case priceMin || priceMax:
        query.price = {};
        
        if (priceMin) {
          query.price.$gte = parseInt(priceMin);
        }

        if (priceMax) {
          query.price.$lte = parseInt(priceMax);
        }
        break;
    }

    // Логіка сортування
    let sortOption = {};

    switch (sort) {
      case 'priceAsc':
        sortOption.price = 1;
        break;
      case 'priceDesc':
        sortOption.price = -1;
        break;
      case 'oldest':
        sortOption.createdAt = 1;
        break;
      case 'newest':
      default:
        sortOption.createdAt = -1;
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tyres, total] = await Promise.all([
      Tyre.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Tyre.countDocuments(query),
    ]);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      tyres,
    });
  } catch (error) {
    console.error('Помилка при отриманні оголошень:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.getTyreById = async (req, res) => {
  const tyre = await Tyre.findById(req.params.id);

  if (!tyre) {
    return res.status(404).json({ message: 'Не знайдено' });
  }

  // інкремент переглядів, але не власнику
  if (!req.user || req.user.id !== tyre.userId.toString()) {
    tyre.views += 1;
    await tyre.save();
  }

  res.json(tyre);
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

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 днів
    const newWillBeDeletedAt = new Date(newExpiresAt.getTime() + 90 * 24 * 60 * 60 * 1000); // +90 днів після того

    tyre.expiresAt = newExpiresAt;
    tyre.willBeDeletedAt = newWillBeDeletedAt;
    await tyre.save();

    res.json({
      message: 'Оголошення оновлено на 30 днів',
      updatedExpiresAt: tyre.expiresAt,
      updatedWillBeDeletedAt: tyre.willBeDeletedAt,
    });
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

  tyre.isActive = false;
  tyre.isDeleted = true;
  await tyre.save();

  res.json({ message: 'Оголошення переміщено до неактивних' });
};
