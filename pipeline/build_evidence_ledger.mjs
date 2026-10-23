import fs from 'fs';

const CFG = JSON.parse(fs.readFileSync('client.config.json', 'utf8'));
const metrics = JSON.parse(fs.readFileSync('pipeline/metrics.json', 'utf8'));
const citations = JSON.parse(fs.readFileSync('pipeline/citations.json', 'utf8'));
const hist = JSON.parse(fs.readFileSync('pipeline/hist.json', 'utf8'));
const kwData = JSON.parse(fs.readFileSync('pipeline/raw_ai_keyword_data.json', 'utf8'));
const siteAudit = JSON.parse(fs.readFileSync('pipeline/site_audit.json', 'utf8'));
const mapsAudit = JSON.parse(fs.readFileSync('pipeline/maps_audit.json', 'utf8'));
const serpAudit = JSON.parse(fs.readFileSync('pipeline/serp_audit.json', 'utf8'));
const ansFull = JSON.parse(fs.readFileSync('pipeline/ans_full.json', 'utf8'));

const M_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mtHistArr = [...(hist['millwatertyrrell.com.au']?.hist || [])].reverse();
const histMonths = mtHistArr.map(h => `${M_NAMES[h.month]} ${String(h.year).slice(2)}`);
const trackedHistOrder = [
  'millwatertyrrell.com.au',
  'bwbfamilylaw.com.au',
  'degroots.com.au',
  'phillipsfamilylaw.com.au',
  'qldestatelawyers.com.au',
  'mcna.com.au',
  'walkerpender.com.au',
  'fmlaw.com.au',
  'hopgoodganim.com.au'
];
const histDomains = {};
for (const dom of trackedHistOrder) {
  const obj = hist[dom];
  if (obj?.hist) {
    histDomains[dom] = {
      mentions: [...obj.hist].reverse().map(h => h.metrics?.mentions || 0)
    };
  }
}

