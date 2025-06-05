const Tyre = require('../../models/Tyre');

exports.getAllTyres = async (req, res) => {
  try {
    const {
      sort,
      brand,
      model,
      width,
      height,
      radius,
      condition,
      city,
      priceMin,
      priceMax,
      season,
      vehicle,
      title,
      page = 1,
      limit = 6,
    } = req.query;

    // Стартові умови пошуку
    const query = {
      isActive: true,
      isDeleted: false,
    };

    // Додаємо фільтри, якщо є
    if (brand) {
      query.brand = brand;
    }

    if (model) {
      query.model = model;
    }

    if (width) {
      query.width = parseInt(width);
    }

    if (height) {
      query.height = parseInt(height);
    }

    if (radius) {
      query.radius = parseInt(radius);
    }

    if (condition) {
      query.condition = condition;
    }

    if (season) {
      query.season = season;
    }

    if (vehicle) {
      query.vehicle = vehicle;
    }

    if (city) {
      query.city = city;
    }

    if (priceMin || priceMax) {
      query.price = {};

      if (priceMin) {
        query.price.$gte = parseInt(priceMin);
      }

      if (priceMax) {
        query.price.$lte = parseInt(priceMax);
      }
    }

    if (title) {
      query.title = { $regex: new RegExp(title, 'i') };
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

exports.getMyTyres = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  try {
    const userId = req.user.id;
    const tyres = await Tyre.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ tyres });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.getTyreById = async (req, res) => {
  const tyre = await Tyre.findById(req.params.id);

  if (!tyre) {
    return res.status(404).json({ message: 'Не знайдено' });
  }

  const currentUserId = req.user?.id;
  const ownerId = tyre.userId.toString();

  if (!currentUserId || currentUserId !== ownerId) {
    tyre.views += 1;

    await tyre.save();
  }

  res.json(tyre);
};

exports.getTyresByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ tyres: [] });
    }

    const tyres = await Tyre.find({ _id: { $in: ids } });

    res.json({ tyres });
  } catch (error) {
    console.error('Помилка при отриманні шин за ID:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.slugRedirect = async (req, res) => {
  const { id, slug } = req.params;

  try {
    const tyre = await Tyre.findById(id);

    if (!tyre) {
      return res.status(404).send('Not found');
    }
  } catch (error) {
    console.error('Помилка при отриманні шин за ID:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }  

  const correctSlug = tyre.slug || generateSlug(tyre);

  if (slug !== correctSlug) {
    return res.redirect(301, `/tyres/${id}/${correctSlug}`);
  }

  res.json(tyre);
};

exports.createTyre = async (req, res) => {
  const cleanedImages = (req.body.images || []).map((group) =>
    Array.isArray(group) ? group.filter((img) => typeof img === 'object' && img?.url) : [],
  );

  const newTyre = new Tyre({
    ...req.body,
    images: cleanedImages,
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

  // Оновлюємо поля вручну
  Object.assign(tyre, req.body);

  // Перегенеруємо title
  tyre.title = `${tyre.brand} ${tyre.model} ${tyre.width}/${tyre.height} R${tyre.radius}`;

  await tyre.save();

  res.json(tyre);
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

    // Перевірка на існуючий статус isActive (не обов'язково, але може бути корисним)
    if (tyre.isActive) {
      return res.status(400).json({ message: 'Оголошення вже активно' });
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 днів
    const newWillBeDeletedAt = new Date(newExpiresAt.getTime() + 90 * 24 * 60 * 60 * 1000); // +90 днів після того

    tyre.expiresAt = newExpiresAt;
    tyre.willBeDeletedAt = newWillBeDeletedAt;
    tyre.isActive = true;
    tyre.isExpired = false;
    tyre.isDeleted = false;

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

exports.activateTyre = async (req, res) => {
  try {
    const tyre = await Tyre.findById(req.params.id);

    if (!tyre) {
      return res.status(404).json({ message: 'Оголошення не знайдено' });
    }

    if (tyre.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Недостатньо прав' });
    }

    if (tyre.isActive) {
      return res.status(400).json({ message: 'Оголошення вже активне' });
    }

    tyre.isActive = true;
    tyre.isDeleted = false;
    tyre.isExpired = false;

    await tyre.save();

    res.json({ message: 'Оголошення активоване' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося активувати оголошення' });
  }
};

exports.removeFromActiveTyres = async (req, res) => {
  try {
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

    res.json({ message: 'Оголошення деактивовано' });
  } catch (error) {
    console.error('Помилка при деактивації:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};

exports.deleteTyre = async (req, res) => {
  try {
    const tyre = await Tyre.findById(req.params.id);

    if (!tyre) {
      return res.status(404).json({ message: 'Оголошення не знайдено' });
    }

    if (tyre.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Недостатньо прав' });
    }

    await Tyre.findByIdAndDelete(req.params.id);

    res.json({ message: 'Оголошення видалено' });
  } catch (error) {
    console.error('Помилка при видаленні:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};
