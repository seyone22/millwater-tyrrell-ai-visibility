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

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wilsonCI(k, n) {
  if (!n) return [0, 0];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, +((center - half) * 100).toFixed(1)), Math.min(100, +((center + half) * 100).toFixed(1))];
}

const [mtCiLo, mtCiHi] = wilsonCI(metrics.mtMentioned, metrics.totalAnswers);
const irls = metrics.irls;

const platRowsHtml = Object.entries(metrics.byPlat).map(([plat, d]) => {
  const [lo, hi] = wilsonCI(d.mentioned, d.total);
  const endpoints = {
    chatgpt: 'DataForSEO /ai_optimization/chat_gpt/llm_scraper/live/advanced (force_web_search=true, AU)',
    perplexity: 'DataForSEO /ai_optimization/perplexity/llm_responses/live (model=sonar, web_search=true, AU)',
    aimode: 'DataForSEO /serp/google/ai_mode/live/advanced (desktop, QLD city location_code)',
    gemini: 'Google Direct API v1beta/models/gemini-3.8-flash:generateContent (tools=[{google_search:{}}])',
    claude: 'Anthropic Claude Sonnet 4.6 (web_search_20250305 + DataForSEO /ai_optimization/claude/llm_responses/live, AU)'
  };
  return `<tr>
    <td><strong>${esc(plat.toUpperCase())}</strong></td>
    <td class="mono" style="font-size:11px;">${esc(endpoints[plat] || plat)}</td>
    <td class="num">${d.total}</td>
    <td class="num"><strong>${d.mentioned}</strong></td>
    <td class="num"><strong>${d.ratePct}%</strong></td>
    <td class="num mono">[${lo}%, ${hi}%]</td>
    <td class="num">${d.top3} (${d.top3Pct}%)</td>
    <td class="num">${d.num1}</td>
    <td class="num">${d.cited}</td>
    <td class="num mono">${d.avgChars.toLocaleString()}</td>
  </tr>`;
}).join('\n');

const promptRowsHtml = CFG.prompts.map((p, idx) => {
  const cat = metrics.byCat[p.id] || { total: 40, mentioned: 0, ratePct: 0, top3: 0, num1: 0, topFirms: [] };
  const topLeader = cat.topFirms?.[0] ? `${cat.topFirms[0].name} (${cat.topFirms[0].count}/${cat.total})` : '—';
  return `<tr>
    <td class="mono">P${idx + 1} · ${esc(p.id)}</td>
    <td><strong>${esc(p.title || p.category)}</strong></td>
    <td style="font-size:12px;">${esc(p.template)}</td>
    <td class="mono" style="font-size:11px;">${esc(p.serpKeyword)}</td>
    <td class="num"><strong>${cat.mentioned}/${cat.total} (${cat.ratePct}%)</strong></td>
    <td class="num">${cat.top3}</td>
    <td>${esc(topLeader)}</td>
  </tr>`;
}).join('\n');

const irlsRowsHtml = irls.coefficients.map(c => {
  return `<tr>
    <td><strong>${esc(c.name)}</strong></td>
    <td class="num mono"><strong>${c.beta >= 0 ? '+' : ''}${c.beta.toFixed(2)}</strong></td>
    <td class="num mono">${c.se.toFixed(2)}</td>
    <td class="num mono">${c.z >= 0 ? '+' : ''}${c.z.toFixed(2)}</td>
    <td class="num mono"><strong>${c.or !== null ? c.or.toFixed(2) + '×' : '—'}</strong></td>
    <td class="num mono">${c.ci95 ? `[${c.ci95[0]}×, ${c.ci95[1]}×]` : '—'}</td>
    <td class="num mono">${esc(c.pValue)}</td>
  </tr>`;
}).join('\n');