let md = `# Millwater Tyrrell Law — Master Raw Evidence Ledger (Empirical GEO / AEO Audit)

- **Target Entity:** Millwater Tyrrell Law (\`https://millwatertyrrell.com.au/\`)
- **Principals:** David Millwater (Partner — Family Law & Accredited Family Dispute Resolution Practitioner) & Matthew Tyrrell (Partner — Wills & Estates, Commercial & Property Law)
- **Headquarters:** Level 1, 215 Brisbane Street, Ipswich QLD 4305 · Phone: \`(07) 3447 0416\` · Google Maps CID: \`6376809625893182443\` (\`4.8★\`, \`107\` Google Reviews)
- **Target Practice Scope:** **Family Law** (Divorce, Property Settlement, Parenting & Custody, Accredited Mediation / FDRP, Spousal Maintenance, Domestic Violence) & **Wills and Estates** (Wills, Enduring Powers of Attorney, Testamentary Trusts, Probate & Deceased Estate Administration, Contesting a Will / Family Provision Applications)
- **Target Geographic Scope:** **Ipswich & Greater Brisbane Only** (8 Corridors: Ipswich Central, Springfield & Greater Springfield, Brisbane CBD, Brisbane West / Indooroopilly & Centenary, Brisbane South / Mt Gravatt & Sunnybank, Brisbane North / Chermside & North Lakes, Brisbane East & Bayside / Carindale & Wynnum, Logan & Western Corridor)
- **Generated At:** \`${metrics.generatedAt}\`
- **Empirical Study Architecture:**
  - **280 Live AI Responses** across **8 Ipswich & Brisbane Geographic Corridors** $\\times$ **7 Family Law & Wills/Estates Buyer-Intent Prompts** $\\times$ **5 AI Engines** (\`ChatGPT\`, \`Perplexity\`, \`Google AI Mode\`, \`Google Gemini 3.8 Flash\`, \`Anthropic Claude Sonnet 4.6\`).
  - **56 Live Google Organic SERPs** (\`depth=20\`) paired 1:1 with the 56 corridor $\\times$ prompt cells.
  - **12 Live Google Maps 20-Packs** + **Direct Millwater Tyrrell Law GBP Audit** with verified Google CID (\`6376809625893182443\`) and competitor GBP category taxonomy comparison.
  - **Firecrawl Technical, Sitemap & JSON-LD Schema Crawl** across \`https://millwatertyrrell.com.au/\` (173 sitemap URLs, 88 duplicate \`/testimonials/*\` hash URLs, 18 deep-scraped practice & lawyer pages).
  - **15-Month Historical LLM Mentions Curve (\`Aug 2025 – Oct 2026\`)** via DataForSEO \`/v3/ai_optimization/llm_mentions/historical/live\` across 9 Ipswich & Brisbane law firm domains.
  - **12-Month AI Keyword Demand Series (\`Oct 2025 – Sep 2026\`)** via DataForSEO \`/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live\` across 16 Family Law & Wills/Estates search terms.

---

## 1. Executive Headline Metrics

| Metric | Value | Notes |
|---|---|---|
| **Total AI Answers Audited ($N$)** | \`${metrics.totalAnswers}\` | 8 Ipswich/Brisbane corridors $\\times$ 7 practice prompts $\\times$ 5 AI engines |
| **Millwater Tyrrell Law AI Mention Rate** | **\`${metrics.mtMentioned} / ${metrics.totalAnswers}\` (\`${metrics.mtRatePct}%\`)** | Mentioned in ${metrics.mtMentioned} of ${metrics.totalAnswers} responses |
| **Millwater Tyrrell Law Top-3 Shortlist Rate** | **\`${metrics.mtTop3} / ${metrics.totalAnswers}\` (\`${metrics.mtTop3Pct}%\`)** | Ranked #1, #2, or #3 in ${metrics.mtTop3} responses |
| **Millwater Tyrrell Law #1 Primary Recommendation** | **\`${metrics.mtNum1} / ${metrics.totalAnswers}\` (\`${metrics.mtNum1Pct}%\`)** | First-named law firm in ${metrics.mtNum1} responses |
| **Millwater Tyrrell Law Direct Domain Citation Rate** | **\`${metrics.mtCited} / ${metrics.totalAnswers}\` (\`${metrics.mtCitedPct}%\`)** | \`millwatertyrrell.com.au\` cited in ${metrics.mtCited} responses (\`${citations.clientDomainCitations}\` total links out of \`${citations.totalCitations}\`) |
| **Google Organic Top-10 SERP Presence** | **\`${metrics.serpTop10Count} / ${metrics.totalSerps}\` (\`${((metrics.serpTop10Count / metrics.totalSerps) * 100).toFixed(1)}%\`)** | Top-20 presence: \`${metrics.serpTop20Count} / ${metrics.totalSerps}\` |

---

## 2. Platform Breakdown (5 AI Engines)

| AI Engine | Model / Endpoint | Answers | Millwater Tyrrell Mentions | Share of Voice (%) | Top-3 Shortlist | #1 Rank | Direct Citations | Avg Chars | Avg Citations |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
`;

for (const [plat, d] of Object.entries(metrics.byPlat)) {
  md += `| **${plat.toUpperCase()}** | Live API | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} (${d.top3Pct}%) | ${d.num1} | ${d.cited} | ${d.avgChars} | ${d.avgCitations} |\n`;
}

md += `\n---\n\n## 3. Geographic Breakdown (8 Ipswich & Greater Brisbane Corridors)\n\n| Corridor | State | Answers | Millwater Tyrrell Mentions | Share (%) | Top-3 | #1 | Organic Top-10 (/7) | GBP Pack Rank | Top Local AI Leader |\n|---|---|---:|---:|---:|---:|---:|---:|---|---|\n`;

