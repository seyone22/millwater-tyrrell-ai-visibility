import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const login = env.match(/DATAFORSEO_LOGIN=(.*)/)[1].trim();
const pass = env.match(/DATAFORSEO_PASSWORD=(.*)/)[1].trim();
const dfsAuth = 'Basic ' + Buffer.from(`${login}:${pass}`).toString('base64');

const hist = JSON.parse(fs.readFileSync('pipeline/hist.json', 'utf8'));

for (const domain of ['mcna.com.au', 'bwbfamilylaw.com.au', 'fmlaw.com.au', 'qldestatelawyers.com.au', 'hopgoodganim.com.au']) {
  console.log(`Fetching 14-month DataForSEO historical LLM mentions for ${domain}...`);
  const target = [{ domain, search_filter: 'include', search_scope: ['any'], include_subdomains: true }];
  const hRes = await fetch('https://api.dataforseo.com/v3/ai_optimization/llm_mentions/historical/live', {
    method: 'POST',
    headers: { Authorization: dfsAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      target,
      location_code: 2036,
      language_code: 'en',
      platform: 'google',
      date_from: '2025-08-01'
    }])
  });
  const hJson = await hRes.json();
  const hTask = hJson.tasks?.[0];
  if (hTask?.status_code === 20000) {
    hist[domain] = { hist: hTask.result?.[0]?.items || [] };
  }
}
fs.writeFileSync('pipeline/hist.json', JSON.stringify(hist, null, 2));
console.log('Updated pipeline/hist.json with verified domains.');

// Also fetch combined 16-keyword AI search volume cluster for Slide 2
const keywords = [
  "family lawyer",
  "divorce lawyer",
  "wills and estates lawyer",
  "estate planning lawyer",
  "probate lawyer",
  "contesting a will",
  "enduring power of attorney qld",
  "binding financial agreement lawyer",
  "property settlement lawyer",
  "family lawyer brisbane",
  "wills and estates lawyer brisbane",
  "contesting a will queensland",
  "divorce lawyer brisbane",
  "deceased estate lawyer",
  "family lawyer ipswich",
  "child custody lawyer"
];
const kwRes = await fetch('https://api.dataforseo.com/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live', {
  method: 'POST',
  headers: { Authorization: dfsAuth, 'Content-Type': 'application/json' },
  body: JSON.stringify([{
    keywords,
    location_code: 2036,
    language_code: 'en'
  }])
});
const kwJson = await kwRes.json();
if (kwJson.tasks?.[0]?.status_code === 20000) {
  fs.writeFileSync('pipeline/raw_ai_keyword_data.json', JSON.stringify(kwJson, null, 2));
  console.log('Updated pipeline/raw_ai_keyword_data.json with 16 family law & wills/estates AI keywords.');
}