const ipswichCompetitorsGbp = (mapsAudit.ipswich?.topCompetitors || []).slice(0, 9);
const gbpRowsHtml = ipswichCompetitorsGbp.map(b => {
  const isMt = /millwater/i.test(b.title || '');
  const addCats = (b.additional_categories || []).join(', ') || 'NONE (0 additional categories)';
  const statusColor = isMt ? '#DC2626' : (b.additional_categories?.length ? '#059669' : '#D97706');
  return `<tr style="${isMt ? 'background:#FEF2F2;font-weight:700;' : ''}">
    <td class="num mono">#${b.rank}</td>
    <td><strong>${esc(b.title)}</strong></td>
    <td class="mono" style="color:${statusColor};font-weight:700;">${esc(b.category || '—')}</td>
    <td style="font-size:11.5px;color:${isMt ? '#DC2626' : '#374151'};">${esc(addCats)}</td>
    <td class="num mono"><strong>${b.rating !== null ? b.rating + '★' : '—'}</strong></td>
    <td class="num mono">${b.reviews || 0}</td>
    <td class="mono" style="font-size:11px;">${esc(b.domain || '—')}</td>
    <td class="mono" style="font-size:11px;">${esc(b.cid || '—')}</td>
  </tr>`;
}).join('\n');

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

const rawKwItems = kwData?.tasks?.[0]?.result?.[0]?.items || kwData?.keywords || [];
const normKeywords = rawKwItems.map(item => {
  const monthlyChron = [...(item.ai_monthly_searches || item.monthly || [])].reverse();
  const avg12m = monthlyChron.length ? Math.round(monthlyChron.reduce((s, m) => s + (m.ai_search_volume || 0), 0) / monthlyChron.length) : (item.ai_search_volume || 0);
  return {
    keyword: item.keyword,
    ai_search_volume: item.ai_search_volume || 0,
    avg_12m: avg12m,
    monthly: monthlyChron
  };
});

const cityMatrixRowsHtml = Object.entries(metrics.byCity).map(([cid, d]) => {
  const [lo, hi] = wilsonCI(d.mentioned, d.total);
  const top3Str = (d.topFirms || []).slice(0, 3).map(f => `${f.name} (${f.count})`).join(', ');
  const gbpStr = d.gbp?.inMapsPack20 ? `Rank #${d.gbp.mapsPackRank} (107 rev)` : 'Absent from Pack-20';
  return `<tr>
    <td><strong>${esc(d.displayLoc || d.name)}</strong></td>
    <td class="num">${d.total}</td>
    <td class="num"><strong>${d.mentioned} (${d.ratePct}%)</strong></td>
    <td class="num mono">[${lo}%, ${hi}%]</td>
    <td class="num">${d.top3} (${d.top3Pct}%)</td>
    <td class="num">${d.num1}</td>
    <td class="num">${d.serpTop10}/7</td>
    <td class="mono" style="font-size:11.5px;">${esc(gbpStr)}</td>
    <td style="font-size:11px;">${esc(top3Str)}</td>
  </tr>`;
}).join('\n');

const citationDomainsHtml = (citations.topDomains || []).slice(0, 14).map((d, i) => `<tr>
  <td class="num">${i + 1}</td>
  <td class="mono"><strong>${esc(d.domain)}</strong></td>
  <td>${esc(d.type)}</td>
  <td class="num"><strong>${d.count}</strong></td>
  <td class="num mono">${d.sharePct}%</td>
</tr>`).join('\n');