for (const [cid, d] of Object.entries(metrics.byCity)) {
  const leader = d.topFirms?.[0] ? `${d.topFirms[0].name} (${d.topFirms[0].count}/35, ${d.topFirms[0].pct}%)` : 'None';
  const gbpRank = d.gbp?.inMapsPack20 ? `#${d.gbp.mapsPackRank} (4.8★, 107 rev)` : 'Absent';
  md += `| **${d.displayLoc || d.name}** | ${d.state} | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} | ${d.num1} | ${d.serpTop10}/7 | ${gbpRank} | ${leader} |\n`;
}

md += `\n---\n\n## 4. Buyer-Intent Practice Prompt Breakdown (4 Family Law + 3 Wills & Estates Archetypes)\n\n| Prompt ID | Practice Category | Answers | Millwater Tyrrell Mentions | Share (%) | Top-3 | #1 | Category AI Leader |\n|---|---|---:|---:|---:|---:|---:|---|\n`;

for (const [pid, d] of Object.entries(metrics.byCat)) {
  const leader = d.topFirms?.[0] ? `${d.topFirms[0].name} (${d.topFirms[0].count}/40, ${d.topFirms[0].pct}%)` : 'None';
  md += `| \`${pid}\` | **${d.category}** | ${d.total} | ${d.mentioned} | **${d.ratePct}%** | ${d.top3} | ${d.num1} | ${leader} |\n`;
}

md += `\n---\n\n## 5. Ipswich & Brisbane Family Law + Wills & Estates AI Leaderboard (Top 25 Entities Across 280 Answers)\n\n| Rank | Law Firm / Entity | Total Mentions (/280) | Share of Voice (%) | Top-3 Shortlists | #1 Ranks | ChatGPT | Perplexity | AI Mode | Gemini | Claude |\n|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n`;

metrics.leaderboard.slice(0, 25).forEach((f, idx) => {
  md += `| ${idx + 1} | **${f.name}** | ${f.mentions} | **${f.sharePct}%** | ${f.top3} (${f.top3Pct}%) | ${f.num1} | ${f.byPlat.chatgpt || 0} | ${f.byPlat.perplexity || 0} | ${f.byPlat.aimode || 0} | ${f.byPlat.gemini || 0} | ${f.byPlat.claude || 0} |\n`;
});

md += `\n---\n\n## 6. Live IRLS Logistic Regression Results ($N = ${metrics.irls.n}$, Positive Mentions = ${metrics.irls.positives})\n\n| Predictor | Coefficient ($\\hat{\\beta}$) | Std. Error (SE) | Wald $z$ | Odds Ratio (OR) | 95% CI | $p$-Value |\n|---|---:|---:|---:|---:|---|---:|\n`;

for (const c of metrics.irls.coefficients) {
  md += `| **${c.name}** | \`${c.beta >= 0 ? '+' : ''}${c.beta.toFixed(2)}\` | \`${c.se.toFixed(2)}\` | \`${c.z.toFixed(2)}\` | \`${c.or ? c.or + 'x' : '—'}\` | \`${c.ci95 ? '[' + c.ci95[0] + 'x, ' + c.ci95[1] + 'x]' : '—'}\` | \`${c.pValue}\` |\n`;
}

