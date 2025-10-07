const catalog = require('./pocketCatalog')

function normalize(s) {
  return (s || '').toString().toLowerCase().trim()
}

function guessPocket(text) {
  const t = normalize(text)
  // direct match any synonym
  for (const item of catalog) {
    if (item.synonyms?.some(k => t.includes(normalize(k)))) {
      return { type: item.type, name: item.nameTh, id: item.id }
    }
  }

  // fallback: English names or Thai canonical names
  for (const item of catalog) {
    if (t.includes(normalize(item.nameTh)) || t.includes(normalize(item.nameEn))) {
      return { type: item.type, name: item.nameTh, id: item.id }
    }
  }

  // default
  const other = catalog.find(i => i.id === 'others')
  return { type: other.type, name: other.nameTh, id: other.id }
}

module.exports = guessPocket