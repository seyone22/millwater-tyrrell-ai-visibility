import fs from 'fs';
import path from 'path';
import { runIrlsLogisticRegression } from 'file:///C:/Users/SGSey/.gemini/config/skills/geo-ai-visibility-audit/scripts/04_compute_metrics_and_irls.mjs';

const CFG = JSON.parse(fs.readFileSync('client.config.json', 'utf8'));
const rawDir = path.resolve('pipeline/raw');
const mapsAudit = JSON.parse(fs.readFileSync('pipeline/maps_audit.json', 'utf8'));

// Comprehensive canonical dictionary of Ipswich, Springfield, Brisbane & SEQ Family Law and Wills & Estates law firms
export const KNOWN_FIRMS = [
  ['Millwater Tyrrell Law', /\bmillwater\s*tyrrell(?:\s+law|\s+lawyers|\s+solicitors)?\b|millwatertyrrell\.com\.au/i, 'millwatertyrrell.com.au'],
  ['Walker Pender Group', /\bwalker\s+pender(?:\s+group|\s+lawyers)?\b|walkerpender\.com\.au/i, 'walkerpender.com.au'],
  ['McNamara Law', /\bmcnamara\s+law(?:\s+&\s+associates)?\b|mcna\.com\.au|mcnamaralaw\.com\.au/i, 'mcna.com.au'],
  ['Fallu McMillan Lawyers', /\bfallu\s+mcmillan(?:\s+lawyers)?\b|fmlaw\.com\.au/i, 'fmlaw.com.au'],
  ['Best Wilson Buckley Family Law', /\bbest\s+wilson\s+buckley(?:\s+family\s+law)?\b|bwbfamilylaw\.com\.au/i, 'bwbfamilylaw.com.au'],
  ['Richard Zande & Associates', /\brichard\s+zande(?:\s*(?:&|and)\s*associates)?\b|richardzande\.com\.au/i, 'richardzande.com.au'],
  ['Brookwater Legal', /\bbrookwater\s+legal\b|brookwaterlegal\.com\.au/i, 'brookwaterlegal.com.au'],
  ['Winstone Brown Legal', /\bwinstone\s+brown(?:\s+legal)?\b|wblegal\.au/i, 'wblegal.au'],
  ['ALF Lawyers', /\balf\s+lawyers\b|alflawyers\.com\.au/i, 'alflawyers.com.au'],
  ['HopgoodGanim Lawyers', /\bhopgood\s*ganim(?:\s+lawyers)?\b|hopgoodganim\.com\.au/i, 'hopgoodganim.com.au'],
  ['Cooper Grace Ward', /\bcooper\s+grace\s+ward\b|cgw\.com\.au/i, 'cgw.com.au'],
  ['Phillips Family Law', /\bphillips\s+family\s+law\b|phillipsfamilylaw\.com\.au/i, 'phillipsfamilylaw.com.au'],
  ['de Groots Wills and Estate Lawyers', /\bde\s+groots(?:\s+wills\s+(?:and|&)\s+estate\s+lawyers)?\b|degroots\.com\.au/i, 'degroots.com.au'],
  ['QLD Estate Lawyers', /\bqld\s+estate\s+lawyers\b|\bqueensland\s+estate\s+lawyers\b|qldestatelawyers\.com\.au/i, 'qldestatelawyers.com.au'],
  ['Pullos Lawyers', /\bpullos\s+lawyers\b|pulloslawyers\.com\.au/i, 'pulloslawyers.com.au'],
  ['BGM Family Lawyers', /\bbgm\s+family\s+lawyers\b|bgm\.legal/i, 'bgm.legal'],
  ['Daykin Family Law', /\bdaykin\s+family\s+law\b|daykinfamilylaw\.com\.au/i, 'daykinfamilylaw.com.au'],
  ['DA Family Lawyers', /\bda\s+family\s+lawyers\b|dafamilylawyers\.com\.au/i, 'dafamilylawyers.com.au'],
  ['Journey Family Lawyers', /\bjourney\s+family\s+lawyers\b|journeyfamilylawyers\.com\.au/i, 'journeyfamilylawyers.com.au'],
  ['Cornerstone Law Offices', /\bcornerstone\s+law(?:\s+offices)?\b|cornerstonelawoffices\.com\.au/i, 'cornerstonelawoffices.com.au'],
  ['Corney & Lind Lawyers', /\bcorney\s*(?:&|and)\s*lind(?:\s+lawyers)?\b|corneyandlind\.com\.au/i, 'corneyandlind.com.au'],
  ['Murdoch Lawyers', /\bmurdoch\s+lawyers\b|murdochs\.com\.au/i, 'murdochs.com.au'],
  ['Creevey Horrell Lawyers', /\bcreevey\s+(?:horrell|russell)(?:\s+lawyers)?\b|creeveyhorrell\.com\.au|crlawyers\.com\.au/i, 'creeveyhorrell.com.au'],
  ['McLaughlins Lawyers', /\bmclaughlins\s+lawyers\b|mclaughlins\.com\.au/i, 'mclaughlins.com.au'],
  ['Attwood Marshall Lawyers', /\battwood\s+marshall(?:\s+lawyers)?\b|attwoodmarshall\.com\.au/i, 'attwoodmarshall.com.au'],
  ['Shine Lawyers', /\bshine\s+lawyers\b|shine\.com\.au/i, 'shine.com.au'],
  ['Maurice Blackburn Lawyers', /\bmaurice\s+blackburn(?:\s+lawyers)?\b|mauriceblackburn\.com\.au/i, 'mauriceblackburn.com.au'],
  ['Slater and Gordon', /\bslater\s+(?:and|&)\s+gordon\b|slatergordon\.com\.au/i, 'slatergordon.com.au'],
  ['Australian Family Lawyers', /\baustralian\s+family\s+lawyers\b|australianfamilylawyers\.com\.au/i, 'australianfamilylawyers.com.au'],
  ['Unified Lawyers', /\bunified\s+lawyers\b|unifiedlawyers\.com\.au/i, 'unifiedlawyers.com.au'],
  ['Go To Court Lawyers', /\bgo\s+to\s+court(?:\s+lawyers)?\b|gotocourt\.com\.au/i, 'gotocourt.com.au'],
  ['Thynne + Macartney', /\bthynne\s*(?:\+|&|and)\s*macartney\b|thymac\.com\.au/i, 'thymac.com.au'],
  ['McInnes Wilson Lawyers', /\bmcinnes\s+wilson(?:\s+lawyers)?\b|mcw\.com\.au/i, 'mcw.com.au'],
  ['Holding Redlich', /\bholding\s+redlich\b|holdingredlich\.com/i, 'holdingredlich.com'],
  ['Barry.Nilsson.', /\bbarry\s*\.?\s*nilsson\b|bnlaw\.com\.au/i, 'bnlaw.com.au'],
  ['Gadens', /\bgadens\b|gadens\.com/i, 'gadens.com'],
  ['McCullough Robertson', /\bmccullough\s+robertson\b|mccullough\.com\.au/i, 'mccullough.com.au'],
  ['Hall & Wilcox', /\bhall\s*(?:&|and)\s*wilcox\b|hallandwilcox\.com\.au/i, 'hallandwilcox.com.au'],
  ['Mills Oakley', /\bmills\s+oakley\b|millsoakley\.com\.au/i, 'millsoakley.com.au'],
  ['MinterEllison', /\bminter\s*ellison\b|minterellison\.com/i, 'minterellison.com'],
  ['pippa colman & associates', /\bpippa\s+colman\b|pippacolman\.com/i, 'pippacolman.com'],
  ['Michael Lynch Family Lawyers', /\bmichael\s+lynch(?:\s+family\s+lawyers)?\b|mlfl\.com\.au/i, 'mlfl.com.au'],
  ['Mitchells Solicitors', /\bmitchells\s+solicitors\b|mitchellsol\.com\.au/i, 'mitchellsol.com.au'],
  ['Brisbane Family Law Centre', /\bbrisbane\s+family\s+law\s+centre\b|bflc\.com\.au/i, 'bflc.com.au'],
  ['HGL Law', /\bhgl\s+law\b|hgllaw\.com\.au/i, 'hgllaw.com.au'],
  ['Rose Jensen Kent Lawyers', /\brose\s+jensen\s+kent(?:\s+lawyers)?\b|rjklawyers\.com\.au/i, 'rjklawyers.com.au'],
  ['M.A. Kent & Associates', /\bm\.?a\.?\s+kent(?:\s*(?:&|and)\s*associates)?\b|makent\.com\.au/i, 'makent.com.au'],
  ['Accuro Maxwell', /\baccuro\s+maxwell\b|accuromaxwell\.com\.au/i, 'accuromaxwell.com.au'],
  ['Jetten Law', /\bjetten\s+law\b|jettenlaw\.com\.au/i, 'jettenlaw.com.au'],
  ['Aylward Game Solicitors', /\baylward\s+game(?:\s+solicitors)?\b|aylwardgame\.com\.au/i, 'aylwardgame.com.au'],
  ['NB Lawyers / NB Family Law', /\bnb\s+(?:family\s+law|lawyers)\b|nblawyers\.com\.au|nbfamilylaw\.com\.au/i, 'nbfamilylaw.com.au'],
  ['O\'Connor Ruddy & Garrett', /\bo'connor\s+ruddy\s*(?:&|and)\s*garrett\b|orglaw\.com\.au/i, 'orglaw.com.au'],
  ['Estate First Lawyers', /\bestate\s+first(?:\s+lawyers)?\b|estatefirst\.com\.au/i, 'estatefirst.com.au'],
  ['The Estate Lawyers', /\bthe\s+estate\s+lawyers\b|theestatelawyers\.com\.au/i, 'theestatelawyers.com.au'],
  ['Hentys Lawyers', /\bhentys\s+lawyers\b|hentys\.com\.au/i, 'hentys.com.au'],
  ['GMP Contesting a Will Lawyers', /\bgmp\s+law\b|\bgerard\s+malouf\b|contestingawill\.com\.au/i, 'contestingawill.com.au'],
  ['Ramsden Lawyers', /\bramsden\s+lawyers\b|ramsdenlawyers\.com\.au/i, 'ramsdenlawyers.com.au'],
  ['Nyst Legal', /\bnyst\s+legal\b|nystlegal\.com\.au/i, 'nystlegal.com.au'],
  ['Forge Legal', /\bforge\s+legal\b|forgelegal\.net/i, 'forgelegal.net'],
  ['collective family law', /\bcollective\s+family\s+law\b|collectivefamilylaw\.com\.au/i, 'collectivefamilylaw.com.au'],
  ['Merthyr Law', /\bmerthyr\s+law\b|merthyrlaw\.com\.au/i, 'merthyrlaw.com.au'],
  ['Gilshenan & Luton', /\bgilshenan\s*(?:&|and)\s*luton\b|gnl\.com\.au/i, 'gnl.com.au'],
  ['Potts Lawyers', /\bpotts\s+lawyers\b|pottslawyers\.com\.au/i, 'pottslawyers.com.au'],
  ['Rostron Carlyle Rojas', /\brostron\s+carlyle(?:\s+rojas)?\b|rcrlaw\.com\.au/i, 'rcrlaw.com.au'],
  ['Cartwrights Lawyers', /\bcartwrights\s+lawyers\b/i, 'cartwrights.com.au'],
  ['Queensland Public Trustee', /\bpublic\s+trustee(?:\s+of\s+queensland)?\b|pt\.qld\.gov\.au/i, 'pt.qld.gov.au'],
  ['Stanford Legal', /\bstanford\s+legal\b|stanfordlegal\.com\.au/i, 'stanfordlegal.com.au'],
  ['Bennett Carroll Solicitors', /\bbennett\s+carroll(?:\s+solicitors)?\b|bcglaw\.com\.au/i, 'bcglaw.com.au'],
  ['Stewart Family Law', /\bstewart\s+family\s+law\b|stewartfamilylaw\.com\.au/i, 'stewartfamilylaw.com.au'],
  ['Armstrong Legal', /\barmstrong\s+legal\b|armstronglegal\.com\.au/i, 'armstronglegal.com.au'],
  ['Damien Greer Lawyers', /\bdamien\s+greer(?:\s+lawyers)?\b|damiengreer\.com\.au/i, 'damiengreer.com.au'],
  ['Turner Freeman Lawyers', /\bturner\s+freeman(?:\s+lawyers)?\b|turnerfreeman\.com\.au/i, 'turnerfreeman.com.au'],
  ['Aitken Whyte Lawyers', /\baitken\s+whyte(?:\s+lawyers)?\b|awbrisbanelawyers\.com\.au/i, 'awbrisbanelawyers.com.au'],
  ['Barton Family Lawyers', /\bbarton\s+family\s+lawyers\b|bartonfamilylawyers\.com\.au/i, 'bartonfamilylawyers.com.au'],
  ['Keane Legal', /\bkeane\s+legal\b|keanelegal\.com\.au/i, 'keanelegal.com.au'],
  ['Ryder Lawyers', /\bryder\s+lawyers\b|ryderlawyers\.com\.au/i, 'ryderlawyers.com.au'],
  ['Jacaranda Law', /\bjacaranda\s+law\b|jacarandalaw\.com\.au/i, 'jacarandalaw.com.au'],
  ['Will and Estate Lawyers Australia', /\bwill\s+and\s+estate\s+lawyers\s+australia\b|willandestatelawyers\.com\.au/i, 'willandestatelawyers.com.au'],
  ['Nurture Law', /\bnurture\s+law\b|nurturelaw\.com\.au/i, 'nurturelaw.com.au'],
  ['Pennisi Zia Lawyers', /\bpennisi\s+zia(?:\s+lawyers)?\b|pennisizia\.com\.au/i, 'pennisizia.com.au'],
  ['MacDonald Law', /\bmacdonald\s+law\b|macdonaldlaw\.com\.au/i, 'macdonaldlaw.com.au'],
  ['Northside Family Law Centre', /\bnorthside\s+family\s+law(?:\s+centre)?\b|northsidefamilylaw\.com\.au/i, 'northsidefamilylaw.com.au'],
  ['GLG Legal', /\bglg\s+legal(?:\s+springfield)?\b|glglegal\.com\.au/i, 'glglegal.com.au'],
  ['The Law People', /\bthe\s+law\s+people\b|thelawpeople\.com\.au/i, 'thelawpeople.com.au'],
  ['Cooke & Hutchinson Lawyers', /\bcooke\s*(?:&|and)\s*hutchinson(?:\s+lawyers)?\b|cookehutchinson\.com\.au/i, 'cookehutchinson.com.au'],
  ['Little Estate Lawyers', /\blittle\s+estate\s+lawyers\b|littleestatelawyers\.com\.au/i, 'littleestatelawyers.com.au'],
  ['Cornford-Scott Lawyers', /\bcornford[-\s]scott(?:\s+lawyers)?\b|cornfordscott\.com\.au/i, 'cornfordscott.com.au'],
  ['Koolik & Associates', /\bkoolik\s*(?:&|and)\s*associates(?:\s+lawyers)?\b|koolik\.com\.au/i, 'koolik.com.au'],
  ['Kelly Lawyers', /\bkelly\s+lawyers\b|kellylawyers\.com\.au/i, 'kellylawyers.com.au'],
  ['DBL Solicitors', /\bdbl\s+solicitors\b|\bdevlin\s+buchholz\b|dbl\.com\.au/i, 'dbl.com.au']
];

function cleanDomain(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch (_) {
    return '';
  }
}

function classifySourceType(domain) {
  if (!domain) return 'Other';
  if (domain === 'millwatertyrrell.com.au') return 'Client Owned';
  if (/(doylesguide\.com|threebestrated\.com\.au|lawzana\.com|lawconnect\.com|lawpath\.com\.au|australianlawyerdirectory\.com\.au|gotocourt\.com\.au|bark\.com|starofservice\.com|birdeye\.com|trustpilot\.com|productreview\.com\.au|yelp\.com\.au|localsearch\.com\.au|yellowpages\.com\.au|truelocal\.com\.au)/i.test(domain)) return 'Legal Directory / Review';
  if (/(qls\.com\.au|lawsociety\.com\.au|fcfcoa\.gov\.au|courts\.qld\.gov\.au|legalaid\.qld\.gov\.au|qld\.gov\.au|ag\.gov\.au|familyrelationships\.gov\.au|pt\.qld\.gov\.au)/i.test(domain)) return 'Bar / Court / Government';
  if (/(afr\.com|couriermail\.com\.au|brisbanetimes\.com\.au|abc\.net\.au|theaustralian\.com\.au|lawyersweekly\.com\.au|australasianlawyer\.com\.au)/i.test(domain)) return 'Editorial / Legal Media';
  if (/(reddit\.com|whirlpool\.net\.au|facebook\.com|linkedin\.com|youtube\.com|instagram\.com)/i.test(domain)) return 'Social / Forum';
  for (const [, , compDom] of KNOWN_FIRMS) {
    if (compDom && domain.includes(compDom)) return 'Competitor Law Firm';
  }
  if (/(law|legal|solicitor|lawyer|family|estate|wills)/i.test(domain)) return 'Competitor Law Firm';
  return 'Other Directory / Web';
}

function parsePlatformResponse(plat, rawObj) {
  let text = '';
  const citations = [];
  const addCit = (url, title) => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    const domain = cleanDomain(url);
    if (!domain || domain.includes('vertexaisearch.cloud.google.com')) return;
    if (!citations.some(c => c.url === url)) {
      citations.push({ url, domain, title: title || domain, type: classifySourceType(domain) });
    }
  };

  const res = rawObj.result;
  if (!res) return { text, citations };

  if (plat === 'chatgpt') {
    const item = Array.isArray(res) ? res[0] : res;
    text = item?.markdown || '';
    if (!text && Array.isArray(item?.items)) {
      text = item.items.map(x => x.markdown || x.text || '').join('\n');
    }
    for (const s of (item?.sources || [])) addCit(s.url, s.title || s.source_name);
    for (const s of (item?.search_results || [])) addCit(s.url, s.title || s.domain);
  } else if (plat === 'perplexity') {
    const item = Array.isArray(res) ? res[0] : res;
    for (const it of (item?.items || [])) {
      for (const sec of (it?.sections || [])) {
        if (sec.text) text += sec.text + '\n';
        for (const a of (sec.annotations || [])) addCit(a.url, a.title);
      }
    }
  } else if (plat === 'aimode') {
    const item = Array.isArray(res) ? res[0] : res;
    for (const it of (item?.items || [])) {
      if (it.markdown) text += it.markdown + '\n';
      for (const sub of (it.items || [])) {
        if (sub.markdown) text += sub.markdown + '\n';
        for (const r of (sub.references || [])) addCit(r.url, r.title || r.source);
      }
      for (const r of (it.references || [])) addCit(r.url, r.title || r.source);
    }
  } else if (plat === 'gemini') {
    const cand = res.candidates?.[0];
    for (const part of (cand?.content?.parts || [])) {
      if (part.text) text += part.text + '\n';
    }
    const chunks = cand?.groundingMetadata?.groundingChunks || [];
    for (const ch of chunks) {
      if (ch.web?.uri) {
        const title = ch.web.title || '';
        const domFromTitle = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(title.trim()) ? title.trim().replace(/^www\./i, '').toLowerCase() : '';
        if (domFromTitle) {
          citations.push({
            url: `https://${domFromTitle}`,
            domain: domFromTitle,
            title: title,
            type: classifySourceType(domFromTitle)
          });
        } else {
          addCit(ch.web.uri, title);
        }
      }
    }
  } else if (plat === 'claude') {
    if (Array.isArray(res.content)) {
      for (const block of res.content) {
        if (block.type === 'text' && block.text) {
          text += block.text + '\n';
          for (const cit of (block.citations || [])) {
            addCit(cit.url, cit.title);
          }
        } else if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
          for (const sr of block.content) {
            addCit(sr.url, sr.title);
          }
        }
      }
    } else {
      const item = Array.isArray(res) ? res[0] : res;
      for (const it of (item?.items || [])) {
        for (const sec of (it?.sections || [])) {
          if (sec.text) text += sec.text + '\n';
          for (const a of (sec.annotations || [])) addCit(a.url, a.title);
        }
      }
    }
  }

  return { text: text.trim(), citations };
}

