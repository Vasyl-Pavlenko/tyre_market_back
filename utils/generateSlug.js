const generateSlug = (tyre) => {
  return tyre.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

module.exports = generateSlug;