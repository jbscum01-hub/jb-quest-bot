function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function buildTicketChannelName(prefix, username) {
  const safeName = slugify(username || 'player');
  return `${prefix}-${safeName}`.slice(0, 90);
}

module.exports = { slugify, buildTicketChannelName };
