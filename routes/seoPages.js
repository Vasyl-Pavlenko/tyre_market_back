const express = require('express');
const path = require('path');
const router = express.Router();

const staticDir = path.join(__dirname, '../static-pages');

router.get('/guides/:slug', (req, res) => {
  const slug = req.params.slug;
  const filePath = path.join(staticDir, `${slug}.html`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Сторінку не знайдено');
    }
  });
});

module.exports = router;
