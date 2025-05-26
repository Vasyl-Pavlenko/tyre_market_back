const mongoose = require('mongoose');
const Favorite = require('../../models/Favorite');
const Tyre = require('../../models/Tyre');

exports.addToFavorites = async (req, res) => {
  const { tyreId } = req.body;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const tyre = await Tyre.findById(tyreId).select('userId').session(session);

    if (!tyre) {
      return res.status(404).json({ message: 'Шину не знайдено' });
    }

    if (tyre.userId.toString() === req.user.id) {
      return res.status(403).json({ message: 'Неможливо додати власне оголошення до обраного' });
    }

    const existing = await Favorite.findOne({ userId: req.user.id, tyreId }).session(session);

    if (existing) {
      return res.status(400).json({ message: 'Вже в обраному' });
    }

    await Favorite.create([{ userId: req.user.id, tyreId }], { session });

    await Tyre.findByIdAndUpdate(tyreId, { $inc: { favoritesCount: 1 } }, { session });

    const count = await Favorite.countDocuments({ tyreId }).session(session);
    await Tyre.findByIdAndUpdate(tyreId, { favoritesCount: count }, { session });

    await session.commitTransaction();

    res.status(201).json({ message: 'Додано до обраного' });
  } catch (error) {
    await session.abortTransaction();

    console.error('Помилка додавання в обране:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  } finally {
    session.endSession();
  }
};

exports.removeFromFavorites = async (req, res) => {
  const { tyreId } = req.params;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const deleted = await Favorite.findOneAndDelete({ userId: req.user.id, tyreId }).session(
      session,
    );

    if (!deleted) {
      return res.status(404).json({ message: 'Не знайдено в обраному' });
    }

    // Декремент лічильника фаворитів
    const tyre = await Tyre.findByIdAndUpdate(
      tyreId,
      { $inc: { favoritesCount: -1 } },
      { new: true, session },
    );

    // Якщо favoritesCount < 0, встановлюємо 0
    if (tyre.favoritesCount < 0) {
      tyre.favoritesCount = 0;

      await tyre.save({ session });
    }

    // Підрахунок актуального лічильника фаворитів для цієї шини
    const count = await Favorite.countDocuments({ tyreId }).session(session);
    await Tyre.findByIdAndUpdate(tyreId, { favoritesCount: count }, { session });

    await session.commitTransaction();
    
    res.json({ message: 'Видалено з обраного' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Помилка видалення з обраного:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  } finally {
    session.endSession();
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).select('tyreId');

    const ids = favorites
      .map((f) => f.tyreId)
      .filter(Boolean)
      .map((id) => id.toString());

    res.json(ids);
  } catch (err) {
    console.error('Помилка при отриманні обраного:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