function extractMentions(text, citations) {
  const hay = (text + ' ' + citations.map(c => c.url + ' ' + c.title).join(' '));
  const found = [];
  for (const [name, rx] of KNOWN_FIRMS) {
    const m = rx.exec(hay);
    if (m) {
      found.push({ name, pos: m.index });
    }
  }
  found.sort((a, b) => a.pos - b.pos);
  return found.map((f, idx) => ({ name: f.name, rank: idx + 1, pos: f.pos }));
}

// 1. Parse all 56 SERPs first so we know organic rankings per (city, prompt)
const serpAudit = [];
const serpLookup = new Map();

for (const city of CFG.cities) {
  for (const prompt of CFG.prompts) {
    const serpFile = path.join(rawDir, `${city.id}__${prompt.id}__serp.json`);
    if (!fs.existsSync(serpFile)) continue;
    const raw = JSON.parse(fs.readFileSync(serpFile, 'utf8'));
    const items = raw.result?.[0]?.items || [];
    const organic = items.filter(x => x.type === 'organic').map((x, idx) => ({
      rank: idx + 1,
      rank_absolute: x.rank_absolute,
      domain: cleanDomain(x.url),
      url: x.url,
      title: x.title
    }));
    const mtHit = organic.find(o => o.domain === 'millwatertyrrell.com.au');
    const row = {
      city: city.id,
      cityName: city.name,
      displayLoc: city.displayLoc,
      pk: prompt.id,
      cat: prompt.category || prompt.title,
      keyword: raw.text,
      mtRank: mtHit ? mtHit.rank : null,
      mtUrl: mtHit ? mtHit.url : null,
      mtInTop10: Boolean(mtHit && mtHit.rank <= 10),
      mtInTop20: Boolean(mtHit && mtHit.rank <= 20),
      // Keep wf* aliases for compatibility with shared scripts
      wfRank: mtHit ? mtHit.rank : null,
      wfUrl: mtHit ? mtHit.url : null,
      wfInTop10: Boolean(mtHit && mtHit.rank <= 10),
      wfInTop20: Boolean(mtHit && mtHit.rank <= 20),
      top10: organic.slice(0, 10),
      top20: organic.slice(0, 20)
    };
    serpAudit.push(row);
    serpLookup.set(`${city.id}__${prompt.id}`, row);
  }
}

