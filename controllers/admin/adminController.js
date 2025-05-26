const User = require('../../models/User');
const Tyre = require('../../models/Tyre');

const moment = require('moment');

exports.getStats =  async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tyres = await Tyre.countDocuments();

    res.json({ users, tyres });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
}

exports.getDailyListings =  async (req, res) => {
  try {
    const today = moment().endOf('day');
    const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');

    const data = await Tyre.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo.toDate(),
            $lte: today.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const fullData = [];
    for (let i = 0; i < 7; i++) {
      const day = moment().subtract(6 - i, 'days').format('YYYY-MM-DD');
      const found = data.find((d) => d._id === day);

      fullData.push({ date: day, count: found ? found.count : 0 });
    }

    res.json(fullData);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
}

exports.getDailyUsers = async (req, res) => {
  try {
    const today = moment().endOf('day');
    const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');

    const data = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo.toDate(),
            $lte: today.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const fullData = [];

    for (let i = 0; i < 7; i++) {
      const day = moment()
        .subtract(6 - i, 'days')
        .format('YYYY-MM-DD');
      
      const found = data.find((d) => d._id === day);
      
      fullData.push({ date: day, count: found ? found.count : 0 });
    }

    res.json(fullData);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.getListingCategories = async (req, res) => {
  try {
    const data = await Tyre.aggregate([
      {
        $group: {
          _id: '$season',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = data.map((item) => ({
      name: item._id || 'Невідомо',
      value: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.getListingStatus = async (req, res) => {
  try {
    const data = await Tyre.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = data.map((item) => ({
      name: item._id ? 'Активні' : 'Неактивні',
      value: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
