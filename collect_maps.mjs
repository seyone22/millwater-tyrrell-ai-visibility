import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env', 'utf8');
const login = env.match(/DATAFORSEO_LOGIN=(.*)/)[1].trim();
const pass = env.match(/DATAFORSEO_PASSWORD=(.*)/)[1].trim();
const dfsAuth = 'Basic ' + Buffer.from(`${login}:${pass}`).toString('base64');

const CFG = JSON.parse(fs.readFileSync('client.config.json', 'utf8'));

async function dfsMaps(keyword, locationCode) {
  const r = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
    method: 'POST',
    headers: { Authorization: dfsAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      keyword,
      location_code: locationCode,
      language_code: 'en',
      device: 'desktop',
      depth: 20
    }])
  });
  const j = await r.json();
  const t = j.tasks?.[0];
  if (t?.status_code === 40200 || t?.status_code === 40100) {
    console.error('DataForSEO credit/auth failure:', t?.status_message);
    process.exit(1);
  }
  return { cost: j.cost || 0, items: t?.result?.[0]?.items || [] };
}

const out = {
  generatedAt: new Date().toISOString(),
  millwaterBranches: [],
  markets: {}
};

console.log('1. Querying direct Google Maps GBP for Millwater Tyrrell Law Ipswich...');
const direct = await dfsMaps('Millwater Tyrrell Law Ipswich QLD', 9060853);
for (const it of direct.items) {
  if (/millwater\s*tyrrell/i.test(it.title || '') || /millwatertyrrell/i.test(it.domain || '')) {
    out.millwaterBranches.push({
      market: 'ipswich',
      title: it.title,
      category: it.category,
      additional_categories: it.additional_categories || [],
      address: it.address,
      phone: it.phone,
      domain: it.domain,
      url: it.url,
      cid: it.cid,
      place_id: it.place_id,
      rating: it.rating?.value ?? null,
      reviews: it.rating?.votes_count ?? 0,
      rating_distribution: it.rating_distribution || null,
      work_hours: it.work_hours?.timetable || null,
      is_claimed: it.is_claimed
    });
  }
}

console.log(`Found ${out.millwaterBranches.length} direct Millwater Tyrrell GBP entries.`);

// Also query 2 practice-specific Maps packs in Ipswich & Brisbane plus the 8 market packs
for (const city of CFG.cities) {
  console.log(`Querying Google Maps 20-Pack for ${city.id}: "${city.mapsQuery}" (loc ${city.locationCode})...`);
  const res = await dfsMaps(city.mapsQuery, city.locationCode);
  const topCompetitors = res.items
    .filter(x => x.type === 'maps_search')
    .map((x, idx) => ({
      rank: idx + 1,
      title: x.title,
      category: x.category,
      additional_categories: x.additional_categories || [],
      address: x.address,
      phone: x.phone,
      domain: x.domain,
      cid: x.cid,
      rating: x.rating?.value ?? null,
      reviews: x.rating?.votes_count ?? 0,
      is_claimed: x.is_claimed
    }));

  const mtHit = topCompetitors.find(x => /millwater\s*tyrrell/i.test(x.title || '') || /millwatertyrrell/i.test(x.domain || ''));
  out.markets[city.id] = {
    city: city.name,
    displayLoc: city.displayLoc,
    query: city.mapsQuery,
    locationCode: city.locationCode,
    mtRank: mtHit ? mtHit.rank : null,
    mtInPack20: Boolean(mtHit),
    topCompetitors
  };
  out[city.id] = out.markets[city.id];
}

// Also check Ipswich Family Lawyer & Ipswich Wills and Estates Lawyer specifically on Maps
for (const [key, q, loc] of [
  ['ipswich_family_maps', 'family lawyer Ipswich QLD', 9060853],
  ['ipswich_wills_maps', 'wills and estates lawyer Ipswich QLD', 9060853],
  ['brisbane_family_maps', 'family lawyer Brisbane QLD', 1000339],
  ['brisbane_wills_maps', 'wills and estates lawyer Brisbane QLD', 1000339]
]) {
  console.log(`Querying specialty Maps pack ${key}: "${q}"...`);
  const res = await dfsMaps(q, loc);
  const items = res.items.filter(x => x.type === 'maps_search').map((x, idx) => ({
    rank: idx + 1,
    title: x.title,
    category: x.category,
    address: x.address,
    domain: x.domain,
    cid: x.cid,
    rating: x.rating?.value ?? null,
    reviews: x.rating?.votes_count ?? 0
  }));
  const mtHit = items.find(x => /millwater\s*tyrrell/i.test(x.title || '') || /millwatertyrrell/i.test(x.domain || ''));
  out[key] = {
    query: q,
    mtRank: mtHit ? mtHit.rank : null,
    mtInPack20: Boolean(mtHit),
    topCompetitors: items
  };
}

fs.writeFileSync('pipeline/maps_audit.json', JSON.stringify(out, null, 2));
console.log('Saved pipeline/maps_audit.json successfully!');