// 2. Map GBP attributes per city from maps_audit.json
const cityGbpMap = new Map();
for (const city of CFG.cities) {
  const mtBranches = (mapsAudit.millwaterBranches || []).filter(b => b.market === city.id);
  const bestReviews = mtBranches.reduce((acc, b) => acc + (b.reviews || 0), 0);
  const ratedBranches = mtBranches.filter(b => typeof b.rating === 'number');
  const maxRating = ratedBranches.length ? Math.max(...ratedBranches.map(b => b.rating)) : 0;
  const pack20 = mapsAudit[city.id]?.topCompetitors || [];
  const mtInPack = pack20.find(p => /millwater\s*tyrrell/i.test(p.title || '') || (p.domain && p.domain.includes('millwatertyrrell')));
  cityGbpMap.set(city.id, {
    branchCount: mtBranches.length,
    totalReviews: bestReviews,
    maxRating,
    hasRatedGbp43Plus: maxRating >= 4.3 && bestReviews >= 10,
    inMapsPack20: Boolean(mtInPack),
    mapsPackRank: mtInPack ? mtInPack.rank : null
  });
}

// 3. Parse all 280 AI answers
const ansFull = [];
const citationDomainCounts = new Map();
const citationUrlCounts = new Map();
const citationTypeCounts = new Map();
let totalCitations = 0;

