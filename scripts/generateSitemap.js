const fs = require('fs');
const path = require('path');
const Tyre = require('../models/Tyre');
const User = require('../models/User');

const BASE_URL = process.env.FRONTEND_URL;

if (!BASE_URL) {
  throw new Error('FRONTEND_URL не визначено в середовищі!');
}

async function saveSitemapToFile() {
  const sitemapXml = await generateSitemap();

  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log('✅ Sitemap saved to public/sitemap.xml');
}

function buildUrl(base, path) {
  if (base.endsWith('/') && path.startsWith('/')) {
    return base + path.slice(1);
  } else if (!base.endsWith('/') && !path.startsWith('/')) {
    return base + '/' + path;
  }
  return base + path;
}

async function generateSitemap() {
  const tyres = await Tyre.find({ isActive: true }).select('_id updatedAt');
  const users = await User.find({}).select('_id name');

  const urls = [];

  urls.push(`
    <url>
      <loc>${buildUrl(BASE_URL, '/')}</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  `);

  tyres.forEach((tyre) => {
    const slug = tyre.slug ? slugify(tyre.slug) : '';

    if (!slug) {
      return;
    }

    urls.push(`
    <url>
      <loc>${buildUrl(BASE_URL, `/tyre/${slug}-${tyre._id}`)}</loc>
      <lastmod>${tyre.updatedAt.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.5</priority>
    </url>
  `);
  });

  users.forEach((user) => {
    if (!user.name) {
      return;
    }

    const slug = slugify(user.name);

    if (!slug || slug === '-') {
      return;
    }

    urls.push(`
    <url>
      <loc>${buildUrl(BASE_URL, `/user/${slug}-${user._id}`)}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.3</priority>
    </url>
  `);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n')}
</urlset>`;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

module.exports = { generateSitemap, saveSitemapToFile };