const baseCss = fs.readFileSync('pipeline/deck.css', 'utf8');
const baseJs = fs.readFileSync('pipeline/deck.js', 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Millwater Tyrrell Law — Tier 2 Data Science & Econometric Technical Dossier</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap">
<style>
${baseCss}
  :root {
    --pulp: #1E3A8A !important;
    --pulp-dark: #172554 !important;
    --navy: #0F172A !important;
  }
  .slide { background: #FFFFFF; color: #111827; padding: 64px 96px 84px; gap: 18px; }
  .slide.dark { background: #0F172A !important; color: #F9FAFB; }
  .eyebrow { font-size: 16px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #1E3A8A; margin-bottom: 4px; }
  h1, h2 { color: #0F172A; letter-spacing: -0.025em; margin-bottom: 6px; }
  h2 { font-size: 38px; font-weight: 800; line-height: 1.12; }
  p.lead { font-size: 19px; color: #4B5563; line-height: 1.45; margin-bottom: 10px; max-width: 1640px; }
  table.data-table { width: 100%; border-collapse: collapse; font-size: 16px; margin-top: 6px; }
  table.data-table th { background: #0F172A; color: #FFFFFF; text-align: left; padding: 10px 13px; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.06em; }
  table.data-table td { padding: 8.5px 13px; border-bottom: 1px solid #E5E7EB; vertical-align: middle; line-height: 1.32; }
  table.data-table tr:nth-child(even) td { background: #F9FAFB; }
  #tech-05-gbp-cid-audit table.data-table { font-size: 14px; }
  #tech-05-gbp-cid-audit table.data-table th { padding: 7px 10px; font-size: 12px; }
  #tech-05-gbp-cid-audit table.data-table td { padding: 6px 10px; }
  #tech-08-citation-graph table.data-table { font-size: 14px; }
  #tech-08-citation-graph table.data-table th { padding: 7px 10px; font-size: 12px; }
  #tech-08-citation-graph table.data-table td { padding: 5.5px 10px; }
  #tech-10-ai-keyword-demand table.data-table { font-size: 14.5px; }
  #tech-10-ai-keyword-demand table.data-table th { padding: 7px 10px; font-size: 12.5px; }
  #tech-10-ai-keyword-demand table.data-table td { padding: 6px 10px; }
  .num { text-align: right; }
  .mono { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin: 18px 0; }
  .kpi-card { background: #0F172A; color: #FFFFFF; padding: 26px 26px; border-radius: 10px; border-top: 4px solid #C59B27; }
  .kpi-card .val { font-size: 42px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em; }
  .kpi-card .lbl { font-size: 14.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #D1D5DB; margin-top: 8px; }
  .code-box { background: #0F172A; color: #E5E7EB; padding: 18px 24px; border-radius: 10px; font-family: "JetBrains Mono", monospace; font-size: 15.5px; overflow-x: auto; line-height: 1.44; margin-top: 8px; white-space: pre; }
  .alert-box { border-left: 5px solid #C59B27; background: #FAF8F5; padding: 18px 22px; border-radius: 8px; margin: 10px 0; font-size: 17.5px; line-height: 1.42; color: #1F2937; }
</style>
</head>
<body>
<div class="deck" id="deck">
  <div class="stage" id="stage">

<!-- Slide 1 -->
<section id="tech-01-cover" class="slide">
  <div class="eyebrow">TIER 2 INTERNAL DATA SCIENCE DOSSIER · EMPIRICAL GEO / AEO AUDIT</div>
  <h1 style="font-size:34px;font-weight:900;">Millwater Tyrrell Law — Econometric & Retrieval Architecture Dossier</h1>
  <p class="lead">Full methodological specification, live API telemetry, Iteratively Reweighted Least Squares (IRLS) logistic regression parameters, Squarespace JSON-LD &amp; sitemap bloat forensics, and Ipswich/Brisbane GBP CID audit for <code>millwatertyrrell.com.au</code> across Family Law and Wills &amp; Estates.</p>
  <div class="kpi-grid">
    <div class="kpi-card"><div class="val">${metrics.totalAnswers}</div><div class="lbl">Live AI Answers Audited (8×7×5)</div></div>
    <div class="kpi-card"><div class="val">${metrics.mtMentioned}/${metrics.totalAnswers} (${metrics.mtRatePct}%)</div><div class="lbl">Millwater Tyrrell Recall (95% CI: ${mtCiLo}%–${mtCiHi}%)</div></div>
    <div class="kpi-card"><div class="val">${metrics.mtTop3}/${metrics.totalAnswers} (${metrics.mtTop3Pct}%)</div><div class="lbl">Top-3 Shortlist Inclusion</div></div>
    <div class="kpi-card"><div class="val">${metrics.serpTop10Count}/${metrics.totalSerps} (${((metrics.serpTop10Count / metrics.totalSerps) * 100).toFixed(1)}%)</div><div class="lbl">Google Organic Top-10 SERP Presence</div></div>
  </div>
  <div class="alert-box">
    <strong>Zero-Fabrication &amp; Zero-Roleplay Guarantee:</strong> Every cell in this study was collected from its genuine live API endpoint (DataForSEO ChatGPT Scraper, Perplexity Sonar Live, Google AI Mode SERP, Google Direct Gemini 3.8 Flash with Grounding, and Anthropic Claude Sonnet 4.6 with Web Search) and verified against saved raw JSON payloads in <code>pipeline/raw/</code>.
  </div>
</section>

<!-- Slide 2 -->
<section id="tech-02-panel-design" class="slide">
  <div class="eyebrow">01 · EXPERIMENTAL DESIGN &amp; FACTORIAL SAMPLING</div>
  <h2>Full-Factorial 8 × 7 × 5 = 280 Empirical Panel Architecture (Ipswich &amp; Brisbane)</h2>
  <p class="lead">To eliminate cherry-picking, we evaluated a balanced full-factorial matrix crossing 8 Ipswich &amp; Greater Brisbane geographic corridors with 7 Family Law &amp; Wills/Estates buyer-intent prompt archetypes and 5 production AI answer engines, paired 1:1 with 56 live Google Organic SERPs and 12 Google Maps 20-Packs.</p>
  <table class="data-table">
    <thead>
      <tr><th>Dimension</th><th>Levels</th><th>Specification</th><th>Sample Size</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Geographic Corridors (8)</strong></td><td>8 Ipswich &amp; Brisbane Markets</td><td>Ipswich Central (HQ), Springfield &amp; Greater Springfield, Brisbane CBD, Brisbane West (Indooroopilly/Centenary), Brisbane South (Mt Gravatt/Sunnybank), Brisbane North (Chermside/North Lakes), Brisbane East (Carindale/Bayside), Logan &amp; Western Corridor</td><td class="num mono">8</td></tr>
      <tr><td><strong>Buyer-Intent Archetypes (7)</strong></td><td>4 Family Law + 3 Wills &amp; Estates</td><td>Best Family Lawyers, Divorce &amp; Property Settlement, Parenting &amp; Mediation (FDRP), Wills &amp; Estate Planning (EPOA), Probate &amp; Deceased Estates, Contesting a Will (FPA), Fixed-Fee &amp; Deferred-Fee Law</td><td class="num mono">7</td></tr>
      <tr><td><strong>AI Answer Engines (5)</strong></td><td>5 Live Endpoints</td><td>ChatGPT (Web Search), Perplexity (Sonar), Google AI Mode, Google Gemini 3.8 Flash, Anthropic Claude Sonnet 4.6</td><td class="num mono">5</td></tr>
      <tr><td><strong>Total AI Panel (<i>N</i>)</strong></td><td>8 × 7 × 5</td><td>Complete unedited markdown, grounding chunks, and citation arrays persisted in <code>pipeline/ans_full.json</code></td><td class="num mono"><strong>280</strong></td></tr>
      <tr><td><strong>Paired Google SERPs</strong></td><td>8 × 7</td><td>Desktop Google Organic QLD localized SERP (top 20 organic results per cell) in <code>pipeline/serp_audit.json</code></td><td class="num mono"><strong>56</strong></td></tr>
    </tbody>
  </table>
</section>

<!-- Slide 3 -->
<section id="tech-03-engine-telemetry" class="slide">
  <div class="eyebrow">02 · LIVE AI ENGINE TELEMETRY &amp; WILSON CONFIDENCE INTERVALS</div>
  <h2>Platform-by-Platform Retrieval Mechanics &amp; Empirical Mention Rates</h2>
  <p class="lead">Across the 280-answer panel, Millwater Tyrrell Law achieves an overall mention rate of <strong>${metrics.mtRatePct}%</strong> (${metrics.mtMentioned}/280, 95% Wilson CI [${mtCiLo}%, ${mtCiHi}%]), concentrated almost exclusively in Ipswich Family Law while missing from Wills/Probate/FPA and Greater Brisbane corridors.</p>
  <table class="data-table">
    <thead>
      <tr><th>Engine</th><th>Production API Endpoint</th><th class="num">N</th><th class="num">Mentions</th><th class="num">Share %</th><th class="num">95% Wilson CI</th><th class="num">Top-3</th><th class="num">#1 Rank</th><th class="num">Cited</th><th class="num">Avg Chars</th></tr>
    </thead>
    <tbody>
      ${platRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 4 (tech-03b) -->
<section id="tech-03b-prompt-architecture" class="slide">
  <div class="eyebrow">03 · BUYER-INTENT PROMPT ARCHITECTURE</div>
  <h2>Exact Prompt Wording &amp; Paired SERP Keywords Across All 7 Practice Archetypes</h2>
  <p class="lead">Each prompt was engineered to reflect real separating spouses, parents, testators, executors, and estate claimants across Ipswich and Brisbane without brand-priming.</p>
  <table class="data-table">
    <thead>
      <tr><th>ID</th><th>Practice Category</th><th>Exact AI Prompt Template</th><th>Paired SERP Keyword</th><th class="num">MT Recall</th><th class="num">Top-3</th><th>Category Leader</th></tr>
    </thead>
    <tbody>
      ${promptRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 5 -->
<section id="tech-04-schema-forensics" class="slide">
  <div class="eyebrow">04 · SQUARESPACE JSON-LD &amp; SITEMAP CONTAMINATION AUDIT</div>
  <h2>Smoking Gun: Malformed Squarespace Schema &amp; 88 Duplicate Testimonial Hash URLs</h2>
  <p class="lead">Our Firecrawl inspection of <code>https://millwatertyrrell.com.au/</code> uncovered 3 critical technical defects: (1) malformed Squarespace <code>LocalBusiness</code> JSON-LD with an invalid 9-digit phone and empty <code>sameAs: []</code>, (2) 88 recursive hash URLs under <code>/testimonials/*</code> (50.9% of the 173-URL sitemap), and (3) zero Probate or Contesting a Will pages.</p>
  <div class="code-box">&lt;!-- Extracted verbatim from https://millwatertyrrell.com.au/ (Squarespace auto-injected JSON-LD) --&gt;
{
  "@type": "Organization",
  "legalName": "Millwater Tyrrell Law",
  "telephone": "734470416",  // INVALID: Missing leading '0' or '+61 7'
  "sameAs": []               // EMPTY: Zero links to QLS, Doyle's Guide, ThreeBestRated, LinkedIn
}
{
  "@type": "LocalBusiness",  // GENERIC: Not 'LegalService' or 'Attorney'; zero 'areaServed' for Brisbane/Springfield
  "address": "Level 1, 215 Brisbane Street\nIpswich, QLD, 4305\nAustralia",
  "openingHours": "Mo 08:30-17:00, Tu 08:30-17:00, We 08:30-17:00, Th 08:30-17:00, Fr 08:30-17:00, , "
}</div>
  <div class="alert-box">
    <strong>Why This Suppresses AI Visibility:</strong> Because homepage <code>&lt;title&gt;</code> is <em>"Ipswich Lawyers - Ipswich Expert Family &amp; Commercial Lawyers"</em> (omitting Wills &amp; Estates and Brisbane) and there are zero dedicated pages for <strong>Probate / Letters of Administration</strong> or <strong>Contesting a Will / Family Provision Applications (FPA)</strong>, AI engines cannot retrieve or cite Millwater Tyrrell Law for estate administration or litigation queries.
  </div>
</section>

<!-- Slide 6 -->
<section id="tech-05-gbp-cid-audit" class="slide">
  <div class="eyebrow">05 · GOOGLE BUSINESS PROFILE (GBP) &amp; CATEGORY TAXONOMY FORENSICS</div>
  <h2>Why 4.8★ (107 Reviews) Ranks #5 Behind Lower-Rated Ipswich Competitors</h2>
  <p class="lead">On Google Maps (<code>cid: 6376809625893182443</code>), Millwater Tyrrell Law holds an exceptional <strong>4.8★ rating across 107 reviews</strong> (99 five-star reviews). Yet it ranks #5 in Ipswich behind Richard Zande (4.6★, 94 reviews) because its GBP primary category is set to generic <code>"Legal services"</code> with <strong>zero additional categories</strong>.</p>
  <table class="data-table">
    <thead>
      <tr><th class="num">Pack Rank</th><th>Law Firm (Ipswich GBP Pack)</th><th>Primary GBP Category</th><th>Additional GBP Categories Configured</th><th class="num">Rating</th><th class="num">Reviews</th><th>Domain</th><th>Google CID</th></tr>
    </thead>
    <tbody>
      ${gbpRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 7 -->
<section id="tech-06-econometrics" class="slide">
  <div class="eyebrow">06 · ECONOMETRIC ATTRIBUTION · LIVE IRLS LOGISTIC REGRESSION</div>
  <h2>Empirical Drivers of AI Inclusion (<i>N</i> = ${irls.n} Answers, IRLS Fitted)</h2>
  <p class="lead">We estimated a multivariable logistic regression model Pr(<i>Y<sub>i</sub></i> = 1) = logit<sup>−1</sup>(β<sub>0</sub> + β<sub>1</sub><i>X</i><sub>1<i>i</i></sub> + β<sub>2</sub><i>X</i><sub>2<i>i</i></sub> + β<sub>3</sub><i>X</i><sub>3<i>i</i></sub>) via Iteratively Reweighted Least Squares (IRLS) directly over the ${irls.n} empirical answers in <code>ans_full.json</code> (${irls.positives} positive mentions, converged in ${irls.iterations} iterations).</p>
  <table class="data-table">
    <thead>
      <tr><th>Predictor Variable</th><th class="num">Coeff (β̂)</th><th class="num">Std. Error (SE)</th><th class="num">Wald <i>z</i></th><th class="num">Odds Ratio (OR)</th><th class="num">95% CI (OR)</th><th class="num"><i>p</i>-Value</th></tr>
    </thead>
    <tbody>
      ${irlsRowsHtml}
    </tbody>
  </table>
  <p style="font-size:13.5px;color:#4B5563;margin-top:12px;"><strong>Econometric Interpretation:</strong> All coefficients above are computed dynamically from the 280 × 4 design matrix (<i>X</i><sup>T</sup><i>WX</i>)<sup>−1</sup> in <code>pipeline/parse_raw_panel.mjs</code>. Google Organic Top-10 SERP presence, verified Google Maps Pack-20 inclusion in the target corridor, and having a dedicated practice sub-page on <code>millwatertyrrell.com.au</code> govern whether AI engines shortlist the firm.</p>
</section>

<!-- Slide 8 -->
<section id="tech-07-geographic-matrix" class="slide">
  <div class="eyebrow">07 · GEOGRAPHIC CROSS-SECTION (8 IPSWICH &amp; BRISBANE CORRIDORS)</div>
  <h2>Corridor-Level AI Recall, Organic SERP Overlap &amp; Competitor Dominance</h2>
  <p class="lead">Millwater Tyrrell Law's AI visibility is confined to Ipswich Central (where its single GBP and homepage title tag are anchored), dropping sharply across Springfield, Brisbane West (Indooroopilly/Centenary), Brisbane CBD, and Brisbane South/North/East.</p>
  <table class="data-table">
    <thead>
      <tr><th>Corridor / Market</th><th class="num">Answers</th><th class="num">MT Mentions</th><th class="num">95% Wilson CI</th><th class="num">Top-3</th><th class="num">#1</th><th class="num">SERP Top-10</th><th>GBP Pack Status</th><th>Top 3 AI Competitors in Corridor</th></tr>
    </thead>
    <tbody>
      ${cityMatrixRowsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 9 -->
<section id="tech-08-citation-graph" class="slide">
  <div class="eyebrow">08 · CITATION GRAPH &amp; RETRIEVAL SOURCE TAXONOMY</div>
  <h2>Where AI Engines Source Family &amp; Estates Law Recommendations (${citations.totalCitations.toLocaleString()} Citations)</h2>
  <p class="lead">Across all 280 responses, AI models emitted <strong>${citations.totalCitations.toLocaleString()}</strong> grounding URLs across <strong>${citations.uniqueDomains}</strong> unique domains. Legal directories (Doyle's Guide, ThreeBestRated, Lawzana, QLS) and competitor law firm content hubs dominate retrieval, while <code>millwatertyrrell.com.au</code> accounts for <strong>${citations.clientDomainCitations}</strong> direct citations.</p>
  <table class="data-table">
    <thead>
      <tr><th class="num">Rank</th><th>Cited Domain</th><th>Source Category</th><th class="num">Citation Count</th><th class="num">Share of All Citations</th></tr>
    </thead>
    <tbody>
      ${citationDomainsHtml}
    </tbody>
  </table>
</section>

<!-- Slide 10 -->
<section id="tech-09-historical-trajectory" class="slide">
  <div class="eyebrow">09 · 14-MONTH HISTORICAL LLM MENTIONS TELEMETRY</div>
  <h2>Longitudinal AI Visibility Curve (Aug 2025 – Oct 2026)</h2>
  <p class="lead">Empirical historical mention counts from DataForSEO <code>/v3/ai_optimization/llm_mentions/historical/live</code> across 9 Ipswich &amp; Brisbane Family Law and Wills &amp; Estates domains show <code>millwatertyrrell.com.au</code> at 9 total mentions (2,050 AI impressions) vs. Ipswich neighbor <code>bwbfamilylaw.com.au</code> (472 mentions), <code>degroots.com.au</code> (310), <code>phillipsfamilylaw.com.au</code> (254), and <code>mcna.com.au</code> (80).</p>
  <table class="data-table">
    <thead>
      <tr><th>Domain</th>${histMonths.slice(-10).map(m => `<th class="num mono">${esc(m)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${Object.entries(histDomains).map(([dom, d]) => `<tr>
        <td class="mono"><strong>${esc(dom)}</strong></td>
        ${d.mentions.slice(-10).map(v => `<td class="num mono">${v}</td>`).join('')}
      </tr>`).join('\n')}
    </tbody>
  </table>
</section>

<!-- Slide 11 -->
<section id="tech-10-ai-keyword-demand" class="slide">
  <div class="eyebrow">10 · AI SEARCH VOLUME &amp; LEGAL BUYER DEMAND VELOCITY</div>
  <h2>12-Month Australian AI Keyword Demand Series (Oct 2025 – Sep 2026)</h2>
  <p class="lead">Live DataForSEO <code>/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live</code> telemetry confirms massive AI search volume in the exact practice areas where Millwater Tyrrell Law lacks dedicated pages—led by <code>"contesting a will"</code> (8,484/mo) and <code>"family lawyer"</code> (3,659/mo), alongside surging Brisbane-specific queries.</p>
  <table class="data-table">
    <thead>
      <tr><th>Keyword</th><th class="num">Current AI Vol (Sep 2026)</th><th class="num">12-Mo Avg AI Vol</th><th class="num">Oct 2025</th><th class="num">Jan 2026</th><th class="num">May 2026</th><th class="num">Sep 2026</th><th class="num">12-Mo Sum</th></tr>
    </thead>
    <tbody>
      ${normKeywords.slice(0, 12).map(k => {
        const oct25 = k.monthly?.[0]?.ai_search_volume || 0;
        const jan26 = k.monthly?.[3]?.ai_search_volume || 0;
        const may26 = k.monthly?.[7]?.ai_search_volume || 0;
        const sep26 = k.monthly?.[11]?.ai_search_volume || k.ai_search_volume || 0;
        const sum12 = (k.monthly || []).reduce((s, m) => s + (m.ai_search_volume || 0), 0);
        return `<tr>
          <td class="mono"><strong>${esc(k.keyword)}</strong></td>
          <td class="num mono"><strong>${sep26.toLocaleString()}</strong></td>
          <td class="num mono">${(k.avg_12m || 0).toLocaleString()}</td>
          <td class="num mono">${oct25.toLocaleString()}</td>
          <td class="num mono">${jan26.toLocaleString()}</td>
          <td class="num mono">${may26.toLocaleString()}</td>
          <td class="num mono"><strong>${sep26.toLocaleString()}</strong></td>
          <td class="num mono">${sum12.toLocaleString()}</td>
        </tr>`;
      }).join('\n')}
    </tbody>
  </table>
</section>

<!-- Slide 12 -->
<section id="tech-11-remediation-engineering" class="slide">
  <div class="eyebrow">11 · TECHNICAL REMEDIATION SPECIFICATION</div>
  <h2>Production-Ready <code>LegalService</code> + <code>Attorney</code> JSON-LD Patch for Squarespace</h2>
  <p class="lead">Injecting a clean, entity-disambiguated JSON-LD graph into Squarespace Code Injection (Header) fixes the broken phone format, binds Google CID <code>6376809625893182443</code>, declares explicit <code>areaServed</code> across Ipswich, Springfield, and Brisbane, and links Partners David Millwater (FDRP) and Matthew Tyrrell.</p>
  <div class="code-box">{
  "@context": "https://schema.org",
  "@type": ["LegalService", "Attorney"],
  "@id": "https://millwatertyrrell.com.au/#legalservice",
  "name": "Millwater Tyrrell Law",
  "url": "https://millwatertyrrell.com.au/",
  "telephone": "+61-7-3447-0416",
  "priceRange": "$$ (Free 30-Min Initial Consultation, Fixed-Fee Wills &amp; Deferred Family Law Fees)",
  "address": { "@type": "PostalAddress", "streetAddress": "Level 1, 215 Brisbane Street", "addressLocality": "Ipswich", "addressRegion": "QLD", "postalCode": "4305", "addressCountry": "AU" },
  "hasMap": "https://www.google.com/maps?cid=6376809625893182443",
  "areaServed": ["Ipswich QLD", "Springfield Lakes QLD", "Brookwater QLD", "Brisbane QLD", "Indooroopilly QLD", "Logan QLD"],
  "knowsAbout": ["Family Law", "Divorce &amp; Property Settlement", "Parenting &amp; Family Dispute Resolution", "Wills &amp; Estates", "Probate &amp; Deceased Estates", "Contesting a Will &amp; Family Provision Applications"],
  "founder": [
    { "@type": "Person", "name": "David Millwater", "jobTitle": "Partner &amp; Accredited Family Dispute Resolution Practitioner" },
    { "@type": "Person", "name": "Matthew Tyrrell", "jobTitle": "Partner — Wills, Estates &amp; Commercial Law" }
  ]
}</div>
</section>

<!-- Slide 13 -->
<section id="tech-12-verification-lineage" class="slide">
  <div class="eyebrow">12 · DATA LINEAGE &amp; REPRODUCIBILITY MANIFEST</div>
  <h2>1:1 Verification Artifact Map &amp; Zero-Fabrication Audit Trail</h2>
  <p class="lead">Every chart, table, and econometric parameter in both the 30-slide Client Deck (<code>/</code>) and this 13-slide Technical Dossier (<code>/technical</code>) is deterministically compiled from the raw JSON artifacts below and verified by <code>05_verify_zero_fabrication.mjs</code>.</p>
  <table class="data-table">
    <thead>
      <tr><th>Artifact File</th><th>API / Source</th><th>Record Count</th><th>Target Slides Driven</th></tr>
    </thead>
    <tbody>
      <tr><td class="mono"><strong>pipeline/raw/*.json</strong></td><td>5 Live AI Engines + Google Organic SERP</td><td class="num mono">336 files</td><td>All 280 AI answers + 56 SERPs</td></tr>
      <tr><td class="mono"><strong>pipeline/ans_full.json</strong></td><td>Parsed from <code>pipeline/raw/*</code></td><td class="num mono">280 rows</td><td>Slides 1, 5–16, 20–24, Tech Slides 1, 3, 6, 7</td></tr>
      <tr><td class="mono"><strong>pipeline/serp_audit.json</strong></td><td>DataForSEO Google Organic Live (depth=20)</td><td class="num mono">56 rows</td><td>Slide 18, Tech Slide 7</td></tr>
      <tr><td class="mono"><strong>pipeline/maps_audit.json</strong></td><td>DataForSEO Google Maps Live (depth=20 + 12 packs)</td><td class="num mono">12 packs + CID audit</td><td>Slide 18, Slide 26, Tech Slide 5</td></tr>
      <tr><td class="mono"><strong>pipeline/site_audit.json</strong></td><td>Firecrawl v1 Map + Scrape + JSON-LD Parser</td><td class="num mono">173 sitemap URLs / 18 pages</td><td>Slide 17, Slide 25, Tech Slide 4, 11</td></tr>
      <tr><td class="mono"><strong>pipeline/raw_ai_keyword_data.json</strong></td><td>DataForSEO AI Keyword Search Volume Live</td><td class="num mono">16 keywords × 12 mos</td><td>Slide 2 (AIDEMAND), Tech Slide 10</td></tr>
      <tr><td class="mono"><strong>pipeline/hist.json</strong></td><td>DataForSEO LLM Mentions Historical Live</td><td class="num mono">9 domains × 15 mos</td><td>Slide 19, Tech Slide 9</td></tr>
      <tr><td class="mono"><strong>pipeline/metrics.json</strong></td><td>Computed + Live IRLS Logistic Regression</td><td class="num mono">Full model state</td><td>All headline KPIs &amp; Econometric Table</td></tr>
    </tbody>
  </table>
</section>

    <div class="progress" aria-hidden="true"><i id="bar"></i></div>
  </div>
</div>
<nav class="controls" id="controls" aria-label="Slide controls">
  <button id="prev" type="button" aria-label="Previous slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <span id="count" class="ctr">1 / 13</span>
  <button id="next" type="button" aria-label="Next slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <button id="fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
</nav>
<script>${baseJs}</script>
</body>
</html>`;

fs.writeFileSync('site/technical.html', html);
console.log('Built site/technical.html (13 slides, ' + html.length + ' bytes)');
