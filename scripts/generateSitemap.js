const fs = require('fs');
const path = require('path');
const Tyre = require('../models/Tyre');
const User = require('../models/User');

const BASE_URL = process.env.FRONTEND_URL;

async function generateSitemap() {
  try {
    const tyres = await Tyre.find({ isActive: true }).select('_id updatedAt');
    const users = await User.find({}).select('_id username');

    const urls = [];

    urls.push(`
      <url>
        <loc>${BASE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
    `);

    tyres.forEach((tyre) => {
      urls.push(`
        <url>
          <loc>${BASE_URL}/tyre/${tyre._id}</loc>
          <lastmod>${tyre.updatedAt.toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `);
    });

    users.forEach((user) => {
      urls.push(`
        <url>
          <loc>${BASE_URL}/user/${user.username}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.3</priority>
        </url>
      `);
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n')}
</urlset>`;

    const dir = path.join(__dirname, '../../public');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'sitemap.xml');
    fs.writeFileSync(filePath, sitemapContent, 'utf8');

    console.log('Sitemap generated successfully');
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    throw err;
  }
}

module.exports = generateSitemap;