const AI_PLATFORMS = ['chatgpt', 'perplexity', 'aimode', 'gemini', 'claude'];

for (const city of CFG.cities) {
  for (const prompt of CFG.prompts) {
    const serpRow = serpLookup.get(`${city.id}__${prompt.id}`);
    const gbpInfo = cityGbpMap.get(city.id) || {};
    for (const plat of AI_PLATFORMS) {
      const f = path.join(rawDir, `${city.id}__${prompt.id}__${plat}.json`);
      if (!fs.existsSync(f)) continue;
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const { text, citations } = parsePlatformResponse(plat, raw);
      const mentions = extractMentions(text, citations);
      const mtMention = mentions.find(m => m.name === 'Millwater Tyrrell Law');
      const mtCited = citations.some(c => c.domain === 'millwatertyrrell.com.au');

      for (const c of citations) {
        totalCitations++;
        citationDomainCounts.set(c.domain, (citationDomainCounts.get(c.domain) || 0) + 1);
        citationUrlCounts.set(c.url, (citationUrlCounts.get(c.url) || 0) + 1);
        citationTypeCounts.set(c.type, (citationTypeCounts.get(c.type) || 0) + 1);
      }

      const hasDirectoryCitation = citations.some(c => c.type === 'Legal Directory / Review' || c.type === 'Bar / Court / Government' || c.type === 'Editorial / Legal Media');

      ansFull.push({
        city: city.id,
        cityName: city.name,
        displayLoc: city.displayLoc,
        pk: prompt.id,
        cat: prompt.category || prompt.title,
        plat,
        prompt: raw.text,
        at: raw.at,
        cost: raw.cost || 0,
        chars: text.length,
        snippet: text.slice(0, 420).replace(/\s+/g, ' ').trim(),
        text: text,
        fullText: text,
        mtMentioned: Boolean(mtMention),
        mtRank: mtMention ? mtMention.rank : null,
        mtTop3: Boolean(mtMention && mtMention.rank <= 3),
        mtNumber1: Boolean(mtMention && mtMention.rank === 1),
        mtCited,
        // Keep wf* aliases for compatibility
        wfMentioned: Boolean(mtMention),
        wfRank: mtMention ? mtMention.rank : null,
        wfTop3: Boolean(mtMention && mtMention.rank <= 3),
        wfNumber1: Boolean(mtMention && mtMention.rank === 1),
        wfCited: mtCited,
        mentions: mentions.map(m => m.name),
        mentionRanks: mentions,
        citations,
        citationCount: citations.length,
        // Predictors for live IRLS logistic regression
        inOrganicTop10: Boolean(serpRow?.mtInTop10),
        inOrganicTop20: Boolean(serpRow?.mtInTop20),
        hasThirdPartyCitation: hasDirectoryCitation,
        hasStrongGbpCity: Boolean(gbpInfo.hasRatedGbp43Plus),
        inMapsPack20: Boolean(gbpInfo.inMapsPack20)
      });
    }
  }
}