md += `\n---\n\n## 7. Critical Technical, Sitemap & Schema Forensics (\`site_audit.json\`)\n\n1. **Malformed Squarespace JSON-LD Across All 18 Audited Pages:**\n   - \`Organization.telephone\` is set to \`"734470416"\` (invalid 9-digit string missing leading \`0\` or \`+61 7\`).\n   - \`Organization.sameAs\` is an empty array \`[]\` (zero entity disambiguation links to Queensland Law Society, Doyle's Guide, ThreeBestRated, Lawzana, LawConnect, Facebook, or LinkedIn).\n   - \`LocalBusiness\` is used instead of \`LegalService\` / \`Attorney\`, with trailing empty commas in \`openingHours\` (\`"Mo 08:30-17:00, ..., Fr 08:30-17:00, , "\`), raw newline strings in \`address\`, and **zero \`areaServed\` declarations** for Springfield, Brisbane, or Western Suburbs.\n   - \`WebSite.description\` injects unescaped raw HTML (\`"<p class=\\"\\" style=\\"white-space:pre-wrap;\\">..."\`).\n2. **Squarespace Testimonial URL Bloat (88 Junk Hash URLs = 50.9% of Sitemap):**\n   - Out of \`173\` total URLs in \`sitemap.xml\`, **88 URLs** are duplicate Squarespace testimonial items with recursive random hash slugs (\`/testimonials/acr8b2gekwkkgl9-w6cf8-aakfa-d2kkm-...\`), plus a live \`/hide\` page and an HTTP \`403\` broken link on \`/search\` in the main header navigation.\n   - \`https://millwatertyrrell.com.au/llms.txt\` returns \`HTTP 404\`.\n3. **Severe Wills & Estates Content Vacuum & Missing Brisbane/Springfield Pages:**\n   - Homepage \`<title>\` is \`"Ipswich Lawyers - Ipswich Expert Family & Commercial Lawyers"\` — omitting **Wills & Estates** and **Brisbane / Springfield** entirely.\n   - Zero dedicated pages exist for **Probate**, **Letters of Administration**, **Deceased Estate Administration**, or **Contesting a Will / Family Provision Applications (FPA)**.\n   - On \`/pricing\`, there are pricing cards for Family Law, Business Law, and Criminal Law, but **no Wills & Estates pricing card** despite advertising fixed-fee Wills.\n\n---\n\n## 8. Ipswich Google Business Profile (GBP) Category Taxonomy Comparison (\`maps_audit.json\`)\n\n| Pack Rank | Firm Name | Primary GBP Category | Additional Categories | Rating | Reviews | Domain | Google CID |\n|---:|---|---|---|---:|---:|---|---|\n`;

for (const b of (mapsAudit.ipswich?.topCompetitors || []).slice(0, 10)) {
  const addCats = (b.additional_categories || []).join(', ') || 'None';
  md += `| #${b.rank} | **${b.title}** | \`${b.category || '—'}\` | ${addCats} | ${b.rating !== null ? b.rating + '★' : '—'} | ${b.reviews || 0} | \`${b.domain || '—'}\` | \`${b.cid || '—'}\` |\n`;
}

md += `\n---\n\n## 9. 15-Month Historical AI Mentions (\`hist.json\` — Aug 2025 to Oct 2026)\n\n| Domain | ${histMonths.join(' | ')} |\n|---|${histMonths.map(() => '---:').join('|')}|\n`;

for (const [dom, d] of Object.entries(histDomains)) {
  md += `| \`${dom}\` | ${d.mentions.join(' | ')} |\n`;
}

md += `\n---\n\n## 10. Complete 280-Answer Empirical Audit Log (\`ans_full.json\`)\n\n| # | Corridor | Prompt ID | Engine | Millwater Tyrrell Mentioned | Rank | Cited | Entities Extracted | Snippet |\n|---:|---|---|---|---|---:|---|---|---|\n`;

ansFull.forEach((a, i) => {
  const ents = a.mentions.slice(0, 5).join(', ') || 'None';
  const snip = (a.snippet || '').slice(0, 140).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
  md += `| ${i + 1} | ${a.displayLoc || a.cityName} | \`${a.pk}\` | \`${a.plat}\` | ${a.mtMentioned ? '**YES**' : 'No'} | ${a.mtRank || '—'} | ${a.mtCited ? 'YES' : 'No'} | ${ents} | ${snip}... |\n`;
});

fs.writeFileSync('MILLWATER_TYRRELL_LAW_RAW_EVIDENCE_LEDGER.md', md);
console.log('Wrote MILLWATER_TYRRELL_LAW_RAW_EVIDENCE_LEDGER.md (' + md.length + ' bytes)');
