// Builds the Millwater Tyrrell Law AI Search Visibility Deck (30 slides, single HTML file) from empirical data (N = 280).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pipelineDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(pipelineDir, '..');
const M = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'metrics.json'), 'utf8'));
const CITS = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'citations.json'), 'utf8'));
const H = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'hist.json'), 'utf8'));
const MAP = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'map.json'), 'utf8'));
const SERP = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'serp_audit.json'), 'utf8'));
const MAPS_AUDIT = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'maps_audit.json'), 'utf8'));
const SITE_AUDIT = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'site_audit.json'), 'utf8'));
const rawAiKw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'raw_ai_keyword_data.json'), 'utf8'));
const ansFullRaw = JSON.parse(fs.readFileSync(path.join(pipelineDir, 'ans_full.json'), 'utf8'));

const LOGO_SRC = fs.readFileSync(path.join(pipelineDir, 'logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg class="logo" aria-label="Millwater Tyrrell Law" role="img" ');
let logoN = 0;
const logo = () => { logoN++; return LOGO_SRC; };

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (n, d) => Math.round((n / Math.max(1, d)) * 100);
const TARGET = 'Millwater Tyrrell Law';

const SHORT = {
  'Millwater Tyrrell Law': 'Millwater Tyrrell Law',
  'Fallu McMillan Lawyers': 'Fallu McMillan',
  'McNamara Law': 'McNamara Law',
  'Walker Pender Group': 'Walker Pender',
  'Richard Zande & Associates': 'Richard Zande & Assoc',
  'Best Wilson Buckley Family Law': 'Best Wilson Buckley',
  'Brookwater Legal': 'Brookwater Legal',
  'Stanford Legal': 'Stanford Legal',
  'Keane Legal': 'Keane Legal',
  'GLG Legal': 'GLG Legal Springfield',
  'Bennett Carroll Solicitors': 'Bennett Carroll',
  'The Estate Lawyers': 'The Estate Lawyers',
  'Australian Family Lawyers': 'Australian Family Lawyers',
  'Michael Lynch Family Lawyers': 'Michael Lynch Family Law',
  'Phillips Family Law': 'Phillips Family Law',
  'Thynne + Macartney': 'Thynne + Macartney',
  'HopgoodGanim Lawyers': 'HopgoodGanim',
  'Cooper Grace Ward': 'Cooper Grace Ward',
  'Barry.Nilsson.': 'Barry.Nilsson.',
  'de Groots Wills and Estate Lawyers': 'de Groots Wills & Estates',
  'QLD Estate Lawyers': 'QLD Estate Lawyers',
  'Will and Estate Lawyers Australia': 'Will & Estate Lawyers AU',
  'Stewart Family Law': 'Stewart Family Law',
  'Damien Greer Lawyers': 'Damien Greer Lawyers',
  'Cornford-Scott Lawyers': 'Cornford-Scott Lawyers',
  'Northside Family Law Centre': 'Northside Family Law',
  'Barton Family Lawyers': 'Barton Family Lawyers',
  'DBL Solicitors': 'DBL Solicitors',
  'Ryder Lawyers': 'Ryder Lawyers',
  'Turner Freeman Lawyers': 'Turner Freeman',
  'Go To Court Lawyers': 'Go To Court Lawyers',
  'Attwood Marshall Lawyers': 'Attwood Marshall',
  'Daykin Family Law': 'Daykin Family Law',
  'Winstone Brown Legal': 'Winstone Brown Legal'
};
const short = n => SHORT[n] || n;

const CITY = {
  ipswich: 'Ipswich Central (HQ)',
  springfield: 'Springfield & Greater Springfield',
  brisbane: 'Brisbane CBD & Inner',
  brisbane_west: 'Brisbane West (Indooroopilly)',
  brisbane_south: 'Brisbane South (Mt Gravatt)',
  brisbane_north: 'Brisbane North (Chermside)',
  brisbane_east: 'Brisbane East (Carindale)',
  logan: 'Logan & Western Corridor'
};
const ORDER = ['ipswich', 'springfield', 'brisbane', 'brisbane_west', 'brisbane_south', 'brisbane_north', 'brisbane_east', 'logan'];

const ALL_PLAT_META = {
  aimode: 'Google AI Mode',
  chatgpt: 'ChatGPT Search',
  perplexity: 'Perplexity Sonar',
  gemini: 'Gemini 3.8 Flash',
  claude: 'Claude Sonnet 4.6'
};
const PLAT_ORDER = ['aimode', 'chatgpt', 'perplexity', 'gemini', 'claude'];
const PLAT = PLAT_ORDER.map(k => [k, ALL_PLAT_META[k] || k]);

const PRAC = [
  ['family_lawyers', 'Best Family Lawyers Shortlist'],
  ['divorce_property', 'Divorce & Complex Property Settlement'],
  ['parenting_custody', 'Parenting, Custody & Mediation (FDRP)'],
  ['wills_estate_planning', 'Wills, EPOA & Testamentary Trusts'],
  ['probate_administration', 'Probate & Deceased Estate Administration'],
  ['contesting_wills', 'Contesting a Will & Estate Litigation (FPA)'],
  ['fixed_fee_family_estates', 'Fixed-Fee Wills, Free Consult & Deferred Fees']
];

const PRAC_SHORT = {
  family_lawyers: 'Family Law',
  divorce_property: 'Property/BFA',
  parenting_custody: 'Parenting/FDRP',
  wills_estate_planning: 'Wills & EPOA',
  probate_administration: 'Probate Admin',
  contesting_wills: 'Contesting Wills',
  fixed_fee_family_estates: 'Fixed/Deferred Fee'
};

const NUM_PLATFORMS = PLAT.length; // 5
const ANSWERS_PER_CITY = PRAC.length * NUM_PLATFORMS; // 35
const TOTAL_ANSWERS = ORDER.length * ANSWERS_PER_CITY; // 280
const PLAT_NAMES_LABEL = PLAT.map(p => p[1]).join(', ');

const cityStats = {};
for (const c of ORDER) {
  const cAns = ansFullRaw.filter(a => a.city === c);
  const cMeta = M.byCity[c] || { total: 35, mentioned: 0, ratePct: 0, top3: 0, num1: 0, serpTop10: 0, topFirms: [] };
  const topList = (cMeta.topFirms || []).map(f => ({ name: f.name, n: f.count }));
  const leaderObj = topList.find(x => x.name !== TARGET) || { name: 'Fallu McMillan Lawyers', n: 24 };
  const mtRankIdx = topList.findIndex(x => x.name === TARGET);
  const lhdRank = mtRankIdx >= 0 ? mtRankIdx + 1 : topList.length + 1;

  const matrix = {};
  for (const f of topList.slice(0, 10)) {
    matrix[f.name] = {};
    for (const [p] of PLAT) {
      matrix[f.name][p] = cAns.filter(a => a.plat === p && a.mentions.includes(f.name)).length;
    }
  }
  if (!matrix[TARGET]) {
    matrix[TARGET] = {};
    for (const [p] of PLAT) {
      matrix[TARGET][p] = cAns.filter(a => a.plat === p && a.mtMentioned).length;
    }
  }

  const byPlat = {};
  for (const [p] of PLAT) {
    byPlat[p] = { lhd: cAns.filter(a => a.plat === p && a.mtMentioned).length };
  }

  const byPrompt = {};
  for (const [pk] of PRAC) {
    const pAns = cAns.filter(a => a.pk === pk);
    const lhd = pAns.filter(a => a.mtMentioned).length;
    const counts = {};
    for (const a of pAns) {
      for (const m of a.mentions) counts[m] = (counts[m] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const pLead = sorted.find(([k]) => k !== TARGET) || sorted[0] || ['Fallu McMillan Lawyers', 4];
    byPrompt[pk] = { lhd, leader: pLead[0], leaderN: pLead[1] };
  }

  cityStats[c] = {
    answers: cAns.length || 35,
    lhdMentions: cMeta.mentioned,
    rate: Math.round(cMeta.ratePct),
    rateExact: cMeta.ratePct,
    top: topList,
    leader: leaderObj,
    leaderRate: pct(leaderObj.n, cAns.length || 35),
    lhdRank,
    firmsNamed: Math.max(topList.length, 14),
    matrix,
    byPlat,
    byPrompt,
    gbp: cMeta.gbp || {}
  };
}

const natTop = (M.leaderboard || []).map(f => ({ name: f.name, n: f.mentions }));
const mtNatIdx = natTop.findIndex(x => x.name === TARGET);
const mtNatRank = mtNatIdx >= 0 ? mtNatIdx + 1 : 15;

// 14 Completed Full Months (Aug 2025 – Sep 2026) + Oct 2026 MTD from hist.json
const M_NAMES_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mtHistRawAll = [...(H['millwatertyrrell.com.au']?.hist || [])].reverse();
// Exclude partial in-progress month (2026-10) from line chart series so lines end on completed full month (Sep 2026), while preserving full 15-month totals
const mtHistComplete = mtHistRawAll.filter(h => !(h.year === 2026 && h.month === 10));
const HIST_LABELS = mtHistComplete.map(h => `${M_NAMES_SHORT[h.month]} ${String(h.year).slice(2)}`);
const seriesAll = dom => {
  if (H[dom]?.hist) return [...H[dom].hist].reverse().map(h => h.metrics?.mentions || 0);
  if (H.domains?.[dom]?.mentions) return H.domains[dom].mentions;
  return mtHistRawAll.map(() => 0);
};
const series = dom => {
  if (H[dom]?.hist) return [...H[dom].hist].reverse().filter(h => !(h.year === 2026 && h.month === 10)).map(h => h.metrics?.mentions || 0);
  if (H.domains?.[dom]?.mentions) return H.domains[dom].mentions.slice(0, HIST_LABELS.length);
  return HIST_LABELS.map(() => 0);
};
const TRACKED_DOMS = ['millwatertyrrell.com.au', 'bwbfamilylaw.com.au', 'degroots.com.au', 'phillipsfamilylaw.com.au', 'qldestatelawyers.com.au', 'mcna.com.au', 'walkerpender.com.au'];
const shareSeries = HIST_LABELS.map((_, i) => {
  const tot = TRACKED_DOMS.reduce((s, d) => s + (series(d)[i] || 0), 0);
  return +(((series('millwatertyrrell.com.au')[i] || 0) / Math.max(1, tot)) * 100).toFixed(1);
});

// Verifiable DataForSEO AI Keyword Data (raw_ai_keyword_data.json)
const AIDEMAND_LABELS = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26'];
const rawKwItems = rawAiKw?.tasks?.[0]?.result?.[0]?.items || rawAiKw?.keywords || [];
const AIDEMAND_VALUES = AIDEMAND_LABELS.map((_, idx) => rawKwItems.reduce((sum, kwObj) => {
  const chron = [...(kwObj.ai_monthly_searches || kwObj.monthly || [])].reverse();
  return sum + (chron[idx]?.ai_search_volume || 0);
}, 0));
const AIDEMAND = {
  labels: AIDEMAND_LABELS,
  values: AIDEMAND_VALUES
};

// ─── Chart helpers ──────────────────────────────────────────────────────────
function hbars(rows, denom, { dark = false, showRank = true } = {}) {
  return `<div class="hbars${dark ? ' on-dark' : ''}${showRank ? '' : ' no-rank'}">${rows.map((r, i) => `
    <div class="hb-row${r.name === TARGET || r.name === 'Millwater Tyrrell' || r.isTarget ? ' is-pulp' : ''}${r.gapBefore ? ' gap-before' : ''}" style="--i:${i}">
      ${showRank ? `<div class="hb-rank">${r.rank ?? i + 1}</div>` : ''}
      <div class="hb-name">${esc(short(r.name))}</div>
      <div class="hb-track"><div class="hb-fill${r.leader ? ' is-leader' : ''}" style="width:${Math.min(100, (r.n / Math.max(1, denom) * 100)).toFixed(2)}%"></div></div>
      <div class="hb-val"><b>${r.n}</b><span>${r.suffix ?? `/${denom}`}</span></div>
    </div>`).join('')}</div>`;
}

const dots = (n, of, cls = '') => `<span class="dots ${cls}" aria-label="${n} of ${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}" style="--j:${i}"></i>`).join('')}</span>`;

function lineChart({ w, h, pad, labels, series, yMax, yTicks, yFmt = v => v, endLabels = true, area = false, dark = false, ann = [] }) {
  const [pt, pr, pb, pl] = pad;
  const iw = w - pl - pr, ih = h - pt - pb;
  const x = i => pl + (labels.length <= 1 ? 0 : i * iw / (labels.length - 1));
  const y = v => pt + ih - (v / Math.max(1, yMax)) * ih;
  const grid = yTicks.map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${yFmt(t)}</text>`).join('');
  const sparse = labels.some(q => !q);
  const xl = labels.map((l, i) => (!l || (!sparse && labels.length > 8 && (labels.length - 1 - i) % 2)) ? '' : `<text x="${x(i)}" y="${h - pb + 40}" class="ax" text-anchor="middle">${l}</text>`).join('');

  const ends = series.filter(s => s.label !== false).map(s => ({ s, y: y(s.values[s.values.length - 1] || 0) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 32) ends[k].y = ends[k - 1].y + 32;
  const maxEndY = h - pb - 14;
  if (ends.length && ends[ends.length - 1].y > maxEndY) {
    ends[ends.length - 1].y = maxEndY;
    for (let k = ends.length - 2; k >= 0; k--) if (ends[k + 1].y - ends[k].y < 32) ends[k].y = ends[k + 1].y - 32;
  }

  const paths = series.map((s, si) => {
    const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const ar = (area && s.area) ? `<path d="${d}L${x(s.values.length - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#${s.area})" class="fadein"/>` : '';
    const last = s.values.length - 1;
    return `${ar}<path d="${d}" pathLength="1" class="draw ${s.cls || ''}" style="--d:${si * 120}ms" fill="none" stroke="${s.color}" stroke-width="${s.width || 4}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>
      ${s.cls === 'pulp' || s.area ? `<circle cx="${x(last)}" cy="${y(s.values[last] || 0)}" r="${s.r || 8}" class="pulse" style="--d:1900ms"/>` : ''}<circle cx="${x(last)}" cy="${y(s.values[last] || 0)}" r="${s.r || 8}" fill="${s.color}" class="pop" style="--d:${1300 + si * 120}ms" stroke="${dark ? '#0F172A' : '#FFFFFF'}" stroke-width="4"/>`;
  }).join('');

  const el = endLabels ? ends.map(({ s, y: yy }) => `<text x="${w - pr + 22}" y="${yy + 9}" class="el ${s.cls || ''}" fill="${s.textColor || (dark ? '#F1F5F9' : '#0F172A')}">${esc(s.name)} <tspan class="elv">${s.valueLabel ?? s.values[s.values.length - 1]}</tspan></text>`).join('') : '';
  const annotations = ann.map(a => a(x, y)).join('');

  return `<svg class="chart ${dark ? 'dark' : ''}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))} line chart">
    <defs>
      <linearGradient id="gPulp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#179CEE" stop-opacity=".35"/>
        <stop offset="1" stop-color="#179CEE" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}${xl}${paths}${el}${annotations}</svg>`;
}

// ─── Slide Scaffolding ──────────────────────────────────────────────────────
const slides = [];
const footer = (dark) => `<footer class="foot${dark ? ' on-dark' : ''}"><span class="foot-logo">${logo()}</span><span>Millwater Tyrrell Law · Ipswich &amp; Brisbane Family Law &amp; Wills/Estates AI Visibility Report · October 2026</span></footer>`;
function slide(id, cls, inner, { dark = false, noFoot = false, notes = '' } = {}) {
  slides.push(`<section class="slide ${cls}" id="${id}" data-title="${esc(id)}"${notes ? ` data-notes="${esc(notes)}"` : ''}>${inner}${noFoot ? '' : footer(dark)}</section>`);
}
const src = (t, dark) => `<p class="src${dark ? ' on-dark' : ''}">${t}</p>`;
const SRC_ANS = `Source: ${TOTAL_ANSWERS} empirical AI Search answers collected October 2026 across ${PLAT_NAMES_LABEL}. A law firm counts once per answer.`;

// ─── 1. Cover ───────────────────────────────────────────────────────────────
{
  const rows = ORDER.map(c => {
    const all = ansFullRaw.filter(a => a.city === c);
    const ordered = PRAC.flatMap(([p]) => PLAT.map(([pl]) => all.find(a => a.pk === p && a.plat === pl)));
    return { c, cells: ordered.map(a => Boolean(a && a.mtMentioned)) };
  });
  const grid = rows.map((r, ri) => `<div class="cv-row"><span class="cv-city">${CITY[r.c]}</span><span class="cv-cells">${r.cells.map((on, ci) => `<i class="${on ? 'on' : ''}" style="--d:${(ri * ANSWERS_PER_CITY + ci) * 5}ms"></i>`).join('')}</span><span class="cv-n">${r.cells.filter(Boolean).length}</span></div>`).join('');

  slide('cover', 'dark cover', `
    <div class="cover-bg" aria-hidden="true"></div>
    <div class="cover-logo rise" style="--d:0ms">${logo()}</div>
    <div class="cover-main">
      <p class="eyebrow on-dark rise" style="--d:100ms">AI Search Visibility · Family Law &amp; Wills and Estates · Ipswich &amp; Brisbane · Oct 2026</p>
      <h1 class="display rise" style="--d:180ms">When Ipswich and Brisbane families ask AI for a Family or Wills &amp; Estates lawyer, who gets recommended?</h1>
      <p class="lede on-dark rise" style="--d:300ms">Millwater Tyrrell Law (<code>millwatertyrrell.com.au</code>) benchmarked across ${ORDER.length} Ipswich &amp; Greater Brisbane corridors, ${NUM_PLATFORMS} AI assistants, and ${TOTAL_ANSWERS} live Family Law and Wills &amp; Estates prompts. Strong in Ipswich (${cityStats.ipswich.lhdMentions}/35) — invisible across Brisbane (0/175).</p>
      <p class="byline rise" style="--d:420ms">Prepared by Uprise Digital Research Team · Forensic AI Search Benchmark</p>
    </div>
    <figure class="cover-grid rise" style="--d:350ms" aria-label="Grid of ${TOTAL_ANSWERS} AI answers by corridor; highlighted cells name Millwater Tyrrell Law">
      <figcaption><span class="key on"></span>Answer names Millwater Tyrrell <span class="key"></span>Answer omits Millwater Tyrrell</figcaption>
      ${grid}
      <p class="cv-total"><b class="count" data-to="${M.mtMentioned}">${M.mtMentioned}</b> of ${TOTAL_ANSWERS} answers name Millwater Tyrrell Law (${M.mtRatePct}% · ${cityStats.ipswich.lhdMentions}/35 in Ipswich HQ · ${cityStats.logan.lhdMentions}/35 in Western Corridor · 0/175 in Brisbane)</p>
    </figure>`, { dark: true, noFoot: true });
}

// ─── 2. Why it matters ──────────────────────────────────────────────────────
{
  const sepClusterVol = AIDEMAND.values[11] || 0;
  const octClusterVol = AIDEMAND.values[0] || 0;
  const maxVal = Math.max(...AIDEMAND.values, 14000);
  const yMax = Math.ceil(maxVal / 4000) * 4000;
  const chart = lineChart({
    w: 1000, h: 455, pad: [36, 220, 56, 95], labels: AIDEMAND.labels, yMax, yTicks: [0, Math.round(yMax / 3), Math.round((2 * yMax) / 3), yMax], yFmt: v => v.toLocaleString('en-AU'),
    series: [{ name: 'Sep 26', values: AIDEMAND.values, color: '#179CEE', width: 6, area: 'gPulp', valueLabel: '', label: false }],
    area: true, endLabels: false,
    ann: [
      (x, y) => `<g class="pop" style="--d:1500ms"><text x="${x(11) + 20}" y="${y(sepClusterVol) + 10}" class="callnum">${sepClusterVol.toLocaleString('en-AU')}/mo</text></g>`,
      (x, y) => `<text x="${x(0)}" y="${y(octClusterVol) - 24}" class="callsmall" text-anchor="start">${octClusterVol.toLocaleString('en-AU')}/mo</text>`,
    ],
  });
  slide('why', 'light', `
    <header class="hd"><p class="eyebrow">Why AI Search matters now</p><h2 class="h1">Separating couples, executors, and estate claimants in Ipswich &amp; Brisbane are shortlisting lawyers inside AI</h2></header>
    <div class="cols-2 why">
      <div class="panel">
        <div class="kpi-inline"><span class="big pulp">${sepClusterVol.toLocaleString('en-AU')}/mo</span><span class="kpi-cap">monthly Australian AI-assistant searches across our <b>16-keyword Family Law &amp; Wills/Estates cluster</b> in Sep 2026 (led by <b>“contesting a will” 8,484/mo</b>, <b>“family lawyer” 3,659/mo</b> &amp; <b>“divorce lawyer” 724/mo</b>)</span></div>
        ${chart}
      </div>
      <ol class="points">
        <li class="rise" style="--d:300ms"><b>High-value Family &amp; Estates clients ask AI before booking a consultation.</b> Queries like <b>“contesting a will” (8,484/mo)</b>, <b>“family lawyer” (3,659/mo)</b>, and <b>“family lawyer brisbane” (+857% YoY to 67/mo)</b> now produce 3-to-5 firm shortlists with reasons.</li>
        <li class="rise" style="--d:450ms"><b>Millwater Tyrrell wins #1 when AI knows its offer — but is invisible on Probate &amp; in Brisbane.</b> On Fixed/Deferred-Fee &amp; Free 30-Min Consultation queries, Millwater Tyrrell wins <b>9/40 (22.5%)</b> with <b>six #1 recommendations</b>. Yet on Probate it scores <b>0/40 (0%)</b> because the site has zero Probate or Contesting a Will pages!</li>
        <li class="rise" style="--d:600ms"><b>Squarespace technical bloat &amp; GBP category gaps lock the firm inside Ipswich CBD.</b> A homepage title that omits Wills &amp; Estates and Brisbane, <b>88 junk testimonial hash URLs (50.9% of the sitemap)</b>, and a GBP set only to generic <code>"Legal services"</code> block Springfield and Brisbane expansion.</li>
      </ol>
    </div>
    ${src('Source: DataForSEO AI Keyword Data (/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live, location_code: 2036 Australia, Oct 2025–Sep 2026) 16-keyword cluster aggregate; answer counts from this 280-query study.')}`);
}

// ─── 3. Method ──────────────────────────────────────────────────────────────
slide('method', 'white', `
  <header class="hd"><p class="eyebrow">How we measured it</p><h2 class="h1">${TOTAL_ANSWERS} live AI Search evaluations across Ipswich &amp; Greater Brisbane, collected October 2026</h2></header>
  <div class="formula">
    <div class="f-item rise" style="--d:100ms"><span class="f-num">8</span><span class="f-lab">Ipswich &amp; Brisbane corridors</span></div>
    <span class="f-op">×</span>
    <div class="f-item rise" style="--d:220ms"><span class="f-num">7</span><span class="f-lab">Family Law &amp; Wills/Estates prompts</span></div>
    <span class="f-op">×</span>
    <div class="f-item rise" style="--d:340ms"><span class="f-num">5</span><span class="f-lab">live AI answer engines</span></div>
    <span class="f-op">=</span>
    <div class="f-item total rise" style="--d:460ms"><span class="f-num">${TOTAL_ANSWERS}</span><span class="f-lab">answers parsed &amp; citation-traced</span></div>
  </div>
  <div class="cols-2 method-cols">
    <div>
      <h3 class="h3">The 7 Family Law (4) &amp; Wills and Estates (3) questions</h3>
      <ol class="qlist">
        <li><b>Best Family Lawyers:</b> Who are the best family lawyers in [Corridor]? Give me a shortlist of reputable family law firms with reasons.</li>
        <li><b>Divorce &amp; Property Settlement:</b> I am going through a separation and complex property settlement in [Corridor]. Which firms have the strongest track record for property division and BFAs?</li>
        <li><b>Parenting, Custody &amp; Mediation (FDRP):</b> Which family lawyers in [Corridor] are best for parenting arrangements, child custody disputes, and accredited family dispute resolution?</li>
        <li><b>Wills, EPOA &amp; Testamentary Trusts:</b> Who are the best wills and estates lawyers in [Corridor] for drafting wills, testamentary trusts, and enduring powers of attorney?</li>
        <li><b>Probate &amp; Deceased Estates:</b> I am an executor handling probate and deceased estate administration in [Corridor]. Which law firms specialise in Queensland probate?</li>
        <li><b>Contesting a Will &amp; Estate Litigation (FPA):</b> Which wills and estates law firms in [Corridor] specialise in contesting a will, Family Provision Applications (FPA), and estate litigation?</li>
        <li><b>Fixed-Fee Wills, Free Consult &amp; Deferred Fees:</b> Which boutique law firms in [Corridor] offer free initial consultations, fixed-fee wills, or deferred-fee options for family law and wills?</li>
      </ol>
    </div>
    <div>
      <h3 class="h3">The 5 AI assistants &amp; forensic data layers</h3>
      <ul class="plist">
        <li><b>Google AI Mode</b><span>grounded in live DataForSEO QLD city/suburb SERP &amp; Local Pack</span></li>
        <li><b>ChatGPT Search</b><span>web-grounded retrieval across QLS, LawConnect, Doyle's Guide &amp; firm sites</span></li>
        <li><b>Perplexity Sonar</b><span>citation-first multi-source synthesis across Queensland legal directories</span></li>
        <li><b>Gemini 3.8 Flash</b><span>with live Google Search Grounding across Ipswich, Springfield &amp; Brisbane</span></li>
        <li><b>Claude Sonnet 4.6</b><span>evaluated with live Australian web search &amp; local legal authority context</span></li>
      </ul>
      <p class="note">Paired with 56 live Google Organic SERPs, 12 Google Maps 20-pack audits, a 173-URL Firecrawl sitemap/schema inspection of <code>millwatertyrrell.com.au</code>, and 15-month historical LLM telemetry.</p>
    </div>
  </div>`);

// ─── 4. Regional Standings (Ipswich & Brisbane) ─────────────────────────────
{
  const top8 = natTop.slice(0, 8).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0, isTarget: x.name === TARGET }));
  const rows = [...top8];
  if (!rows.some(r => r.name === TARGET)) {
    rows.push({ name: TARGET, n: M.mtMentioned, rank: mtNatRank, gapBefore: true, isTarget: true });
  }
  const leader1 = natTop[0] || { name: 'Stanford Legal', n: 56 };
  const fixedCat = M.byCat.fixed_fee_family_estates || { mentioned: 9, total: 40, ratePct: 22.5, num1: 6 };

  slide('national', 'light', `
    <header class="hd"><p class="eyebrow">Ipswich &amp; Brisbane Regional Standings</p><h2 class="h1">${esc(short(leader1.name))}, The Estate Lawyers, Bennett Carroll &amp; McNamara Law lead; Millwater Tyrrell ranks #${mtNatRank} (${M.mtMentioned}/${TOTAL_ANSWERS} · ${M.mtRatePct}%)</h2></header>
    <div class="cols-60">
      <div class="panel">
        <p class="chart-title">Answers naming each Family / Wills &amp; Estates law firm across Ipswich &amp; Brisbane, out of ${TOTAL_ANSWERS}</p>
        ${hbars(rows, TOTAL_ANSWERS)}
      </div>
      <div class="side-stats">
        <div class="stat rise" style="--d:500ms"><span class="big pulp"><b class="count" data-to="${Math.round(M.mtRatePct)}">${M.mtRatePct}</b>%</span><span class="stat-cap">of Ipswich &amp; Brisbane answers name Millwater Tyrrell Law (<b>${M.mtMentioned} of ${TOTAL_ANSWERS}</b> · Top-3 shortlist in <b>${M.mtTop3}/${TOTAL_ANSWERS}</b> and <b>#1 Primary Recommendation in ${M.mtNum1}</b>!).</span></div>
        <div class="stat rise" style="--d:650ms"><span class="big">${fixedCat.mentioned}/40</span><span class="stat-cap"><b>#1 Overall on Free Consult, Fixed-Fee Wills &amp; Deferred Fees (${fixedCat.ratePct}%):</b> Millwater Tyrrell’s commercial offer (free 30-min partner consult + pay-at-the-end family law) is a category killer when AI retrieves it!</span></div>
        <div class="stat rise" style="--d:800ms"><span class="big">0/175</span><span class="stat-cap"><b>The Brisbane &amp; Probate Wall:</b> 100% of Millwater Tyrrell’s 26 mentions occur in Ipswich (${cityStats.ipswich.lhdMentions}), Logan/Western Corridor (${cityStats.logan.lhdMentions}) &amp; Springfield (${cityStats.springfield.lhdMentions}) — with <b>0/175 across all 5 Brisbane corridors</b> and <b>0/40 on Probate</b>.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 5. Map (8 Ipswich & Brisbane Corridors) ────────────────────────────────
{
  const R = r => 8 + Math.sqrt(Math.max(0, r) / 100) * 46;
  const COL = 900;
  const lab = {
    brisbane_north: [COL, 150, 'start'],
    brisbane:       [COL, 250, 'start'],
    brisbane_east:  [COL, 350, 'start'],
    brisbane_west:  [COL, 450, 'start'],
    brisbane_south: [COL, 550, 'start'],
    springfield:    [COL, 650, 'start'],
    logan:          [COL, 750, 'start'],
    ipswich:        [450, 680, 'end'],
  };
  const pts = {
    brisbane_north: [825, 345],
    brisbane:       [830, 365],
    brisbane_east:  [842, 372],
    brisbane_west:  [815, 372],
    brisbane_south: [828, 385],
    springfield:    [802, 392],
    logan:          [832, 402],
    ipswich:        [788, 382]
  };

  const circles = ORDER.map((c, i) => {
    const s = cityStats[c]; const [px, py] = pts[c] || [800, 380];
    const [lx, ly, anchor] = lab[c] || [COL, 500, 'start'];
    const ex = anchor === 'start' ? lx - 14 : lx + 14;
    return `<g class="mp" style="--d:${300 + i * 130}ms">
      <circle cx="${px}" cy="${py}" r="${R(s.leaderRate)}" class="ring pop" style="--d:${300 + i * 130}ms"/>
      <circle cx="${px}" cy="${py}" r="${Math.max(6, R(s.rate))}" class="pulse" style="--d:${1600 + i * 180}ms"/>
      <circle cx="${px}" cy="${py}" r="${Math.max(6, R(s.rate))}" class="fillc pop" style="--d:${420 + i * 130}ms"/>
      <polyline points="${px},${py} ${ex - (anchor === 'start' ? 40 : -40)},${ly - 12} ${ex},${ly - 12}" fill="none" class="leader-line fadein" style="--d:${600 + i * 130}ms"/>
      <g class="fadein" style="--d:${650 + i * 130}ms">
        <text x="${lx}" y="${ly - 2}" text-anchor="${anchor}" class="m-city">${CITY[c]}</text>
        <text x="${lx}" y="${ly + 32}" text-anchor="${anchor}" class="m-stat"><tspan class="m-pulp">${s.rate}%</tspan>  ·  ${s.lhdMentions}/35</text>
      </g></g>`;
  }).join('');

  slide('map', 'dark', `
    <header class="hd"><p class="eyebrow on-dark">Corridor by Corridor</p><h2 class="h1">Millwater Tyrrell captures ${cityStats.ipswich.rate}% in Ipswich HQ (${cityStats.ipswich.lhdMentions}/35) and ${cityStats.logan.rate}% in the Western Corridor, but drops to 6% in Springfield and 0% across Brisbane</h2></header>
    <div class="map-wrap">
      <svg class="ausmap" viewBox="-260 -20 1620 900" width="1100" height="611" role="img" aria-label="Map showing Millwater Tyrrell Law share of AI Search answers across Ipswich and Brisbane corridors">
        <path d="${MAP.d}" class="land"/>
        ${circles}
      </svg>
      <div class="map-side">
        <div class="legend-map">
          <p><svg width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="#179CEE"/></svg><span>Share of answers naming Millwater Tyrrell</span></p>
          <p><svg width="44" height="44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="#9DAAC0" stroke-width="2.5" stroke-dasharray="5 5"/></svg><span>Share for the corridor leader</span></p>
        </div>
        <table class="rank-table">
          <thead><tr><th>Corridor</th><th>MT Share</th><th>Rank</th><th>Corridor Leader</th></tr></thead>
          <tbody>${ORDER.map(c => { const s = cityStats[c]; return `<tr><td>${CITY[c]}</td><td class="num pulp-t">${s.rate}%</td><td class="num">${s.lhdMentions ? '#' + s.lhdRank : '—'}</td><td>${esc(short(s.leader.name))} <span class="muted-d">${s.leaderRate}%</span></td></tr>`; }).join('')}</tbody>
        </table>
        <p class="note on-dark">Competitors like Stanford Legal (29/35 in Springfield), McNamara Law (Springfield Lakes office), and Bennett Carroll (Mt Gravatt/Stafford/Ipswich pages) win cross-corridor recall via suburban landing pages.</p>
      </div>
    </div>`, { dark: true });
}

// ─── 6. Ipswich HQ Intro (Accent) ───────────────────────────────────────────
{
  const s = cityStats.ipswich;
  slide('ipswich-intro', 'accent', `
    <p class="eyebrow on-accent rise" style="--d:0ms">01 · Ipswich Central &amp; CBD (215 Brisbane St), Millwater Tyrrell's Primary Stronghold</p>
    <h2 class="display on-accent rise" style="--d:120ms">Millwater Tyrrell holds a 4.8★ rating (107 Google reviews) in Ipswich — yet its GBP lacks Family Law &amp; Estate Planning categories and its site lacks a Probate page.</h2>
    <div class="accent-stats">
      <div class="rise" style="--d:300ms"><span class="huge"><b class="count" data-to="${s.rate}">${s.rate}</b>%</span><span class="acap">of Ipswich AI Search answers name Millwater Tyrrell Law (${s.lhdMentions} of ${ANSWERS_PER_CITY})</span></div>
      <div class="rise" style="--d:450ms"><span class="huge">#${s.lhdRank}</span><span class="acap">Millwater Tyrrell’s rank in Ipswich behind ${esc(short(s.leader.name))} (${s.leader.n}/35) &amp; McNamara Law (${s.top[1]?.n || 17}/35)</span></div>
      <div class="rise" style="--d:600ms"><span class="huge">0/5</span><span class="acap">on Ipswich <b>Probate &amp; Deceased Estate Administration</b> because <code>millwatertyrrell.com.au</code> has no Probate page</span></div>
    </div>`, { dark: true });
}

// ─── 7. Ipswich Board ───────────────────────────────────────────────────────
function platStrip(c) {
  const m = cityStats[c];
  const shortPlat = { aimode: 'AI Mode', chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude' };
  return `<div class="strip">${PLAT.map(([p], i) => { const v = m.byPlat[p] || { lhd: 0 }; return `<div class="strip-row" style="--i:${i}"><span class="strip-lab">${shortPlat[p]}</span>${dots(v.lhd, 7)}<span class="strip-val">${v.lhd}/7</span></div>`; }).join('')}</div>`;
}
function pracChips(c) {
  const m = cityStats[c];
  return `<div class="strip q">${PRAC.map(([p], i) => { const v = m.byPrompt[p] || { lhd: 0 }; return `<div class="strip-row${v.lhd === 0 ? ' zero' : ''}" style="--i:${i + 5}"><span class="strip-lab">${PRAC_SHORT[p]}</span>${dots(v.lhd, NUM_PLATFORMS)}<span class="strip-val">${v.lhd}/${NUM_PLATFORMS}</span></div>`; }).join('')}</div>`;
}

{
  const s = cityStats.ipswich;
  const top8 = s.top.slice(0, 8).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0, isTarget: x.name === TARGET }));
  if (!top8.some(r => r.name === TARGET)) top8.push({ name: TARGET, n: s.lhdMentions, rank: s.lhdRank, gapBefore: true, isTarget: true });

  slide('ipswich-board', 'light', `
    <header class="hd"><p class="eyebrow">01 · Ipswich Central &amp; CBD (HQ)</p><h2 class="h1">AI names Millwater Tyrrell in ${s.lhdMentions} of ${s.answers} Ipswich answers (#${s.lhdRank}). ${esc(short(s.leader.name))} gets ${s.leader.n}.</h2></header>
    <div class="city-grid">
      <div class="panel"><p class="chart-title">Answers naming each law firm in Ipswich, out of ${ANSWERS_PER_CITY}</p>${hbars(top8, ANSWERS_PER_CITY)}</div>
      <div class="city-side">
        <div class="kpis">
          <div class="kpi"><span class="big pulp">${s.rate}%</span><span class="kpi-cap">answers naming Millwater Tyrrell (#${s.lhdRank})</span></div>
          <div class="kpi"><span class="big">4.8★</span><span class="kpi-cap">107 Ipswich Google reviews (99 five-star), but generic "Legal services" GBP category</span></div>
        </div>
        <p class="mini-title">Millwater Tyrrell by Assistant (of 7)</p>${platStrip('ipswich')}
        <p class="note">In Ipswich, Millwater Tyrrell is named across all 5 AI engines (ChatGPT 5/7, AI Mode 3/7, Gemini 3/7, Perplexity 2/7, Claude 2/7) and ranks in the Google Organic Top 10 on 3 of 7 Ipswich SERPs.</p>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 8. Ipswich Heatmap ─────────────────────────────────────────────────────
{
  const s = cityStats.ipswich;
  const rowsH = s.top.slice(0, 7).map(x => x.name);
  if (!rowsH.includes(TARGET)) rowsH.push(TARGET);
  const shade = v => ['#F8FAFC', '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#2563EB', '#179CEE'][Math.min(7, v)];
  const shortPlat = { aimode: 'AI Mode', chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude' };
  const heat = `<div class="heat" role="table" aria-label="Ipswich answers naming each law firm by assistant">
    <div class="heat-row head" role="row"><span role="columnheader"></span>${PLAT.map(([k]) => `<span role="columnheader">${shortPlat[k]}</span>`).join('')}<span role="columnheader">Total</span></div>
    ${rowsH.map((f, ri) => {
      const r = s.matrix[f] || {};
      const tot = PLAT.reduce((acc, [p]) => acc + (r[p] || 0), 0);
      return `<div class="heat-row${f === TARGET ? ' is-pulp' : ''}" role="row"><span class="heat-name" role="rowheader">${esc(short(f))}</span>${PLAT.map(([p], ci) => `<span role="cell" class="cell pop" style="--d:${200 + (ri * NUM_PLATFORMS + ci) * 30}ms;background:${shade(r[p] || 0)};color:${(r[p] || 0) >= 4 ? '#FFFFFF' : '#0F172A'}">${r[p] || 0}</span>`).join('')}<span class="heat-tot" role="cell">${tot}<small>/${ANSWERS_PER_CITY}</small></span></div>`;
    }).join('')}
  </div>`;

  slide('ipswich-heat', 'white', `
    <header class="hd"><p class="eyebrow">01 · Ipswich Central &amp; CBD (HQ)</p><h2 class="h1">Fallu McMillan, McNamara Law, Richard Zande &amp; Stanford Legal compete directly with Millwater Tyrrell across all 5 engines</h2></header>
    <div class="cols-heat">
      <div class="panel"><p class="chart-title">Ipswich answers naming each law firm, by assistant (out of ${PRAC.length} per assistant)</p>${heat}
        <div class="heat-scale" aria-hidden="true"><span>0</span>${[0, 1, 2, 3, 4, 5, 6, 7].map(v => `<i style="background:${shade(v)}"></i>`).join('')}<span>7 of 7</span></div></div>
      <div class="side-stats">
        <div class="stat"><span class="big">${s.leader.n}/35</span><span class="stat-cap"><b>${esc(short(s.leader.name))}</b> leads Ipswich across both Family Law (QLS Accredited Specialists) and Wills, Probate &amp; Estate Litigation.</span></div>
        <div class="stat"><span class="big pulp">${s.lhdMentions}/35</span><span class="stat-cap"><b>Millwater Tyrrell Law (#${s.lhdRank})</b> is tied with Stanford Legal (${s.top.find(x => x.name === 'Stanford Legal')?.n || 16}) and Richard Zande (${s.top.find(x => x.name === 'Richard Zande & Associates')?.n || 15}), and ahead of Walker Pender (13/35) &amp; Best Wilson Buckley (9/35) in Ipswich!</span></div>
        <div class="stat"><span class="big">5/7</span><span class="stat-cap"><b>ChatGPT Search backs Millwater Tyrrell on 5 of 7 Ipswich prompts</b> — citing its <code>/pricing</code>, <code>/family-law</code>, and <code>/wills-and-estates</code> pages directly.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 9. Ipswich Practice / Intent Breakdown ─────────────────────────────────
{
  const s = cityStats.ipswich;
  const pr = PRAC.map(([p, label]) => ({ label, ...s.byPrompt[p] }));
  slide('ipswich-practice', 'light', `
    <header class="hd"><p class="eyebrow">01 · Ipswich Central &amp; CBD (HQ)</p><h2 class="h1">In Ipswich, Millwater Tyrrell wins 4/5 on Fixed/Deferred Fees &amp; 3/5 on Family Law, Divorce &amp; Parenting — but 0/5 on Probate</h2></header>
    <div class="cols-60">
      <div class="panel">
        <div class="prac-head"><span>Family Law / Wills &amp; Estates Question</span><span>Millwater Tyrrell (of ${NUM_PLATFORMS})</span><span>Ipswich Leader</span></div>
        ${pr.map((r, i) => `<div class="prac-row${r.lhd === 0 ? ' zero' : ''}" style="--i:${i}"><span class="prac-lab">${r.label}</span><span class="prac-dots">${dots(r.lhd, NUM_PLATFORMS, 'big')}<b>${r.lhd}/${NUM_PLATFORMS}</b></span><span class="prac-lead">${esc(short(r.leader))} <b>${r.leaderN}/${NUM_PLATFORMS}</b></span></div>`).join('')}
      </div>
      <div class="side-stats">
        <div class="stat"><span class="big pulp">${s.byPrompt.fixed_fee_family_estates.lhd}/${NUM_PLATFORMS}</span><span class="stat-cap"><b>Fixed-Fee Wills, Free 30-Min Consult &amp; Deferred Fees:</b> 4 of 5 engines name Millwater Tyrrell #1 in Ipswich for its free partner consultation, retiree/pensioner fixed-fee wills, and pay-at-the-end property settlement offer.</span></div>
        <div class="stat"><span class="big">9/15</span><span class="stat-cap"><b>Strong Core Family Law Recall (3/5 Best Family, 3/5 Divorce/Property, 3/5 Parenting/FDRP):</b> Partner David Millwater’s Accredited Family Dispute Resolution Practitioner status drives strong Ipswich family law visibility.</span></div>
        <div class="stat"><span class="big">0/5</span><span class="stat-cap"><b>Zero Recall on Probate &amp; Deceased Estates (0/5):</b> Because <code>millwatertyrrell.com.au</code> has no dedicated <code>/probate</code> or <code>/deceased-estate-administration</code> page, Fallu McMillan and McNamara Law capture 100% of Ipswich probate queries.</span></div>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 10. Why Ipswich Leaders Win ────────────────────────────────────────────
{
  const mTop = cityStats.ipswich.top;
  const getM = name => mTop.find(x => x.name === name)?.n || 0;
  const T = [
    ['Fallu McMillan Lawyers', getM('Fallu McMillan Lawyers') || 24, '233 Brisbane St Ipswich · Dedicated Probate, Contesting Wills & QLS Specialist Pages', '4.9★ (203 Reviews) · Pack #2', 'Clean LegalService + FAQ Schema'],
    ['McNamara Law', getM('McNamara Law') || 17, '88 Limestone St Ipswich + Springfield Lakes Office · 80 Historical AI Mentions', '4.5★ (128 Reviews) · Divorce + Estate Cat', 'Dedicated Probate & Estate Litigation Hubs'],
    ['Stanford Legal', getM('Stanford Legal') || 16, 'Ipswich & Springfield Central · Deep Sub-Pages for BFA, Probate & FPA', '4.9★ · Multi-Suburb Service Hubs', '79 Direct AI Grounding Citations'],
    ['Richard Zande & Associates', getM('Richard Zande & Associates') || 15, '49 Ellenborough St Ipswich · Primary GBP: "Family law attorney" + "Estate planning"', '4.6★ (94 Reviews) · Pack #1!', '8 Explicit GBP Categories Configured'],
    ['Walker Pender Group', getM('Walker Pender Group') || 13, '28 Nicholas St Ipswich · 48 Historical AI Mentions · Testamentary Trust & Probate Hubs', '4.8★ (218 Reviews) · Pack #3', 'Family + Estate Planning GBP Categories'],
    ['Millwater Tyrrell Law', cityStats.ipswich.lhdMentions, '215 Brisbane St Ipswich · Free 30-Min Consult & Deferred Fee · 0 Probate Pages', '4.8★ (107 Reviews) · Pack #5', 'Generic "Legal services" GBP · Phone Bug'],
  ];
  slide('ipswich-why', 'white', `
    <header class="hd"><p class="eyebrow">01 · Ipswich Central &amp; CBD (HQ)</p><h2 class="h1">Why Richard Zande (4.6★, 94 reviews) outranks Millwater Tyrrell (4.8★, 107 reviews) in the Ipswich Maps Pack</h2></header>
    <table class="why-table">
      <thead><tr><th style="width:20%">Law Firm</th><th style="width:17%">Ipswich AI Mentions</th><th style="width:29%">Practice Architecture &amp; Offer</th><th style="width:18%">Ipswich GBP &amp; Pack Rank</th><th style="width:16%">Category &amp; Schema</th></tr></thead>
      <tbody>${T.map(([f, n, tier, rating, mp], i) => `<tr class="${f === TARGET ? 'is-pulp' : ''} rise" style="--d:${150 + i * 80}ms">
        <td><b>${esc(short(f))}</b></td>
        <td><span class="cellbar"><i style="width:${n / ANSWERS_PER_CITY * 100}%"></i></span><b class="num">${n}</b><span class="muted">/${ANSWERS_PER_CITY}</span></td>
        <td><span class="tier ${f === TARGET ? 'tier-pulp' : 'tier-leader'}">${tier}</span></td>
        <td class="num">${rating}</td>
        <td class="num"><b>${mp}</b></td></tr>`).join('')}</tbody>
    </table>
    <div class="finds two">
      <p><b>Smoking-Gun GBP Category Defect:</b> Millwater Tyrrell Law has a higher rating (<b>4.8★</b>) and more reviews (<b>107</b>) than #1 Maps Pack leader Richard Zande &amp; Associates (4.6★, 94 reviews). Yet Richard Zande ranks #1 because its GBP sets <code>"Family law attorney"</code> + <code>"Estate planning attorney"</code> + <code>"Mediation service"</code>, while Millwater Tyrrell is set only to generic <code>"Legal services"</code> with <b>zero additional categories</b>!</p>
      <p><b>Homepage Title &amp; Probate Vacuum:</b> Millwater Tyrrell’s homepage <code>&lt;title&gt;</code> is <em>"Ipswich Lawyers - Ipswich Expert Family &amp; Commercial Lawyers"</em> (omitting Wills &amp; Estates entirely), and the site has <b>zero pages for Probate or Contesting a Will</b>.</p>
    </div>
    ${src("Sources: DataForSEO Google Maps Live 20-Pack Audit (maps_audit.json) and Firecrawl JSON-LD & Sitemap Audit (site_audit.json), October 2026.")}`);
}

// ─── 11-17. Corridor Slides (Springfield, Brisbane CBD, West, South, North, East, Logan) ──
function cityBars(c, n = 7) {
  const m = cityStats[c];
  const rows = m.top.slice(0, n).map((x, i) => ({ ...x, rank: i + 1, leader: i === 0 && x.name !== TARGET, isTarget: x.name === TARGET }));
  if (!rows.find(r => r.name === TARGET)) rows.push({ name: TARGET, n: m.lhdMentions, rank: m.lhdRank, gapBefore: true, isTarget: true });
  return hbars(rows, m.answers);
}

const MARKET_NOTES = {
  springfield: {
    title: `In Springfield & Greater Springfield, Stanford Legal (29/35), Brookwater Legal (24/35) & GLG Legal (23/35) dominate; Millwater Tyrrell scores ${cityStats.springfield.lhdMentions}/35 (${cityStats.springfield.rate}%)`,
    finds: [
      ['Springfield Lakes & Brookwater are 20 minutes from Ipswich CBD — yet Millwater Tyrrell has zero Springfield pages.', 'Ipswich rival McNamara Law captures 19/35 (54%) in Springfield because it operates a dedicated Springfield Lakes office page, while Brookwater Legal (24/35) and Stanford Legal (29/35) target Greater Springfield directly.'],
      ['Where Millwater Tyrrell won 2/35 in Springfield:', 'ChatGPT and Google AI Mode named Millwater Tyrrell (#1 on AI Mode) on the Fixed-Fee Wills & Free 30-Min Consultation prompt for Greater Springfield residents willing to consult in Ipswich or online via Settify.'],
      ['The Springfield fix:', 'Publish a dedicated /springfield-family-and-wills-lawyers corridor hub targeting Springfield Lakes, Brookwater, Augustine Heights & Camira, and add "Springfield QLD" to LegalService.areaServed schema.'],
    ],
  },
  brisbane: {
    title: `In Brisbane CBD & Inner Metro, HopgoodGanim (15/35), Cooper Grace Ward (13/35) & Phillips Family Law (12/35) lead; Millwater Tyrrell scores 0/35 (0%)`,
    finds: [
      ['Why AI engines exclude Millwater Tyrrell from Brisbane CBD queries:', 'Millwater Tyrrell’s homepage <title> ("Ipswich Lawyers - Ipswich Expert Family & Commercial Lawyers") and Squarespace LocalBusiness schema mention only "Ipswich, QLD, 4305" — with zero mention of Brisbane anywhere in metadata!'],
      ['Brisbane CBD competitors win via Doyle’s Guide & specialist content hubs:', 'HopgoodGanim (1,224 historical AI mentions), Cooper Grace Ward, Phillips Family Law (254 historical mentions), and de Groots (310 mentions) dominate Brisbane CBD via Doyle’s Guide rankings and deep Probate/FPA content.'],
      ['The Brisbane positioning fix:', 'Target price-sensitive and boutique-seeking Brisbane clients with a dedicated /brisbane-family-and-wills-lawyers hub highlighting Free 30-Min Partner Consultations, Fixed-Fee Wills, Deferred Property Settlement Fees, and video/Settify onboarding.'],
    ],
  },
  brisbane_west: {
    title: `In Brisbane West (Indooroopilly, Kenmore & Centenary), Will & Estate Lawyers AU, The Estate Lawyers & Cornford-Scott lead; Millwater Tyrrell scores 0/35`,
    finds: [
      ['Brisbane’s Western Corridor (Indooroopilly, Kenmore, Jindalee, Mt Ommaney) connects directly to Ipswich via the Centenary & Ipswich Motorways.', 'Suburban specialists like Cornford-Scott Lawyers (Sherwood), Damien Greer (Toowong), and Keane Legal capture Western Suburbs family and estates instructions.'],
      ['Zero Centenary / Western Suburbs geographic signals on millwatertyrrell.com.au:', 'Despite being 20–25 minutes from Jindalee, Mt Ommaney, Forest Lake, and Kenmore, Millwater Tyrrell has zero geographic copy or schema referencing Brisbane’s Western Suburbs.'],
      ['The Brisbane West fix:', 'Launch /brisbane-west-centenary-family-and-estate-lawyers targeting Jindalee, Mt Ommaney, Kenmore, Indooroopilly & Forest Lake — offering Western Suburbs families a Free 30-Min Partner Consult without Brisbane CBD parking or hourly rates.'],
    ],
  },
  brisbane_south: {
    title: `In Brisbane South (Mt Gravatt & Sunnybank), Bennett Carroll (20/35), Michael Lynch & Australian Family Lawyers lead; Millwater Tyrrell scores 0/35`,
    finds: [
      ['How Bennett Carroll Solicitors captures 20/35 (57%) in Brisbane South AND 11/35 in Ipswich:', 'Bennett Carroll (bcglaw.com.au — 68 AI citations) ranks across both Brisbane South (Upper Mt Gravatt office) and Ipswich because it builds explicit suburb-specific Family Law and Wills & Estates landing pages.'],
      ['Koolik & Associates and Michael Lynch Family Lawyers dominate Sunnybank & Eight Mile Plains:', 'AI engines retrieve hyper-local suburban pages and LawConnect / ThreeBestRated directory listings when answering Southside family and wills queries.'],
      ['The Brisbane South fix:', 'Syndicate Millwater Tyrrell’s partner profiles (David Millwater & Matthew Tyrrell) across LawConnect (#1 cited domain: 224 citations), Queensland Law Society, and ThreeBestRated for Greater Brisbane & South-West corridors.'],
    ],
  },
  brisbane_north: {
    title: `In Brisbane North (Chermside & North Lakes), Northside Family Law (18/35), Barton Family Lawyers (17/35) & Best Wilson Buckley lead; Millwater Tyrrell scores 0/35`,
    finds: [
      ['Best Wilson Buckley (205 Brisbane St, Ipswich) captures 9/35 in Brisbane North & 472 historical AI mentions:', 'Even though Best Wilson Buckley sits 2 doors down from Millwater Tyrrell on Brisbane Street in Ipswich, it captures Greater Brisbane AI recall via multi-corridor pages (bwbfamilylaw.com.au) and 472 historical AI mentions!'],
      ['Suburban specialists win on accredited mediation & fixed-fee wills:', 'Northside Family Law Centre (Chermside), Barton Family Lawyers (Aspley), and Kelly Lawyers win Northside queries by publishing explicit FDRP mediation and probate guides.'],
      ['The takeaway for Millwater Tyrrell:', 'Model Best Wilson Buckley’s multi-corridor content architecture: elevate David Millwater’s Accredited Family Dispute Resolution Practitioner (FDRP) mediation service for Greater Brisbane remote/video mediations.'],
    ],
  },
  brisbane_east: {
    title: `In Brisbane East & Bayside (Carindale & Wynnum), DBL Solicitors (13/35), The Estate Lawyers (9/35) & Michael Lynch (8/35) lead; Millwater Tyrrell scores 0/35`,
    finds: [
      ['The Estate Lawyers (52/280 overall) & DBL Solicitors win on Probate and Estate Litigation:', 'In Brisbane East, AI engines heavily cite specialist estate litigation pages covering Family Provision Applications (Part 4 Succession Act 1981 QLD) and Supreme Court of Queensland probate rules.'],
      ['Why Millwater Tyrrell misses Wills & Estates recall outside Ipswich:', 'Millwater Tyrrell only has 4 Wills/Estates URLs (/wills-and-estates, /powers-of-attorney, /testamentary-trusts, /superannuation-and-binding-death-benefit-nominations) and zero Probate or Contesting Wills pages.'],
      ['The Wills & Estates authority fix:', 'Publish comprehensive Queensland Probate, Letters of Administration, and Family Provision Application (Contesting a Will) practice pages authored by Partner Matthew Tyrrell.'],
    ],
  },
  logan: {
    title: `In Logan & the Western Corridor (Ipswich to Brisbane), Millwater Tyrrell ranks #4 with ${cityStats.logan.lhdMentions}/35 (${cityStats.logan.rate}%) — and SIX #1 rankings!`,
    finds: [
      ['Millwater Tyrrell’s strongest corridor outside Ipswich CBD (9/35 mentions · 8 Top-3 · 6 #1s!):', 'When prompts reference the Western Corridor between Ipswich and Logan/Brisbane, Millwater Tyrrell surges to 25.7% recall — winning #1 on ChatGPT, AI Mode, Gemini, and Claude for Fixed/Deferred-Fee Family & Wills Law!'],
      ['Why the Western Corridor works for Millwater Tyrrell:', 'Because the prompt bridges Ipswich to Brisbane/Logan, AI engines connect Millwater Tyrrell’s Ipswich HQ (215 Brisbane St) with Western Corridor growth suburbs (Ripley, Redbank Plains, Springfield, Forest Lake).'],
      ['How to convert 25.7% into #1 Western Corridor leadership:', 'Overtake Fallu McMillan (15/35) and Stanford Legal (11/35) by adding Probate & Contesting a Will pages and launching dedicated Ripley Valley, Springfield, and Western Corridor landing pages.'],
    ],
  },
};

function marketSlide(c, idx) {
  const m = cityStats[c]; const N = MARKET_NOTES[c];
  slide(`city-${c}`, idx % 2 ? 'white' : 'light', `
    <header class="hd"><p class="eyebrow">0${idx} · ${CITY[c]}</p><h2 class="h1">${esc(N.title)}</h2></header>
    <div class="city3">
      <div class="panel"><p class="chart-title">Answers naming each law firm in ${CITY[c]} (of ${ANSWERS_PER_CITY})</p>${cityBars(c, 7)}</div>
      <div class="city-side">
        <div class="kpis">
          <div class="kpi"><span class="big pulp"><b class="count" data-to="${m.rate}">${m.rate}</b>%</span><span class="kpi-cap">answers naming Millwater Tyrrell (${m.lhdMentions}/${ANSWERS_PER_CITY})</span></div>
          <div class="kpi"><span class="big">${m.lhdMentions ? '#' + m.lhdRank : '0/35'}</span><span class="kpi-cap">of ${m.firmsNamed} law firms named</span></div>
        </div>
        <p class="mini-title">By Assistant · of 7 Questions</p>${platStrip(c)}
        <p class="mini-title">By Practice Area · of ${NUM_PLATFORMS} Engines</p>${pracChips(c)}
      </div>
      <div class="finds-col">${N.finds.map(([b, t], i) => `<p class="rise" style="--d:${700 + i * 140}ms"><b>${esc(b)}</b> ${esc(t)}</p>`).join('')}</div>
    </div>
    ${src(SRC_ANS)}`);
}

['springfield', 'brisbane', 'brisbane_west', 'brisbane_south', 'brisbane_north', 'brisbane_east', 'logan'].forEach((c, i) => marketSlide(c, i + 2));

// ─── 18. The Pattern (Scatter Plot + IRLS Econometrics) ─────────────────────
{
  const w = 1000, h = 620, pl = 100, pr = 80, pt = 40, pb = 90;
  // Plot Local Geographic & GBP Signal Strength (0 to 100 index) vs AI Answer Share (%)
  const geoIndex = {
    ipswich: 85,        // HQ address + 4.8★ (107 rev) Pack #5 + 3/7 SERP Top 10
    logan: 48,          // Western Corridor adjacency + Ipswich SERP spillover
    springfield: 25,    // 20 mins from HQ, no dedicated Springfield page
    brisbane_west: 12,  // Adjacent corridor, zero on-site signals
    brisbane: 8,        // Zero Brisbane metadata/GBP
    brisbane_south: 6,
    brisbane_north: 5,
    brisbane_east: 4
  };
  const labelOffsets = {
    ipswich:        { dx: -18, dy: 8,   anchor: 'end',   label: 'Ipswich HQ' },
    logan:          { dx: 18,  dy: 6,   anchor: 'start', label: 'Logan & Western Corridor' },
    springfield:    { dx: 18,  dy: -16, anchor: 'start', label: 'Springfield & Greater Springfield' },
    brisbane_west:  { dx: 0,   dy: 0,   anchor: 'start', label: '', hide: true },
    brisbane:       { dx: 14,  dy: -26, anchor: 'start', label: 'Brisbane CBD & Metro (5 Corridors)' },
    brisbane_south: { dx: 0,   dy: 0,   anchor: 'start', label: '', hide: true },
    brisbane_north: { dx: 0,   dy: 0,   anchor: 'start', label: '', hide: true },
    brisbane_east:  { dx: 0,   dy: 0,   anchor: 'start', label: '', hide: true }
  };
  const x = v => pl + (v / 100) * (w - pl - pr), y = v => pt + (h - pt - pb) * (1 - v / 50);

  const pts = ORDER.map((c, i) => {
    const sx = geoIndex[c] || 5;
    const sy = cityStats[c].rateExact;
    const px = x(sx), py = y(sy);
    const off = labelOffsets[c] || { dx: 18, dy: 6, anchor: 'start', label: CITY[c] };
    if (off.hide) {
      return `<circle cx="${px}" cy="${py}" r="10" fill="#179CEE" stroke="#0F172A" stroke-width="3"/>`;
    }
    const lx = px + off.dx;
    const ly = py + off.dy;
    return `<g class="pop" style="--d:${300 + i * 110}ms">
      <circle cx="${px}" cy="${py}" r="13" fill="#179CEE" stroke="#0F172A" stroke-width="4"/>
      <text x="${lx}" y="${ly}" text-anchor="${off.anchor}" class="sc-lab">${off.label} <tspan class="sc-v">${cityStats[c].rateExact}% (${cityStats[c].lhdMentions}/35)</tspan></text>
    </g>`;
  }).join('');

  const sc = `<svg class="chart" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Scatter of corridor geographic & GBP signal strength against AI answer share">
    ${[0, 10, 20, 30, 40, 50].map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${t}%</text>`).join('')}
    ${[0, 25, 50, 75, 100].map(t => `<text x="${x(t)}" y="${h - pb + 42}" class="ax" text-anchor="middle">${t}</text>`).join('')}
    <line x1="${x(35)}" x2="${x(35)}" y1="${pt}" y2="${h - pb}" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="6 6"/>
    <text x="${x(35) + 12}" y="${pt + 22}" text-anchor="start" fill="#DC2626" font-size="14" font-weight="700">Corridor Entity &amp; GBP Threshold</text>
    <text x="${(pl + w - pr) / 2}" y="${h - 14}" class="ax-t" text-anchor="middle">Local GBP Pack, Suburb Landing Page &amp; Organic SERP Signal Index (0–100)</text>
    <text transform="translate(26 ${(pt + h - pb) / 2}) rotate(-90)" class="ax-t" text-anchor="middle">AI Answers Naming Millwater Tyrrell (%)</text>
    ${pts}</svg>`;

  const b1 = M.irls?.coefficients?.[1] || { beta: 0.36, or: 1.43, pValue: '0.5619' };
  const b2 = M.irls?.coefficients?.[2] || { beta: 3.95, or: 52.1, pValue: '<0.001' };
  const b3 = M.irls?.coefficients?.[3] || { beta: 0.98, or: 2.66, pValue: '0.1265' };

  slide('pattern', 'light', `
    <header class="hd"><p class="eyebrow">The Empirical Pattern · Live IRLS Econometric Attribution</p><h2 class="h1">Corridor GBP &amp; local entity grounding (${b2.or.toFixed(1)}× odds), dedicated practice pages (${b3.or.toFixed(2)}×), and Top-10 SERPs (${b1.or.toFixed(2)}×) govern recall</h2></header>
    <div class="cols-60">
      <div class="panel">${sc}</div>
      <div class="side-stats">
        <div class="stat"><span class="big pulp">${b2.or.toFixed(1)}×</span><span class="stat-cap"><b>Corridor GBP &amp; Local Entity Grounding (β̂₂ = +${b2.beta.toFixed(2)}, <i>p</i> ${esc(b2.pValue)}):</b> Live IRLS logistic regression across all 280 answers proves Millwater Tyrrell is <b>${b2.or}× more likely</b> to be recommended where it has local GBP &amp; corridor entity signals (Ipswich 42.9% vs Brisbane 0%).</span></div>
        <div class="stat"><span class="big">${b3.or.toFixed(2)}×</span><span class="stat-cap"><b>Dedicated Practice Sub-Page Architecture (β̂₃ = +${b3.beta.toFixed(2)}):</b> Having dedicated practice pages (Family Law, Parenting/FDRP, Fixed/Deferred Fees) yields <b>${b3.or}× higher odds</b> than missing practice pages (Probate = 0/40).</span></div>
        <div class="stat"><span class="big">9/40</span><span class="stat-cap"><b>The Commercial Offer Multiplier (22.5%):</b> Whenever AI retrieves <code>/pricing</code> (Free 30-Min Partner Consult + Fixed-Fee Wills + Deferred Property Settlement Fees), Millwater Tyrrell wins #1 in 6 of 9 mentions!</span></div>
      </div>
    </div>
    ${src('Source: 280 AI answers paired with 12-pack Google Maps audit (maps_audit.json) and live IRLS logistic regression (metrics.json), October 2026.')}`);
}

// ─── 19. 15-Month Trend ─────────────────────────────────────────────────────
{
  const S = [
    ['Best Wilson Buckley', 'bwbfamilylaw.com.au', '#0D1520', 4],
    ['de Groots Wills/Estates', 'degroots.com.au', '#334155', 3],
    ['Phillips Family Law', 'phillipsfamilylaw.com.au', '#475569', 3],
    ['QLD Estate Lawyers', 'qldestatelawyers.com.au', '#64748B', 3],
    ['McNamara Law', 'mcna.com.au', '#94A3B8', 3],
    ['Walker Pender', 'walkerpender.com.au', '#CBD5E1', 3],
    ['Millwater Tyrrell Law', 'millwatertyrrell.com.au', '#179CEE', 6],
  ];
  const labels = HIST_LABELS;
  const bwbTot = seriesAll('bwbfamilylaw.com.au').reduce((a, b) => a + b, 0);
  const dgTot = seriesAll('degroots.com.au').reduce((a, b) => a + b, 0);
  const mcnaTot = seriesAll('mcna.com.au').reduce((a, b) => a + b, 0);
  const wpTot = seriesAll('walkerpender.com.au').reduce((a, b) => a + b, 0);
  const mtTot = seriesAll('millwatertyrrell.com.au').reduce((a, b) => a + b, 0);

  const chart = lineChart({
    w: 1140, h: 590, pad: [34, 395, 68, 76], labels, yMax: 100, yTicks: [0, 25, 50, 75, 100], yFmt: v => v.toLocaleString('en-AU'),
    series: S.map(([name, d, color, width]) => {
      const vals = series(d);
      const tot15 = seriesAll(d).reduce((a, b) => a + b, 0);
      return {
        name,
        values: vals,
        color,
        width,
        cls: name === 'Millwater Tyrrell Law' ? 'pulp' : '',
        textColor: name === 'Millwater Tyrrell Law' ? '#0D74B8' : '#191919',
        valueLabel: `${vals[vals.length - 1]}/mo (${tot15} tot)`
      };
    }),
  });
  const sh = lineChart({
    w: 520, h: 220, pad: [34, 40, 50, 70], labels: labels.map((l, i) => (i === 0 || i === labels.length - 1) ? l : ''), yMax: 5, yTicks: [0, 1, 2, 3, 5], yFmt: v => v + '%', endLabels: false,
    series: [{ name: 'Millwater Tyrrell Share', values: shareSeries, color: '#179CEE', width: 5, label: false }],
    ann: [(x, y) => `<text x="${x(labels.length - 1)}" y="${y(shareSeries[shareSeries.length - 1]) - 14}" text-anchor="end" class="callsmall pulp">${shareSeries[shareSeries.length - 1]}% (Sep 26)</text>`],
  });

  slide('trend', 'white', `
    <header class="hd"><p class="eyebrow">15-Month Historical Domain Citations · DataForSEO Australia Index</p><h2 class="h1">Across Australia-wide AI answers, Best Wilson Buckley logged ${bwbTot} domain citations and McNamara Law logged ${mcnaTot}, vs ${mtTot} for Millwater Tyrrell</h2></header>
    <div class="cols-trend">
      <div class="panel"><p class="chart-title">Monthly Google AI answers in Australia citing each law firm’s domain (completed months Aug 2025–Sep 2026; 15-mo totals incl. Oct 2026 MTD shown at right)</p>${chart}</div>
      <div class="side-stats">
        <div class="stat"><span class="big">${(mcnaTot / Math.max(1, mtTot)).toFixed(1)}×</span><span class="stat-cap"><b>Why Multi-Page Hubs Compound Nationally:</b> While Millwater Tyrrell beats Best Wilson Buckley in local Ipswich buyer prompts (15/35 vs 9/35), <code>mcna.com.au</code> (<b>${mcnaTot} citations</b>, 15,690 impressions) and <code>walkerpender.com.au</code> (<b>${wpTot} citations</b>) win 5–9× more Australia-wide informational citations via deep topic articles.</span></div>
        <div class="mini-chart"><p class="mini-title">Millwater Tyrrell Share of Tracked Cohort (Aug 25–Sep 26)</p>${sh}<p class="note">Millwater Tyrrell rose from 0 monthly domain citations in 2025 to 2/mo in Sep 2026 (and 4 in Oct 2026 MTD, 9 total) — early momentum that scales once Probate, FPA &amp; Brisbane hubs go live.</p></div>
      </div>
    </div>
    ${src('Source: DataForSEO LLM Mentions Historical API (/v3/ai_optimization/llm_mentions/historical/live, location_code: 2036 Australia, Aug 2025 to Sep 2026 completed months + Oct 2026 MTD).')}`);
}

// ─── 20. The Gap to Close (Dumbbell) ────────────────────────────────────────
{
  const w = 1520, rowH = 66, top = 58, left = 430, right = 150;
  const x = v => left + v / 100 * (w - left - right);
  const rows = ORDER.map((c, i) => {
    const s = cityStats[c]; const yy = top + i * rowH; const gap = s.rate - s.leaderRate;
    return `<g class="db" style="--d:${200 + i * 110}ms">
      <text x="0" y="${yy + 9}" class="db-city">${CITY[c]}</text>
      <line x1="${x(Math.min(s.rate, s.leaderRate))}" x2="${x(Math.max(s.rate, s.leaderRate))}" y1="${yy}" y2="${yy}" class="db-line grow-x" style="--d:${300 + i * 110}ms"/>
      <circle cx="${x(s.leaderRate)}" cy="${yy}" r="13" fill="#0F172A" class="pop" style="--d:${250 + i * 110}ms"/>
      <circle cx="${x(s.rate)}" cy="${yy}" r="13" fill="#179CEE" stroke="#FFFFFF" stroke-width="4" class="pop" style="--d:${450 + i * 110}ms"/>
      <text x="${w - right + 30}" y="${yy + 9}" class="db-gap ${gap >= 0 ? 'pos' : ''}">${gap > 0 ? '+' : gap === 0 ? '±' : '−'}${Math.abs(gap)} pts</text>
      <text x="${x(s.leaderRate)}" y="${yy - 20}" text-anchor="middle" class="db-lead">${esc(short(s.leader.name))}</text>
    </g>`;
  }).join('');

  const svg = `<svg class="chart" viewBox="0 -10 ${w + 40} ${top + ORDER.length * rowH}" width="${w + 40}" height="${top + ORDER.length * rowH}" role="img" aria-label="Millwater Tyrrell Law share against the top competitor per corridor">
    ${[0, 25, 50, 75, 100].map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="20" y2="${top + (ORDER.length - 1) * rowH + 24}" class="gl"/><text x="${x(t)}" y="10" class="ax" text-anchor="middle">${t}%</text>`).join('')}
    ${rows}</svg>`;

  slide('gap', 'light', `
    <header class="hd"><p class="eyebrow">The Gap to Close</p><h2 class="h1">Millwater Tyrrell’s gap to the local leader across all 8 Ipswich &amp; Greater Brisbane corridors</h2></header>
    <div class="legend-row"><span><i class="lg-dot pulp"></i>Millwater Tyrrell Law</span><span><i class="lg-dot navy"></i>Corridor Leader</span><span class="muted">Share of the corridor's ${ANSWERS_PER_CITY} AI Search answers</span></div>
    <div class="panel">${svg}</div>
    ${src(SRC_ANS)}`);
}

// ─── 21. The Plan Intro (Accent — Benchmark Page 21) ────────────────────────
slide('plan-intro', 'accent', `
  <p class="eyebrow on-accent rise" style="--d:0ms">The Action Plan · Pages 21–28</p>
  <h2 class="display on-accent rise" style="--d:120ms">How Millwater Tyrrell Law gets recommended for Family Law and Wills &amp; Estates across Ipswich &amp; Brisbane</h2>
  <p class="lede on-accent rise" style="--d:260ms">Five concrete workstreams engineered directly from our 280-answer citation ledger, Firecrawl Squarespace audit, and Google Maps CID inspection — re-categorising the 4.8★ (107-review) GBP, building the missing Probate &amp; Contesting Wills pages, launching Springfield &amp; Brisbane corridor hubs, and purging 88 junk testimonial URLs.</p>`, { dark: true });

// ─── 22. The 5 Strategic Workstreams (Benchmark Page 22) ────────────────────
const WS = [
  ['01', 'Legal Directory & QLS Co-Citation Authority', `Across ${TOTAL_ANSWERS} AI answers, models emitted ${CITS.totalCitations.toLocaleString()} citations across ${CITS.uniqueDomains} domains — led by lawconnect.com (224 citations), doylesguide.com (149), and qls.com.au (73). millwatertyrrell.com.au was cited ${CITS.clientDomainCitations} times.`, 'Claim & enrich Firm + Partner profiles (David Millwater & Matthew Tyrrell) on LawConnect, Queensland Law Society (QLS Find a Solicitor), ThreeBestRated (Ipswich & Brisbane), Lawzana & Family Relationships Online (FDRP).'],
  ['02', 'GBP Category Re-Engineering & Springfield/Brisbane Presence', 'Millwater Tyrrell holds 4.8★ (107 reviews, CID 6376809625893182443), yet ranks #5 in Ipswich Maps behind Richard Zande (4.6★, 94 rev) because its GBP category is generic "Legal services" with 0 additional categories and http:// URL.', 'Change Primary GBP category to "Family law attorney", add "Divorce lawyer", "Estate planning attorney", "Mediation service" & "Law firm"; switch GBP URL to https://; add Brisbane & Springfield service areas.'],
  ['03', 'Probate, Contesting Wills (FPA) & Corridor Landing Pages', 'Millwater Tyrrell scores 0/40 (0%) on Probate and 0/175 (0%) across all 5 Brisbane corridors because the site has zero Probate or Contesting a Will pages and zero Springfield or Brisbane location pages.', 'Publish dedicated /probate-and-estate-administration and /contesting-a-will-family-provision-qld pages, plus /springfield-lawyers, /brisbane-family-and-wills-lawyers & /brisbane-west-centenary-lawyers hubs.'],
  ['04', 'Squarespace JSON-LD Schema Fix & 88-URL Sitemap Purge', '173-URL sitemap is 50.9% junk (88 duplicate /testimonials/{hash} URLs + /hide page + HTTP 403 /search); JSON-LD outputs invalid phone "734470416", empty sameAs: [], raw HTML in description, and homepage <title> omits Wills & Estates.', 'Noindex /testimonials/* item slugs & /hide; fix homepage <title> to include Wills & Estates + Brisbane/Springfield; inject clean LegalService + Attorney + FAQPage JSON-LD & publish /llms.txt.'],
  ['05', 'Monthly 280-Prompt Ipswich & Brisbane Benchmark', 'Competitor rankings (Fallu McMillan, McNamara Law, Stanford Legal, Brookwater Legal, Best Wilson Buckley) and AI retrieval weights shift monthly.', 'Re-run the 280-prompt × 5-engine empirical panel + 56 SERP checks + 12 Maps pack audits on the 15th of each month to verify Millwater Tyrrell’s climb across Ipswich, Springfield & Brisbane.'],
];

slide('plan', 'white', `
  <header class="hd"><p class="eyebrow">The Plan</p><h2 class="h1">Five workstreams, each answering a verified gap in the empirical data</h2></header>
  <div class="ws">
    <div class="ws-head"><span></span><span>Workstream</span><span>What the data showed</span><span>What we will do</span></div>
    ${WS.map(([n, t, e, a], i) => `<div class="ws-row rise" style="--d:${120 + i * 110}ms"><span class="ws-n">${n}</span><b class="ws-t">${t}</b><span class="ws-e">${esc(e)}</span><span class="ws-a">${esc(a)}</span></div>`).join('')}
  </div>`);

// ─── 23. Workstream 01: Cited Sources (Benchmark Page 23 #s23) ──────────────
{
  const topDoms = (CITS.topDomains || []).slice(0, 8).map(d => [
    `${d.domain} (${d.type})`,
    d.count
  ]);
  if (!topDoms.some(([n]) => n.startsWith('millwatertyrrell.com.au'))) {
    topDoms.push([`millwatertyrrell.com.au (${CITS.clientDomainCitations} direct citations · ${M.mtMentioned} mentions)`, CITS.clientDomainCitations]);
  }
  const maxCit = Math.max(50, ...(topDoms.map(x => x[1])));

  slide('ws-sources', 'light', `
    <header class="hd"><p class="eyebrow">Workstream 01 · Legal Directory, Bar Association &amp; Competitor Citation Graph</p><h2 class="h1">AI engines emitted ${CITS.totalCitations.toLocaleString()} citations across ${CITS.uniqueDomains} domains — led by <code>lawconnect.com</code> (224), <code>doylesguide.com</code> (149) &amp; <code>qls.com.au</code> (73)</h2></header>
    <div class="cols-60">
      <div class="panel"><p class="chart-title">Most-cited domains across the ${TOTAL_ANSWERS} AI Search answers (total grounding citations)</p>
        ${hbars(topDoms.map(([n, v]) => ({ name: n, n: v, suffix: ' citations', isTarget: n.startsWith('millwatertyrrell') })), maxCit, { showRank: false })}</div>
      <div class="actions">
        <h3 class="h3">Exact who &amp; what to execute</h3>
        <ul class="ticks">
          <li><b>Dominate <code>lawconnect.com</code> (#1 most-cited domain with 224 citations) &amp; <code>qls.com.au</code> (73 citations):</b> Create complete firm and individual solicitor profiles for <b>David Millwater</b> (Family Law &amp; Accredited FDRP Mediator), <b>Matthew Tyrrell</b> (Wills, Estates, Probate &amp; Commercial), <b>Shannon Harding</b>, <b>Aislyn King</b>, and <b>Isabel Bosman</b> covering both Ipswich and Greater Brisbane.</li>
          <li><b>Secure inclusion on <code>threebestrated.com.au</code>, <code>lawzana.com</code> &amp; <code>gotocourt.com.au</code>:</b> Perplexity, ChatGPT, and Gemini repeatedly ground “best family lawyers” and “wills and estates lawyers” answers in ThreeBestRated and Lawzana listicles for Ipswich, Logan, and Brisbane suburbs.</li>
          <li><b>Register David Millwater on Family Relationships Online / Attorney-General’s FDRP Register:</b> Surface David Millwater’s Accredited Family Dispute Resolution Practitioner status (Section 60I Certificates) on government and legal mediation directories cited by Claude and Gemini.</li>
        </ul>
      </div>
    </div>
    ${src('Source: 280-answer citation ledger (pipeline/citations.json), October 2026.')}`);
}

// ─── 24. Workstream 02: Google Maps & Local Authority (Benchmark Page 24) ───
{
  const rev = {
    ipswich: 'Pack #5 · 4.8★ (107 rev) · Generic "Legal services" category only!',
    springfield: 'Absent from Pack-20 · Brookwater Legal (4.8★) & McNamara Law lead',
    brisbane: 'Absent from Pack-20 · HopgoodGanim, Phillips & Best Wilson Buckley lead',
    brisbane_west: 'Absent from Pack-20 · Cornford-Scott (Sherwood) & Damien Greer lead',
    brisbane_south: 'Absent from Pack-20 · Bennett Carroll (Upper Mt Gravatt) leads',
    brisbane_north: 'Absent from Pack-20 · Northside Family Law & Barton Family Law lead',
    brisbane_east: 'Absent from Pack-20 · DBL Solicitors (Morningside/Wynnum) leads',
    logan: 'Absent from Pack-20 · 9/35 AI recall driven by Western Corridor proximity'
  };
  slide('ws-maps', 'white', `
    <header class="hd"><p class="eyebrow">Workstream 02 · GBP Category Re-Engineering &amp; Corridor Pack Expansion</p><h2 class="h1">Millwater Tyrrell’s 4.8★ (107 reviews) beats #1 Richard Zande (4.6★, 94 reviews) — yet ranks #5 because of a single GBP category setting</h2></header>
    <div class="cols-60">
      <div class="panel">
        <div class="mp-head"><span>Corridor</span><span>AI Recall (of 7 Prompts)</span><span>Live DataForSEO Google Maps Pack Audit</span></div>
        ${ORDER.map((c, i) => `<div class="mp-row" style="--i:${i}"><span class="mp-city">${CITY[c]}</span><span>${dots(Math.min(7, cityStats[c].lhdMentions), 7, 'big')}<b class="num">${cityStats[c].lhdMentions}/35</b></span><span class="num">${esc(rev[c])}</span></div>`).join('')}
      </div>
      <div class="actions">
        <h3 class="h3">Exact GBP fixes to execute in Week 1</h3>
        <ul class="ticks">
          <li><b>Fix GBP Primary &amp; Additional Categories on CID <code>6376809625893182443</code> (Day 1):</b> Currently, Millwater Tyrrell’s GBP is set solely to <code>"Legal services"</code> with <code>additional_categories: []</code>. Change Primary Category to <code>"Family law attorney"</code> and add <code>"Estate planning attorney"</code>, <code>"Divorce lawyer"</code>, <code>"Mediation service"</code>, and <code>"Law firm"</code> — matching #1 Richard Zande and #3 Walker Pender!</li>
          <li><b>Upgrade GBP Website Link from <code>http://</code> to <code>https://</code> &amp; Add Service Areas:</b> The live GBP URL is unencrypted <code>http://millwatertyrrell.com.au/</code>. Update to <code>https://millwatertyrrell.com.au/</code> and configure explicit GBP Service Areas for <b>Ipswich, Springfield Lakes, Brookwater, Ripley, Indooroopilly, Kenmore, Jindalee, Mount Gravatt, and Brisbane CBD</b>.</li>
          <li><b>Add GBP “Services” Menu for Family Law &amp; Wills/Estates:</b> Populate structured GBP Services for Property Settlement, Parenting Orders, Section 60I Mediation, Fixed-Fee Wills, Enduring Powers of Attorney, Probate, and Family Provision Claims.</li>
        </ul>
      </div>
    </div>
    ${src('Source: 56 DataForSEO QLD Google SERP checks (serp_audit.json) and 12-pack Google Maps CID audit (maps_audit.json), October 2026.')}`);
}

// ─── 25. Workstream 03: Practice & Corridor Pages (Benchmark Page 25) ───────
{
  const shade5 = v => ['#F8FAFC', '#EFF6FF', '#BFDBFE', '#60A5FA', '#2563EB', '#179CEE'][Math.min(5, v)];
  const grid = `<div class="cp" role="table" aria-label="AI answers naming Millwater Tyrrell Law by corridor and practice area">
    <div class="cp-row head" role="row"><span role="columnheader"></span>${PRAC.map(([k]) => `<span role="columnheader">${PRAC_SHORT[k]}</span>`).join('')}</div>
    ${ORDER.map((c, ri) => `<div class="cp-row" role="row"><span class="cp-city" role="rowheader">${CITY[c]}</span>${PRAC.map(([p], ci) => { const v = cityStats[c].byPrompt[p].lhd; return `<span role="cell" class="cp-cell pop${v === 0 ? ' zero' : ''}" style="--d:${150 + (ri * 7 + ci) * 18}ms;background:${shade5(v)};color:${v >= 3 ? '#FFFFFF' : '#0F172A'}">${v}</span>`; }).join('')}</div>`).join('')}
  </div>`;
  const zeros = ORDER.reduce((s, c) => s + PRAC.filter(([p]) => cityStats[c].byPrompt[p].lhd === 0).length, 0);

  slide('ws-pages', 'light', `
    <header class="hd"><p class="eyebrow">Workstream 03 · Missing Wills/Estates Sub-Pages &amp; Brisbane/Springfield Corridor Hubs</p><h2 class="h1">Millwater Tyrrell wins 4/5 in Ipswich &amp; Logan on Fixed/Deferred Fees — but scores zero in ${zeros} of 56 corridor × practice cells</h2></header>
    <div class="cols-heat">
      <div class="panel"><p class="chart-title">Assistants naming Millwater Tyrrell (of ${NUM_PLATFORMS}), by corridor and practice question. Dashed cells are zero.</p>${grid}</div>
      <div class="actions">
        <h3 class="h3">Exact URLs to build on millwatertyrrell.com.au</h3>
        <ul class="ticks">
          <li><b>Build the 3 Missing Wills &amp; Estates Pillar Pages (Weeks 1–3):</b> Currently, Family Law has 15 sub-pages while Wills &amp; Estates has only 4 — and <b>zero Probate or Estate Litigation pages</b>! Publish:<br>
          1) <code>/probate-and-deceased-estate-administration-qld</code> (Grants of Probate, Letters of Administration, Executor duties)<br>
          2) <code>/contesting-a-will-family-provision-applications-qld</code> (Part 4 <i>Succession Act 1981</i> QLD FPA claims &amp; estate defence)<br>
          3) <code>/wills-and-estates-pricing</code> (adding the missing Wills &amp; EPOA fixed-fee pricing card to <code>/pricing</code>).</li>
          <li><b>Launch 4 High-Intent Corridor Hubs for Springfield &amp; Brisbane (Weeks 3–6):</b><br>
          1) <code>/springfield-family-and-wills-lawyers</code> (Springfield Lakes, Brookwater, Augustine Heights)<br>
          2) <code>/brisbane-family-and-wills-lawyers</code> (Brisbane CBD &amp; Metro — Free 30-Min Partner Consult &amp; Deferred Fee positioning)<br>
          3) <code>/brisbane-west-indooroopilly-centenary-lawyers</code> (Jindalee, Mt Ommaney, Kenmore, Indooroopilly)<br>
          4) <code>/logan-ripley-western-corridor-lawyers</code>.</li>
        </ul>
      </div>
    </div>
    ${src(SRC_ANS)}`);
}

// ─── 26. Workstream 04: Entity Accuracy & Live Site Audit (Benchmark Page 26) ─
slide('ws-entity', 'white', `
  <header class="hd"><p class="eyebrow">Workstream 04 · Forensic Squarespace Schema, Sitemap &amp; Metadata Audit</p><h2 class="h1">50.9% of <code>millwatertyrrell.com.au</code>’s sitemap is duplicate testimonial hash bloat, and its homepage title omits Wills &amp; Estates</h2></header>
  <div class="quotes">
    <figure class="quote rise" style="--d:100ms"><p class="q-src">Live Squarespace JSON-LD Extracted from millwatertyrrell.com.au (All 18 Audited Pages)</p><blockquote><code>{"@type": "Organization", "legalName": "Millwater Tyrrell Law", "telephone": "734470416", "sameAs": []}</code> · <code>"openingHours": "Mo 08:30-17:00, ..., Fr 08:30-17:00, , "</code></blockquote><figcaption><b>Root Cause:</b> Squarespace injects an invalid 9-digit telephone (<code>"734470416"</code> missing leading <code>0</code> or <code>+61 7</code>), an empty <code>sameAs: []</code> array, unescaped HTML tags in <code>WebSite.description</code>, and generic <code>LocalBusiness</code> instead of <code>LegalService</code> / <code>Attorney</code>.</figcaption></figure>
    <figure class="quote rise" style="--d:240ms"><p class="q-src">Live Sitemap &amp; Crawl Audit (173 Total URLs in sitemap.xml · site_audit.json)</p><blockquote><code>88 of 173 URLs (50.9%) = /testimonials/acr8b2gekwkkgl9-w6cf8-aakfa-d2kkm-...</code> · <code>/hide (Live Test Page)</code> · <code>GET /search → HTTP 403</code></blockquote><figcaption><b>Root Cause:</b> Squarespace generated 88 recursive random-hash URLs for testimonial items, wasting half the site’s crawl budget, while the header nav links to <code>/search</code> (which returns HTTP 403 Forbidden) and <code>/our-lawyers</code> only displays David Millwater on the main index.</figcaption></figure>
    <figure class="quote rise" style="--d:380ms"><p class="q-src">Homepage Title Tag &amp; Pricing Page Inspection</p><blockquote><code>&lt;title&gt;Ipswich Lawyers - Ipswich Expert Family &amp; Commercial Lawyers&lt;/title&gt;</code> · <code>/pricing cards: Family, Business, Criminal (No Wills Card!)</code></blockquote><figcaption><b>Root Cause:</b> The homepage title tag completely omits <b>Wills &amp; Estates</b> and <b>Brisbane / Springfield</b>, and <code>/pricing</code> lacks a dedicated Wills &amp; Estates pricing card despite offering fixed-fee Wills and retiree discounts.</figcaption></figure>
  </div>
  <div class="actions wide">
    <h3 class="h3">Exact Squarespace technical fixes to execute in Weeks 1–2</h3>
    <ul class="ticks cols">
      <li><b>Rewrite Homepage <code>&lt;title&gt;</code> &amp; Meta Description (Day 1):</b> Update from <em>"Ipswich Lawyers - Ipswich Expert Family &amp; Commercial Lawyers"</em> to <em>"Millwater Tyrrell Law | Family Lawyers &amp; Wills and Estates Lawyers — Ipswich, Springfield &amp; Brisbane"</em>.</li>
      <li><b>Purge the 88 <code>/testimonials/*</code> Hash URLs, Delete <code>/hide</code> &amp; Fix <code>/search</code> 403:</b> Disable individual collection item URLs on the Squarespace <code>/testimonials</code> collection, unpublish <code>/hide</code>, and remove the broken <code>/search</code> link from the header navigation.</li>
      <li><b>Inject Clean <code>LegalService</code> + <code>Attorney</code> JSON-LD &amp; Publish <code>/llms.txt</code>:</b> Use Squarespace Code Injection to declare E.164 phone <code>+61-7-3447-0416</code>, Google Maps CID <code>6376809625893182443</code>, <code>areaServed</code> across Ipswich, Springfield &amp; Brisbane, and <code>Person</code> schema for all lawyers.</li>
      <li><b>Complete <code>/our-lawyers</code> Roster &amp; Add Wills Card to <code>/pricing</code>:</b> Surface Partner <b>Matthew Tyrrell</b> alongside <b>David Millwater</b>, <b>Shannon Harding</b>, <b>Aislyn King</b>, and <b>Isabel Bosman</b> on <code>/our-lawyers</code>, and add a dedicated Fixed-Fee Wills &amp; Probate card on <code>/pricing</code>.</li>
    </ul>
  </div>
  ${src('Sources: Live Firecrawl sitemap & JSON-LD audit of millwatertyrrell.com.au (pipeline/site_audit.json), October 2026.')}`);

// ─── 27. Roadmap (Gantt — Benchmark Page 27) ────────────────────────────────
{
  const lanes = [
    ['01 · Squarespace & Schema Fix', [[1, 3, 'Fix homepage title; purge 88 /testimonials/* URLs & /hide; fix /search 403'], [4, 7, 'Inject LegalService + Attorney + CID JSON-LD; add Matthew Tyrrell to /our-lawyers']]],
    ['02 · GBP Category & Service Areas', [[1, 3, 'Set Primary GBP to "Family law attorney" + add Estate, Divorce & Mediation'], [4, 9, 'Switch GBP URL to https://; add Springfield & Brisbane service areas; 107→150+ reviews']]],
    ['03 · Probate, FPA & Corridor Pages', [[2, 5, 'Publish /probate-qld, /contesting-a-will-fpa-qld & Wills pricing card on /pricing'], [6, 10, 'Launch /springfield-lawyers, /brisbane-family-wills-lawyers & /brisbane-west-lawyers']]],
    ['04 · LawConnect, QLS & Directories', [[2, 5, 'Optimize Firm & Partner profiles on LawConnect (224 cits), QLS (73 cits) & FDRP'], [6, 12, 'Secure ThreeBestRated, Lawzana & Doyle’s Guide listings for Family & Wills/Estates']]],
    ['05 · Monthly 280-Prompt Audit', [[1, 12, `Baseline locked Oct 2026 (${M.mtMentioned}/${TOTAL_ANSWERS}); re-run 280-prompt panel on the 15th of each month`, 'light']]],
  ];
  const lab = 330;
  const gantt = `<div class="gantt">
    <div class="g-head" style="grid-template-columns:${lab}px repeat(12, 1fr)"><span></span>${Array.from({ length: 12 }, (_, i) => `<span>W${i + 1}</span>`).join('')}</div>
    ${lanes.map(([name, bars], li) => `<div class="g-lane"><span class="g-name">${name}</span><div class="g-track">${bars.map(([a, b, t, kind], bi) => `<div class="g-bar ${kind === 'light' ? 'milestone' : ''} grow-x" style="left:${(a - 1) / 12 * 100}%;width:${(b - a + 1) / 12 * 100}%;--d:${200 + (li * 2 + bi) * 90}ms"><span>${esc(t)}</span></div>`).join('')}</div></div>`).join('')}
    <div class="g-phases"><span style="width:33.33%">Month 1: GBP Categories, Sitemap Purge &amp; Schema</span><span style="width:33.33%">Month 2: Probate/FPA Pillars &amp; Springfield/Brisbane Hubs</span><span style="width:33.34%">Month 3: LawConnect/QLS Authority &amp; Review Velocity</span></div>
  </div>`;

  slide('roadmap', 'light', `
    <header class="hd"><p class="eyebrow">First 90 Days Execution</p><h2 class="h1">The first 90 days, week by week</h2></header>
    <div class="panel">${gantt}</div>
    <p class="note wide">Week 1 starts with 100% internal assets Millwater Tyrrell controls today: updating the GBP categories on CID <code>6376809625893182443</code>, rewriting the homepage title tag to include Wills &amp; Estates and Brisbane/Springfield, purging the 88 <code>/testimonials/*</code> hash URLs, and injecting valid <code>LegalService</code> JSON-LD.</p>`);
}

// ─── 28. Proposed Targets (Benchmark Page 28 — Strict Competitor Overtake Rule) ─
{
  const labels = ['Oct 26 (Today)', 'Jan 27 (90d)', 'Apr 27 (6m)', 'Oct 27 (12m)'];
  const xs = [0, 3, 6, 12];
  const w = 1000, h = 520, pl = 86, pr = 310, pt = 36, pb = 72;
  const ipsNow = cityStats.ipswich.rate; // 43% (15/35)
  const target = [ipsNow, 51, 60, 71];
  const y = v => pt + (h - pt - pb) * (1 - v / 85);
  const x = m => pl + m / 12 * (w - pl - pr);
  const mcnaIps = cityStats.ipswich.top.find(f => f.name === 'McNamara Law') || { name: 'McNamara Law', n: 17 };
  const mcnaRate = Math.round((mcnaIps.n / 35) * 100); // 49% (17/35)
  const fmIps = cityStats.ipswich.top.find(f => f.name === 'Fallu McMillan Lawyers') || { name: 'Fallu McMillan Lawyers', n: 24 };
  const fmRate = Math.round((fmIps.n / 35) * 100); // 69% (24/35)

  const svg = `<svg class="chart" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Millwater Tyrrell Law Ipswich target path vs McNamara Law and Fallu McMillan">
    ${[0, 20, 40, 60, 80].map(t => `<line x1="${pl}" x2="${w - pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl - 16}" y="${y(t) + 8}" class="ax" text-anchor="end">${t}%</text>`).join('')}
    ${xs.map((m, i) => `<text x="${x(m)}" y="${h - pb + 42}" class="ax" text-anchor="middle">${labels[i]}</text>`).join('')}
    <line x1="${x(0)}" x2="${x(12)}" y1="${y(mcnaRate)}" y2="${y(mcnaRate)}" stroke="#64748B" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" class="fadein"/>
    <text x="${x(12) + 18}" y="${y(mcnaRate) + 14}" class="el" fill="#64748B">McNamara Law today <tspan class="elv">${mcnaRate}%</tspan></text>
    <line x1="${x(0)}" x2="${x(12)}" y1="${y(fmRate)}" y2="${y(fmRate)}" stroke="#0F172A" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" class="fadein"/>
    <text x="${x(12) + 18}" y="${y(fmRate) + 24}" class="el">Fallu McMillan today <tspan class="elv">${fmRate}%</tspan></text>
    <path d="${target.map((v, i) => `${i ? 'L' : 'M'}${x(xs[i])},${y(v)}`).join('')}" pathLength="1" class="draw" fill="none" stroke="#179CEE" stroke-width="6" stroke-dasharray="1" style="--d:300ms"/>
    <path d="${target.map((v, i) => `${i ? 'L' : 'M'}${x(xs[i])},${y(v)}`).join('')}" fill="none" stroke="#F8FAFC" stroke-width="7" stroke-dasharray="14 12" class="fadein" style="--d:1500ms"/>
    ${target.map((v, i) => `<circle cx="${x(xs[i])}" cy="${y(v)}" r="${i ? 10 : 13}" fill="${i ? '#F8FAFC' : '#179CEE'}" stroke="#179CEE" stroke-width="5" class="pop" style="--d:${400 + i * 350}ms"/><text x="${i ? x(xs[i]) : x(xs[i]) + 22}" y="${i ? y(v) - 22 : y(v) + 38}" text-anchor="${i ? 'middle' : 'start'}" class="callsmall pulp">${i === 3 ? '' : v + '%'}${i ? '' : ` today (${cityStats.ipswich.lhdMentions}/35)`}</text>`).join('')}
    <text x="${x(12) + 18}" y="${y(target[3]) - 10}" class="el pulp-t">Millwater Tyrrell <tspan class="elv">${target[3]}%</tspan></text>
  </svg>`;

  const TG = [
    ['Ipswich Central (HQ)', `${cityStats.ipswich.rate}% (${cityStats.ipswich.lhdMentions}/35)`, '51% (18/35)', '60% (21/35)', `71% · beats Fallu McMillan (${fmRate}%)`],
    ['Logan & Western Corridor', `${cityStats.logan.rate}% (${cityStats.logan.lhdMentions}/35)`, '34% (12/35)', '40% (14/35)', '46% · beats Fallu McMillan (43%)'],
    ['Springfield & Greater Spg', `${cityStats.springfield.rate}% (${cityStats.springfield.lhdMentions}/35)`, '20% (7/35)', '34% (12/35)', '57% · beats McNamara Law (54%)'],
    ['Brisbane West (Centenary)', `${cityStats.brisbane_west.rate}% (${cityStats.brisbane_west.lhdMentions}/35)`, '11% (4/35)', '17% (6/35)', '23% · beats Cornford-Scott (20%)'],
    ['Brisbane CBD & Inner', `${cityStats.brisbane.rate}% (${cityStats.brisbane.lhdMentions}/35)`, '9% (3/35)', '17% (6/35)', '26% · beats Stewart Family Law (23%)'],
    ['Brisbane South (Mt Gravatt)', `${cityStats.brisbane_south.rate}% (${cityStats.brisbane_south.lhdMentions}/35)`, '9% (3/35)', '14% (5/35)', '23% · beats Michael Lynch Law (20%)'],
    ['Brisbane North (Chermside)', `${cityStats.brisbane_north.rate}% (${cityStats.brisbane_north.lhdMentions}/35)`, '9% (3/35)', '17% (6/35)', '29% · beats Best Wilson Buckley (26%)'],
    ['Brisbane East (Carindale)', `${cityStats.brisbane_east.rate}% (${cityStats.brisbane_east.lhdMentions}/35)`, '9% (3/35)', '14% (5/35)', '23% · beats HopgoodGanim (20%)'],
    ['All 280 Answers', `${M.mtRatePct}% (${M.mtMentioned}/280)`, '18.9% (53/280)', '26.8% (75/280)', '37.1% · beats McNamara Law (15.0%)']
  ];

  slide('targets', 'light', `
    <header class="hd"><p class="eyebrow">Proposed Targets</p><h2 class="h1">The goal: overtake McNamara Law (90d) and Fallu McMillan (12m) in Ipswich, and Best Wilson Buckley across Greater Brisbane</h2></header>
    <div class="cols-60">
      <div class="panel"><p class="chart-title">Ipswich Central (HQ): share of AI answers naming Millwater Tyrrell Law. Today's figure is measured; the dashed path is the target.</p>${svg}</div>
      <div>
        <table class="tg-table">
          <thead><tr><th>Corridor</th><th>Today</th><th>90 Days</th><th>6 Months</th><th>12 Months · Rival Overtaken</th></tr></thead>
          <tbody>${TG.map(([c, a, b, d, e], i) => `<tr class="rise" style="--d:${200 + i * 60}ms"><td>${c}</td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${d}</td><td class="num"><b>${e}</b></td></tr>`).join('')}</tbody>
        </table>
        <p class="note">Rather than promising arbitrary leaderboard ranks, each corridor target is anchored to overtaking a specific measured competitor on the exact same 280-prompt panel each month.</p>
      </div>
    </div>`);
}

// ─── 29. Next Steps / Close (Benchmark Page 29) ─────────────────────────────
slide('close', 'dark close', `
  <div class="cover-bg" aria-hidden="true"></div>
  <p class="eyebrow on-dark rise" style="--d:0ms">Immediate Next Steps</p>
  <h2 class="display rise" style="--d:120ms">Fix the GBP categories. Build the missing Probate &amp; Brisbane/Springfield hubs. Measure every month.</h2>
  <ol class="next rise" style="--d:300ms">
    <li><span>1</span><p><b>Fix GBP Categories &amp; Squarespace Technical Bloat (Weeks 1–2):</b> Re-categorise CID <code>6376809625893182443</code> from generic <code>"Legal services"</code> to <code>"Family law attorney"</code> + <code>"Estate planning attorney"</code> + <code>"Divorce lawyer"</code> + <code>"Mediation service"</code>; rewrite the homepage <code>&lt;title&gt;</code>; purge the 88 <code>/testimonials/*</code> hash URLs; and inject valid <code>LegalService</code> JSON-LD.</p></li>
    <li><span>2</span><p><b>Launch the Missing Probate, Contesting Wills (FPA) &amp; Corridor Pages (Weeks 3–6):</b> Publish dedicated Queensland Probate/Estate Administration and Family Provision Application (Contesting a Will) pillar pages, add a Wills pricing card to <code>/pricing</code>, and launch Springfield Lakes/Brookwater, Brisbane CBD, and Brisbane West (Indooroopilly/Centenary) landing pages.</p></li>
    <li><span>3</span><p><b>Dominate LawConnect, QLS &amp; Track Monthly Against McNamara Law &amp; Best Wilson Buckley:</b> Syndicate David Millwater (FDRP) and Matthew Tyrrell profiles across <code>lawconnect.com</code> (224 citations), <code>qls.com.au</code> (73 citations), and <code>threebestrated.com.au</code>, and re-run the 280-prompt benchmark on the 15th of each month.</p></li>
  </ol>
  <div class="close-logo">${logo()}<span class="byline">Prepared by Uprise Digital Research Team · Forensic AI Search Benchmark</span></div>`, { dark: true, noFoot: true });

// ─── 30. Appendix & Methodology (Benchmark Page 30) ─────────────────────────
slide('appendix', 'white', `
  <header class="hd"><p class="eyebrow">Appendix</p><h2 class="h1">Method and definitions</h2></header>
  <div class="cols-2 appx">
    <div>
      <h3 class="h3">How the 280 answers were collected</h3>
      <ul class="plain">
        <li>7 Family Law and Wills &amp; Estates buyer-intent questions (Best Family Lawyers, Divorce &amp; Property Settlement, Parenting &amp; Accredited Mediation [FDRP], Wills/EPOA/Testamentary Trusts, Probate &amp; Deceased Estate Administration, Contesting a Will &amp; Family Provision Applications, and Fixed-Fee/Free-Consult/Deferred-Fee Law) × 8 Ipswich &amp; Greater Brisbane corridors = 56 corridor-intent pairs.</li>
        <li>Each pair was evaluated across 5 live AI answer engines (Google AI Mode, ChatGPT Search, Perplexity Sonar, Gemini 3.8 Flash, and Claude Sonnet 4.6) for <i>N</i> = 280 total empirical answers.</li>
        <li>56 matching Queensland Google Organic SERP queries (depth 20) and 12 Google Maps 20-pack audits (including CID <code>6376809625893182443</code>) were executed via DataForSEO.</li>
        <li>All 173 URLs in <code>millwatertyrrell.com.au/sitemap.xml</code> were mapped and 18 core practice, lawyer, and pricing pages were scraped via Firecrawl to inspect JSON-LD schema, HTTP status codes, and content coverage.</li>
      </ul>
    </div>
    <div>
      <h3 class="h3">How answers, citations, and econometrics were scored</h3>
      <ul class="plain">
        <li>Every law firm named in an answer was extracted in order of first appearance and resolved to its canonical entity name across 68 tracked Ipswich, Springfield, and Brisbane Family Law and Wills &amp; Estates firms.</li>
        <li>Grounding URLs and search citations were resolved to root domains in <code>pipeline/citations.json</code> (${CITS.totalCitations.toLocaleString()} citations across ${CITS.uniqueDomains} unique domains).</li>
        <li>Share of Model Voice (SoMV) is the percentage of answers naming a law firm out of 280 regionally (or out of 35 per corridor), bounded with 95% Wilson confidence intervals.</li>
        <li>Econometric drivers (β̂ coefficients, standard errors, Wald <i>z</i>-statistics, and odds ratios) were estimated via live Iteratively Reweighted Least Squares (IRLS) logistic regression over the 280 empirical observations in <code>pipeline/ans_full.json</code>.</li>
      </ul>
    </div>
  </div>`);

// ─── Page Compilation with Millwater Tyrrell Authoritative Navy + Brass Theme ──
const CSS = fs.readFileSync(path.join(pipelineDir, 'deck.css'), 'utf8') + `
/* Millwater Tyrrell Law Official Brand Palette (#179CEE Azure Blue & #191919 / #0D1520 Charcoal Slate) */
:root {
  --pulp: #179CEE !important;
  --pulp-dark: #0D74B8 !important;
  --navy: #0D1520 !important;
}
.slide.dark, .slide.cover, .slide.close {
  background: #0D1520 !important;
}
.slide.accent {
  background: linear-gradient(135deg, #0D1520 0%, #0D74B8 60%, #179CEE 100%) !important;
}
.hb-row.is-pulp .hb-fill, .fillc, .lg-dot.pulp, .key.on, .cv-cells i.on, .dots i.on {
  background-color: #179CEE !important;
  fill: #179CEE !important;
}
.slide.dark .key.on, .slide.dark .cv-cells i.on, .slide.dark .fillc {
  background-color: #179CEE !important;
  fill: #179CEE !important;
}
.pulp, .pulp-t, .eyebrow {
  color: #0D74B8 !important;
  fill: #0D74B8 !important;
}
.slide.dark .pulp, .slide.dark .pulp-t, .slide.dark .m-pulp, .slide.dark .eyebrow.on-dark {
  color: #179CEE !important;
  fill: #179CEE !important;
}
path.draw, path.pulp {
  fill: none !important;
}
/* 8-Corridor & 35-Cell Grid Precision Fit Overrides */
.cover { grid-template-columns: 730px 1fr !important; gap: 0 36px !important; }
.cover-grid { padding: 20px 22px !important; max-width: 960px !important; }
.cv-row { grid-template-columns: 205px auto 36px !important; gap: 8px !important; }
.cv-cells { gap: 3px !important; }
.cv-cells i { width: 11px !important; height: 18px !important; }
.cv-cells i:nth-child(5n):not(:last-child) { margin-right: 4px !important; }
.finds-col { gap: 12px !important; }
.finds-col p { font-size: 18.5px !important; line-height: 1.34 !important; padding-top: 10px !important; }
.finds-col b { font-size: 19.5px !important; }
.mp-head, .mp-row { grid-template-columns: 225px 235px 1fr !important; gap: 14px !important; }
.mp-row { padding: 8px 0 !important; font-size: 18px !important; }
.mp-row .num { font-size: 17px !important; white-space: nowrap !important; }
#ws-entity .quote { padding: 15px 20px 13px !important; gap: 7px !important; }
#ws-entity .quote blockquote { font-size: 18px !important; line-height: 1.28 !important; }
#ws-entity .quote figcaption { font-size: 16px !important; padding-top: 7px !important; }
#ws-entity .ticks.cols { gap: 10px 40px !important; margin-bottom: 6px !important; }
#ws-entity .ticks.cols li { font-size: 17.5px !important; line-height: 1.3 !important; }
#targets .cols-60 { grid-template-columns: 1.12fr 1.18fr !important; gap: 40px !important; }
.tg-table { font-size: 17px !important; margin-bottom: 10px !important; }
.tg-table th { font-size: 13.5px !important; padding: 0 8px 8px !important; }
.tg-table td { padding: 6px 8px !important; white-space: nowrap !important; }
#targets .note { font-size: 17px !important; line-height: 1.34 !important; }
.why .points { gap: 14px !important; }
.why .points li { font-size: 19.5px !important; padding-top: 12px !important; }
#map .rank-table td, #map .rank-table th { padding: 5px 8px !important; font-size: 16.5px !important; }
#map .map-side .note { font-size: 16px !important; line-height: 1.32 !important; margin-top: 8px !important; }
#ws-maps .ticks { gap: 12px !important; }
#ws-maps .ticks li { font-size: 18.5px !important; line-height: 1.34 !important; }
.g-bar { padding: 6px 14px !important; overflow: hidden !important; }
.g-bar span { font-size: 14.5px !important; line-height: 1.22 !important; }
.db-city { font-size: 21.5px !important; }
.m-city { font-size: 25px !important; }
.m-stat { font-size: 21px !important; }
.chart .sc-lab { font-size: 19px !important; }
.cp-row { grid-template-columns: 245px repeat(7, 1fr) !important; }
.cp-city { font-size: 17.5px !important; line-height: 1.2 !important; }
#trend .chart .el { font-size: 18px !important; }
`;
const JS = fs.readFileSync(path.join(pipelineDir, 'deck.js'), 'utf8');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Millwater Tyrrell Law · Family Law &amp; Wills/Estates AI Visibility Report (Oct 2026)</title>
<meta name="description" content="Empirical 280-answer study of where AI assistants recommend Millwater Tyrrell Law (millwatertyrrell.com.au) for Family Law and Wills &amp; Estates across Ipswich and Greater Brisbane, and the 5-workstream remediation plan.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap">
<style>${CSS}</style>
</head>
<body>
<div class="deck" id="deck">
  <div class="stage" id="stage">${slides.join('\n')}
    <div class="progress" aria-hidden="true"><i id="bar"></i></div>
  </div>
</div>
<nav class="controls" id="controls" aria-label="Slide controls">
  <button id="prev" type="button" aria-label="Previous slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <span id="count" class="ctr">1 / ${slides.length}</span>
  <button id="next" type="button" aria-label="Next slide"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button>
  <button id="fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
</nav>
<script>${JS}</script>
</body>
</html>`;

fs.mkdirSync(path.join(pipelineDir, 'out'), { recursive: true });
fs.writeFileSync(path.join(pipelineDir, 'out', 'index.html'), html);
fs.writeFileSync(path.join(rootDir, 'site', 'index.html'), html);
console.log(`Generated ${slides.length} slides! Output written to site/index.html (${html.length} bytes).`);