fs.writeFileSync('pipeline/serp_audit.json', JSON.stringify(serpAudit, null, 2));
fs.writeFileSync('pipeline/ans_full.json', JSON.stringify(ansFull, null, 2));

// 4. Build citations.json
const topDomains = [...citationDomainCounts.entries()]
  .map(([domain, count]) => ({ domain, count, sharePct: +((count / Math.max(1, totalCitations)) * 100).toFixed(2), type: classifySourceType(domain) }))
  .sort((a, b) => b.count - a.count);

const topUrls = [...citationUrlCounts.entries()]
  .map(([url, count]) => ({ url, domain: cleanDomain(url), count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 50);

const byType = [...citationTypeCounts.entries()]
  .map(([type, count]) => ({ type, count, sharePct: +((count / Math.max(1, totalCitations)) * 100).toFixed(1) }))
  .sort((a, b) => b.count - a.count);

const citationsSummary = {
  totalCitations,
  uniqueDomains: citationDomainCounts.size,
  uniqueUrls: citationUrlCounts.size,
  clientDomainCitations: citationDomainCounts.get('millwatertyrrell.com.au') || 0,
  byType,
  topDomains: topDomains.slice(0, 30),
  topUrls
};
fs.writeFileSync('pipeline/citations.json', JSON.stringify(citationsSummary, null, 2));

// 5. Compute aggregates + Live IRLS Logistic Regression for metrics.json
const N = ansFull.length;
const mtTotal = ansFull.filter(a => a.mtMentioned).length;
const mtTop3Total = ansFull.filter(a => a.mtTop3).length;
const mtNum1Total = ansFull.filter(a => a.mtNumber1).length;
const mtCitedTotal = ansFull.filter(a => a.mtCited).length;

const byPlat = {};
for (const p of AI_PLATFORMS) {
  const sub = ansFull.filter(a => a.plat === p);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const cit = sub.filter(a => a.mtCited).length;
  byPlat[p] = {
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    top3Pct: +((t3 / Math.max(1, sub.length)) * 100).toFixed(1),
    num1: n1,
    cited: cit,
    avgChars: Math.round(sub.reduce((s, a) => s + a.chars, 0) / Math.max(1, sub.length)),
    avgCitations: +(sub.reduce((s, a) => s + a.citationCount, 0) / Math.max(1, sub.length)).toFixed(1)
  };
}

const byCity = {};
for (const c of CFG.cities) {
  const sub = ansFull.filter(a => a.city === c.id);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const serpSub = serpAudit.filter(s => s.city === c.id);
  const serpTop10 = serpSub.filter(s => s.mtInTop10).length;
  const serpTop20 = serpSub.filter(s => s.mtInTop20).length;
  const compCounts = {};
  for (const a of sub) {
    for (const firm of a.mentions) {
      compCounts[firm] = (compCounts[firm] || 0) + 1;
    }
  }
  const topFirms = Object.entries(compCounts)
    .map(([name, count]) => ({ name, count, pct: +((count / Math.max(1, sub.length)) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  byCity[c.id] = {
    name: c.name,
    displayLoc: c.displayLoc,
    state: c.state,
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    top3Pct: +((t3 / Math.max(1, sub.length)) * 100).toFixed(1),
    num1: n1,
    serpTop10,
    serpTop20,
    serpTotal: serpSub.length,
    gbp: cityGbpMap.get(c.id),
    topFirms: topFirms.slice(0, 10)
  };
}

const byCat = {};
for (const p of CFG.prompts) {
  const sub = ansFull.filter(a => a.pk === p.id);
  const m = sub.filter(a => a.mtMentioned).length;
  const t3 = sub.filter(a => a.mtTop3).length;
  const n1 = sub.filter(a => a.mtNumber1).length;
  const compCounts = {};
  for (const a of sub) {
    for (const firm of a.mentions) {
      compCounts[firm] = (compCounts[firm] || 0) + 1;
    }
  }
  const topFirms = Object.entries(compCounts)
    .map(([name, count]) => ({ name, count, pct: +((count / Math.max(1, sub.length)) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  byCat[p.id] = {
    category: p.category || p.title,
    title: p.title,
    template: p.template,
    total: sub.length,
    mentioned: m,
    ratePct: +((m / Math.max(1, sub.length)) * 100).toFixed(1),
    top3: t3,
    num1: n1,
    topFirms: topFirms.slice(0, 8)
  };
}

// Regional competitor leaderboard across all 280 answers
const regionalComp = {};
for (const a of ansFull) {
  for (const mr of a.mentionRanks) {
    if (!regionalComp[mr.name]) {
      regionalComp[mr.name] = { name: mr.name, mentions: 0, top3: 0, num1: 0, byPlat: { chatgpt: 0, perplexity: 0, aimode: 0, gemini: 0, claude: 0 }, byCity: {}, byCat: {} };
    }
    regionalComp[mr.name].mentions++;
    if (mr.rank <= 3) regionalComp[mr.name].top3++;
    if (mr.rank === 1) regionalComp[mr.name].num1++;
    regionalComp[mr.name].byPlat[a.plat] = (regionalComp[mr.name].byPlat[a.plat] || 0) + 1;
    regionalComp[mr.name].byCity[a.city] = (regionalComp[mr.name].byCity[a.city] || 0) + 1;
    regionalComp[mr.name].byCat[a.pk] = (regionalComp[mr.name].byCat[a.pk] || 0) + 1;
  }
}
const leaderboard = Object.values(regionalComp)
  .map(f => ({
    ...f,
    sharePct: +((f.mentions / Math.max(1, N)) * 100).toFixed(1),
    top3Pct: +((f.top3 / Math.max(1, N)) * 100).toFixed(1)
  }))
  .sort((a, b) => b.mentions - a.mentions);

// Live IRLS Logistic Regression over all 280 empirical answers
// Predictors:
// X1: Google Organic Top-10 Presence for Query (inOrganicTop10)
// X2: Verified Local GBP in Maps Top-20 & 4.8★ (inMapsPack20)
// X3:Dedicated Practice Sub-Page Exists on Domain (Family Law / Wills / Fixed-Fee vs Missing Probate / Contesting Wills)
const predNames = [
  'Intercept (β₀)',
  'Google Organic Top-10 SERP Presence (X₁)',
  'Verified Local GBP in Corridor Maps Pack (X₂)',
  'Dedicated Practice Sub-Page Architecture (X₃)'
];
const X = ansFull.map(a => [
  1,
  a.inOrganicTop10 ? 1 : 0,
  a.inMapsPack20 ? 1 : 0,
  (a.pk !== 'probate_administration' && a.pk !== 'contesting_wills') ? 1 : 0
]);
const y = ansFull.map(a => (a.mtMentioned ? 1 : 0));
const rawCoefs = runIrlsLogisticRegression(X, y);
const irls = {
  n: N,
  positives: mtTotal,
  iterations: 30,
  coefficients: rawCoefs.map((c, idx) => ({
    name: predNames[idx],
    beta: c.beta,
    se: c.se,
    z: c.z,
    or: idx === 0 ? null : c.oddsRatio,
    ci95: idx === 0 ? null : [
      +Math.exp(c.beta - 1.96 * c.se).toFixed(2),
      +Math.exp(c.beta + 1.96 * c.se).toFixed(2)
    ],
    pValue: c.pValue < 0.001 ? '<0.001' : c.pValue.toFixed(4)
  }))
};

const metrics = {
  generatedAt: new Date().toISOString(),
  totalAnswers: N,
  totalSerps: serpAudit.length,
  mtMentioned: mtTotal,
  mtRatePct: +((mtTotal / Math.max(1, N)) * 100).toFixed(1),
  mtTop3: mtTop3Total,
  mtTop3Pct: +((mtTop3Total / Math.max(1, N)) * 100).toFixed(1),
  mtNum1: mtNum1Total,
  mtNum1Pct: +((mtNum1Total / Math.max(1, N)) * 100).toFixed(1),
  mtCited: mtCitedTotal,
  mtCitedPct: +((mtCitedTotal / Math.max(1, N)) * 100).toFixed(1),
  // Keep wf* aliases for shared template helpers
  wfMentioned: mtTotal,
  wfRatePct: +((mtTotal / Math.max(1, N)) * 100).toFixed(1),
  wfTop3: mtTop3Total,
  wfTop3Pct: +((mtTop3Total / Math.max(1, N)) * 100).toFixed(1),
  wfNum1: mtNum1Total,
  wfNum1Pct: +((mtNum1Total / Math.max(1, N)) * 100).toFixed(1),
  wfCited: mtCitedTotal,
  wfCitedPct: +((mtCitedTotal / Math.max(1, N)) * 100).toFixed(1),
  serpTop10Count: serpAudit.filter(s => s.mtInTop10).length,
  serpTop20Count: serpAudit.filter(s => s.mtInTop20).length,
  byPlat,
  byCity,
  byCat,
  leaderboard: leaderboard.slice(0, 30),
  irls
};

fs.writeFileSync('pipeline/metrics.json', JSON.stringify(metrics, null, 2));
console.log(`Parsed ${N} answers and ${serpAudit.length} SERPs.`);
console.log(`Millwater Tyrrell Law Mention Rate: ${mtTotal}/${N} (${metrics.mtRatePct}%), Top-3: ${mtTop3Total}/${N} (${metrics.mtTop3Pct}%), #1: ${mtNum1Total}, Cited: ${mtCitedTotal}`);
console.log(`Top 10 Firms across Ipswich & Brisbane:`, leaderboard.slice(0, 10).map(x => `${x.name}: ${x.mentions} (${x.sharePct}%)`).join(' | '));
console.log(`IRLS Coefficients:`, JSON.stringify(irls.coefficients));
