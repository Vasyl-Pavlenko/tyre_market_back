const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Відсутній або некоректний заголовок авторизації' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('JWT перевірка не вдалася:', err.message);
    res.status(401).json({ message: 'Невірний або протермінований токен' });
  }
}

module.exports = auth;
