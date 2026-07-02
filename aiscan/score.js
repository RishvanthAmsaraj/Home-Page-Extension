/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — heuristic scorer
   ════════════════════════════════════════════════════════════════════

   WHAT THIS IS
   ────────────
   A client-side "smell test" for AI-flavored text. It runs entirely on
   the snippet, title, and URL of a search result — no fetch, no API,
   no model. Three independent signals are scored 0–100 (higher = more
   AI-like) and combined.

   WHAT THIS IS NOT
   ────────────────
   This is NOT a definitive detector. No client-side heuristic can
   reliably tell AI from human writing — formal human prose will get
   flagged, lightly-edited AI text will pass. We label every score
   "estimate" in the UI to make this honest.

   The model is intentionally calibrated to UNDER-FLAG. False positives
   (accusing a real journalist of being AI) are worse than false
   negatives (letting some AI through). The default band threshold
   sits at 65% — only results that trip multiple strong signals get
   marked "Likely AI."

   CALIBRATION
   ───────────
   Users can pick a threshold in the spike UI:
     low    = only obvious cases (default for the extension)
     med    = mixed cases flagged too
     high   = sensitive — flag almost anything that smells off
*/

(function (root) {
  "use strict";

  /* ──────────────────────────────────────────────────────────────────
     Lexicon — words/phrases that AI writing over-uses.
     Each item is paired with a weight: how much one occurrence
     contributes to the text-patterns score (capped at 100).
     Regexes are written loosely to catch verb-form variations
     (delve / delves / delving / delved).
     ────────────────────────────────────────────────────────────────── */
  const PHRASES = [
    // High-confidence AI tells (5–8 points each)
    { re: /\bin today'?s?\s+(digital|fast-paced|modern|ever-changing|ever-evolving|rapidly evolving)?\s*(landscape|world|era|age)\b/gi, w: 8, name: "in today's landscape/world/era" },
    { re: /\b(delve|delves|delved|delving)\b/gi, w: 5, name: "delve/delving" },
    { re: /\bnavigat(e|ing|es|ed)\s+the\s+(complexities|nuances|intricacies|challenges)\b/gi, w: 7, name: "navigate the complexities" },
    { re: /\bever-?evolving\s+(landscape|world|industry|field|challenges|market)\b/gi, w: 6, name: "ever-evolving landscape" },
    { re: /\bin conclusion,?\s+(it'?s|this|these|our|the|we)\b/gi, w: 5, name: "in conclusion, it/this/…" },
    { re: /\bin this (article|post|guide|piece|blog),?\s+we (will |shall )?(explore|discuss|delve|examine|uncover)\b/gi, w: 7, name: "in this article, we explore" },
    { re: /\bit'?s?\s+(important|essential|crucial|vital|imperative)\s+to\s+(note|remember|understand|recognize|acknowledge)\b/gi, w: 6, name: "it's important to note" },
    { re: /\bgame-?changer(s|ing)?\b/gi, w: 5, name: "game-changer" },
    { re: /\bunlock(ing|s|ed)?\s+(the |your )?(potential|power|true|full|secrets)\b/gi, w: 6, name: "unlock the potential" },
    { re: /\b(paradigm|game-changing|seismic)\s+shift\b/gi, w: 5, name: "paradigm shift" },
    { re: /\bseamlessly\s+(integrate|integrates|integrated|integrating|blend|blends)\b/gi, w: 6, name: "seamlessly integrate" },
    { re: /\bunparalleled\s+(efficiency|performance|results|quality|precision)\b/gi, w: 6, name: "unparalleled efficiency" },
    { re: /\bmultifaceted\s+(approach|solution|benefits|nature|challenge)\b/gi, w: 5, name: "multifaceted approach" },
    { re: /\bactionable\s+(insights|strategies|steps|takeaways|advice)\b/gi, w: 5, name: "actionable insights" },
    { re: /\bthoughtful\s+design\b/gi, w: 4, name: "thoughtful design" },
    { re: /\bcutting-?edge\s+(solution|technology|approach|tool|innovation)\b/gi, w: 5, name: "cutting-edge solution" },
    { re: /\bmyriad\s+of\s+(options|possibilities|factors|challenges|reasons)\b/gi, w: 5, name: "myriad of options" },
    { re: /\btestament\s+to\s+(the |our )?(power|skill|commitment|ingenuity|durability)\b/gi, w: 5, name: "testament to the power" },
    { re: /\brobust\s+(solution|performance|infrastructure|framework|platform)\b/gi, w: 4, name: "robust solution" },
    { re: /\bharness(ing|es|ed)?\s+(the |your )?(power|potential|benefits)\b/gi, w: 5, name: "harness the power" },
    { re: /\b(dive|dives|diving|dived)\s+deep(er)?\s+into\b/gi, w: 3, name: "dive deeper into" },
    { re: /\bat\s+the\s+(forefront|cutting edge|heart)\s+of\b/gi, w: 3, name: "at the forefront of" },
    { re: /\b(reimagine|reimagination|reinventing|revolutionize|revolutionizing)\b/gi, w: 4, name: "reimagine/reinvent" },
    { re: /\b(empowering|enables?|equips?)\s+(you|users?|individuals?|businesses?|teams?)\s+to\b/gi, w: 4, name: "empowers you to" },
    { re: /\bcomprehensive\s+(guide|overview|analysis|resource|solution)\b/gi, w: 3, name: "comprehensive guide" },
    { re: /\b(embark|embarking|embarked)\s+on\s+a\s+journey\b/gi, w: 5, name: "embark on a journey" },
    { re: /\b(plethora|wealth|abundance)\s+of\b/gi, w: 3, name: "plethora of" },
    { re: /\b(serves?|stands?)\s+as\s+a\s+(testament|beacon|reminder|bridge)\b/gi, w: 4, name: "serves as a testament" },
    { re: /\bworld\s+of\s+(possibilities|opportunities|wellness|fitness)\b/gi, w: 3, name: "world of possibilities" },
    { re: /\bin\s+the\s+realm\s+of\b/gi, w: 3, name: "in the realm of" },
    { re: /\bwhether\s+you'?re\s+a\s+(beginner|seasoned|seasoned professional|novice|expert)\b/gi, w: 4, name: "whether you're a beginner" },
    // Additional patterns (2024-2025 AI tells)
    { re: /\bleverage(ing|s|d)?\s+(the\s+)?(power|potential|capabilities?|strengths?)\s+of\b/gi, w: 5, name: "leverage the power of" },
    { re: /\btransformative\s+(impact|power|potential|effect|change)\b/gi, w: 5, name: "transformative impact" },
    { re: /\bdisrupt(ive|ing|ion)?\s+(the\s+)?(industry|market|space|landscape|status quo)\b/gi, w: 4, name: "disrupt the industry" },
    { re: /\bholistic\s+(approach|solution|view|perspective|framework)\b/gi, w: 5, name: "holistic approach" },
    { re: /\bstreamline\s+(your\s+)?(workflow|process|operations|efficiency)\b/gi, w: 4, name: "streamline your workflow" },
    { re: /\boptimal\s+(solution|performance|results|experience|outcome)\b/gi, w: 4, name: "optimal solution" },
    { re: /\bscalable\s+(solution|architecture|infrastructure|approach|platform)\b/gi, w: 4, name: "scalable solution" },
    { re: /\bend-?to-?end\s+(solution|service|platform|experience|support)\b/gi, w: 4, name: "end-to-end solution" },
    { re: /\buser-?centric\s+(design|approach|experience|solution|platform)\b/gi, w: 4, name: "user-centric design" },
    { re: /\bdata-?driven\s+(insights|decisions|approach|strategy|solution)\b/gi, w: 4, name: "data-driven insights" },
    { re: /\bnext-?generation\s+(technology|solution|platform|approach|tool)\b/gi, w: 4, name: "next-generation technology" },
    { re: /\bstate-?of-?the-?art\s+(technology|solution|performance|results|approach)\b/gi, w: 5, name: "state-of-the-art" },
    { re: /\bseamless\s+(integration|experience|transition|solution|workflow)\b/gi, w: 4, name: "seamless integration" },
    { re: /\bpowerful\s+(tool|solution|platform|feature|capability)\b/gi, w: 3, name: "powerful tool" },
    { re: /\bcomprehensive\s+(suite|range|array|selection|list)\s+of\b/gi, w: 3, name: "comprehensive suite of" },
    { re: /\bwide\s+range\s+of\s+(options|features|services|solutions|benefits)\b/gi, w: 3, name: "wide range of" },
    { re: /\bvariety\s+of\s+(options|features|services|solutions|benefits)\b/gi, w: 3, name: "variety of" },
    { re: /\bdive\s+into\s+(the\s+)?(details|world|topic|subject|matter)\b/gi, w: 4, name: "dive into the details" },
    { re: /\bexplore\s+(the\s+)?(possibilities|options|features|benefits|world)\b/gi, w: 3, name: "explore the possibilities" },
    { re: /\bdiscover\s+(the\s+)?(power|potential|benefits|magic|secret)\b/gi, w: 4, name: "discover the power" },
    { re: /\bultimate\s+(guide|solution|resource|tool|experience)\b/gi, w: 4, name: "ultimate guide" },
    { re: /\bessential\s+(guide|tips|strategies|tools|resources)\b/gi, w: 3, name: "essential guide" },
    { re: /\bmust-?read\s+(article|guide|post|resource|book)\b/gi, w: 3, name: "must-read" },
    { re: /\bquick\s+(guide|overview|summary|tips|steps)\b/gi, w: 2, name: "quick guide" },
    { re: /\bstep-?by-?step\s+(guide|process|tutorial|instructions?)\b/gi, w: 3, name: "step-by-step guide" },
    { re: /\bbeginner'?s?\s+(guide|tutorial|overview|introduction)\b/gi, w: 2, name: "beginner's guide" },
    { re: /\bcomplete\s+(guide|overview|tutorial|resource)\b/gi, w: 3, name: "complete guide" },
    { re: /\bfinal\s+(thoughts|verdict|word|say)\b/gi, w: 4, name: "final thoughts" },
    { re: /\bkey\s+(takeaways?|points|highlights|findings|insights)\b/gi, w: 3, name: "key takeaways" },
    { re: /\bwrap\s+up\b/gi, w: 3, name: "wrap up" },
    { re: /\bin\s+summary\b/gi, w: 3, name: "in summary" },
    { re: /\bto\s+sum\s+up\b/gi, w: 3, name: "to sum up" },
    { re: /\ball\s+in\s+all\b/gi, w: 3, name: "all in all" },
    { re: /\bat\s+the\s+end\s+of\s+the\s+day\b/gi, w: 4, name: "at the end of the day" },
    { re: /\bwhen\s+it\s+comes\s+to\b/gi, w: 2, name: "when it comes to" },
    { re: /\bone\s+of\s+the\s+(most|best|top|key|main)\b/gi, w: 2, name: "one of the most" },
    { re: /\bit\s+is\s+(important|essential|crucial|vital)\s+to\b/gi, w: 3, name: "it is important to" },
    { re: /\bthere\s+are\s+(many|several|a\s+number\s+of)\s+(reasons|factors|ways|things)\b/gi, w: 3, name: "there are many reasons" },
    { re: /\bfirst\s+and\s+foremost\b/gi, w: 3, name: "first and foremost" },
    { re: /\blast\s+but\s+not\s+least\b/gi, w: 3, name: "last but not least" },
    { re: /\bon\s+the\s+other\s+hand\b/gi, w: 2, name: "on the other hand" },
    { re: /\bwith\s+that\s+said\b/gi, w: 3, name: "with that said" },
    { re: /\bhaving\s+said\s+that\b/gi, w: 3, name: "having said that" },
    { re: /\bthat\s+being\s+said\b/gi, w: 3, name: "that being said" },
    { re: /\bin\s+order\s+to\b/gi, w: 2, name: "in order to" },
    { re: /\bdue\s+to\s+the\s+fact\s+that\b/gi, w: 4, name: "due to the fact that" },
    { re: /\bin\s+spite\s+of\s+the\s+fact\s+that\b/gi, w: 4, name: "in spite of the fact that" },
    { re: /\bduring\s+this\s+(time|period|process|journey)\b/gi, w: 3, name: "during this time" },
    { re: /\bin\s+this\s+(day|age|era|time)\b/gi, w: 3, name: "in this day and age" },
    { re: /\bin\s+the\s+(current|present|modern)\s+(world|climate|landscape|environment)\b/gi, w: 4, name: "in the current world" },
    { re: /\bin\s+an\s+(increasingly|ever|rapidly)\s+(digital|connected|global|complex)\b/gi, w: 4, name: "in an increasingly digital" },
    { re: /\bas\s+we\s+(move|look|step|transition)\s+(forward|ahead|into)\b/gi, w: 4, name: "as we move forward" },
    { re: /\blooking\s+ahead\b/gi, w: 3, name: "looking ahead" },
    { re: /\bgoing\s+forward\b/gi, w: 3, name: "going forward" },
    { re: /\bmoving\s+forward\b/gi, w: 3, name: "moving forward" },
    { re: /\bthe\s+future\s+of\b/gi, w: 3, name: "the future of" },
    { re: /\bwhat\s+the\s+future\s+holds\b/gi, w: 4, name: "what the future holds" },
    { re: /\bon\s+the\s+horizon\b/gi, w: 3, name: "on the horizon" },
    { re: /\bjust\s+around\s+the\s+corner\b/gi, w: 3, name: "just around the corner" },
    { re: /\bfast\s+approaching\b/gi, w: 3, name: "fast approaching" },
    { re: /\brapidly\s+approaching\b/gi, w: 3, name: "rapidly approaching" },
    { re: /\bon\s+the\s+rise\b/gi, w: 3, name: "on the rise" },
    { re: /\bgaining\s+(traction|momentum|popularity|attention)\b/gi, w: 3, name: "gaining traction" },
    { re: /\bat\s+an\s+all-?time\s+high\b/gi, w: 3, name: "at an all-time high" },
    { re: /\bmore\s+important(ly)?\s+than\s+ever\b/gi, w: 4, name: "more important than ever" },
    { re: /\bnow\s+more\s+than\s+ever\b/gi, w: 4, name: "now more than ever" },
    { re: /\bit\s+is\s+clear\s+that\b/gi, w: 3, name: "it is clear that" },
    { re: /\bit\s+is\s+evident\s+that\b/gi, w: 3, name: "it is evident that" },
    { re: /\bit\s+is\s+obvious\s+that\b/gi, w: 3, name: "it is obvious that" },
    { re: /\bit\s+goes\s+without\s+saying\b/gi, w: 4, name: "it goes without saying" },
    { re: /\bneedless\s+to\s+say\b/gi, w: 3, name: "needless to say" },
    { re: /\bas\s+you\s+can\s+(see|imagine|tell|expect)\b/gi, w: 3, name: "as you can see" },
    { re: /\bas\s+we\s+all\s+know\b/gi, w: 3, name: "as we all know" },
    { re: /\bit\s+is\s+widely\s+known\s+that\b/gi, w: 4, name: "it is widely known that" },
    { re: /\bit\s+is\s+common\s+knowledge\s+that\b/gi, w: 4, name: "it is common knowledge" },
    { re: /\bit\s+is\s+no\s+secret\s+that\b/gi, w: 3, name: "it is no secret" },
    { re: /\bwe\s+all\s+know\b/gi, w: 3, name: "we all know" },
    { re: /\beveryone\s+knows\b/gi, w: 3, name: "everyone knows" },
    { re: /\bmost\s+people\s+know\b/gi, w: 3, name: "most people know" },
    { re: /\bit\s+is\s+well\s+known\s+that\b/gi, w: 3, name: "it is well known" },
    { re: /\bit\s+is\s+generally\s+accepted\s+that\b/gi, w: 4, name: "it is generally accepted" },
    { re: /\bit\s+is\s+universally\s+acknowledged\s+that\b/gi, w: 5, name: "it is universally acknowledged" },
    { re: /\baccording\s+to\s+experts\b/gi, w: 3, name: "according to experts" },
    { re: /\bexperts\s+(say|agree|suggest|recommend|believe)\b/gi, w: 3, name: "experts say" },
    { re: /\bresearch\s+(shows|suggests|indicates|reveals|confirms)\b/gi, w: 3, name: "research shows" },
    { re: /\bstudies\s+(show|suggest|indicate|reveal|confirm)\b/gi, w: 3, name: "studies show" },
    { re: /\bscience\s+(says|shows|suggests|proves)\b/gi, w: 3, name: "science says" },
    { re: /\bit\s+has\s+been\s+(shown|proven|demonstrated|established)\s+that\b/gi, w: 4, name: "it has been shown" },
    { re: /\bit\s+is\s+worth\s+noting\s+that\b/gi, w: 3, name: "it is worth noting" },
    { re: /\bit\s+is\s+interesting\s+to\s+note\b/gi, w: 3, name: "it is interesting to note" },
    { re: /\bit\s+is\s+important\s+to\s+mention\b/gi, w: 3, name: "it is important to mention" },
    { re: /\bit\s+should\s+be\s+noted\s+that\b/gi, w: 3, name: "it should be noted" },
    { re: /\bworth\s+mentioning\b/gi, w: 3, name: "worth mentioning" },
    { re: /\bimportant\s+to\s+mention\b/gi, w: 3, name: "important to mention" },
  ];

  /* ──────────────────────────────────────────────────────────────────
     Text-patterns signal
     ──────────────────────────────────────────────────────────────────
     Counts AI-isms weighted by confidence, normalized to 0–100.
     Empty/short text returns 0 (no signal).
  */
  function scoreText(text) {
    if (!text || text.length < 40) return { score: 0, hits: [], markers: 0 };
    const t = String(text);
    const lower = t.toLowerCase();

    let raw = 0;
    const hits = [];
    const markers = (lower.match(/(?:"|“)[^"”]{8,80}(?:"|”)/g) || []).length; // quoted "facts"

    for (const p of PHRASES) {
      const matches = t.match(p.re);
      if (!matches) continue;
      const n = p.maxHits ? Math.min(matches.length, p.maxHits) : matches.length;
      raw += n * p.w;
      hits.push(`${p.name} ×${n}`);
    }

    // Sentence-length uniformity: AI writes sentences of similar length.
    // Compute stdev / mean. Low coefficient of variation = AI-like.
    const sentences = t.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
    let cv = 0;
    if (sentences.length >= 3) {
      const lens = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
      const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
      const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
      const stdev = Math.sqrt(variance);
      cv = stdev / Math.max(mean, 1); // coefficient of variation
      // cv < 0.25 = very uniform (AI-like), > 0.45 = varied (human-like)
      if (cv < 0.25) { raw += 8; hits.push(`uniform sentences (cv=${cv.toFixed(2)})`); }
      else if (cv < 0.35) { raw += 4; hits.push(`fairly uniform sentences (cv=${cv.toFixed(2)})`); }
    }

    // Em-dash density: only flag when clearly above human baseline.
    // Human journalists use em-dashes too — many great writers rely
    // on them. We require > 4 per 100 words AND at least 3 total
    // to add weight, so a snippet with one or two em-dashes (which
    // is normal) doesn't get dinged.
    const words = t.split(/\s+/).filter(Boolean).length;
    const dashCount = (t.match(/—/g) || []).length;
    if (words > 0) {
      const dashRatio = dashCount / words;
      if (dashCount >= 3 && dashRatio > 0.04) { raw += 6; hits.push(`high em-dash density (${dashCount} in ${words}w)`); }
    }

    // Bulleted-list vibe: lots of parallel "•" or numbered "1." lines
    const bulletLines = (t.match(/^\s*[•\-\*]\s+/gm) || []).length;
    if (bulletLines >= 4) { raw += 4; hits.push(`${bulletLines} bullet lines`); }

    // Normalize: 28 raw points ≈ 100% on a typical snippet
    const score = Math.min(100, Math.round((raw / 28) * 100));
    return { score, hits, markers };
  }

  /* ──────────────────────────────────────────────────────────────────
     Author / byline signal
     ──────────────────────────────────────────────────────────────────
     We can't read the page (privacy), so this signal looks at the
     *snippet* for byline cues. Generic "Staff Writer" / "by AI" / no
     visible byline = AI-leaning. Named human author visible = human.
     The caller passes `byline` if it could be parsed from the SERP
     (Google sometimes shows "By John Smith · 2 days ago").
  */
  function scoreAuthor({ byline, text }) {
    const t = String(text || "");
    // Default baseline is slightly human-leaning. A missing byline in a
    // SERP snippet often just means Google truncated it, not that the
    // article is AI. So we don't pre-penalize until we see a positive
    // signal.
    let raw = 30;

    if (byline) {
      // Explicit human byline → strong human signal
      if (/by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i.test(byline) && !/staff|ai|bot|admin/i.test(byline)) {
        raw -= 25;
      } else if (/staff writer|editor|admin/i.test(byline)) {
        raw += 12;
      }
    }

    // "by Author Name" inside the snippet (Google sometimes shows this)
    const bylineMatch = t.match(/\bby\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (bylineMatch && !/staff|ai|bot|admin/i.test(bylineMatch[1])) {
      raw -= 15;
    }

    // Self-disclosed AI (highest confidence tell)
    if (/\b(ai[- ]generated|written by ai|created with ai|powered by ai|generated by ai)\b/i.test(t)) {
      raw += 40;
    }

    // Stock-photo / generic-author indicators
    if (/\bposted by (admin|moderator|team|staff)\b/i.test(t)) raw += 10;

    return Math.max(0, Math.min(100, raw));
  }

  /* ──────────────────────────────────────────────────────────────────
     Domain-signal heuristic
     ──────────────────────────────────────────────────────────────────
     URL-only signal. No fetch, no WHOIS — just shape & TLD.
     Caveat: legit publications sometimes use .io/.co. We add weight
     rather than treat as a verdict.
  */
  const AI_TLD_SKEW = [".ai", ".io", ".co", ".app", ".xyz", ".click", ".lol", ".buzz"];
  const LOW_TRUST_TLD = [".click", ".xyz", ".buzz", ".top", ".loan", ".work", ".kim"];
  const NEWS_TLDS = ["nytimes.com", "washingtonpost.com", "theguardian.com", "bbc.com", "bbc.co.uk", "reuters.com", "apnews.com", "theatlantic.com", "newyorker.com", "wired.com", "arstechnica.com", "economist.com", "bloomberg.com", "ft.com", "wsj.com", "latimes.com", "chicagotribune.com", "bostonglobe.com", "nature.com", "sciencemag.org", "sciencedirect.com", "springer.com", "jstor.org", "wikipedia.org", "britannica.com", "techcrunch.com", "theverge.com", "engadget.com", "gizmodo.com", "cnet.com", "zdnet.com", "venturebeat.com", "fastcompany.com", "inc.com", "forbes.com", "hbr.org", "mit.edu", "stanford.edu", "harvard.edu", "berkeley.edu", "cmu.edu", "caltech.edu", "nasa.gov", "nih.gov", "cdc.gov", "who.int", "un.org", "worldbank.org", "pewresearch.org", "gallup.com", "polls.com", "fivethirtyeight.com", "vox.com", "politico.com", "axios.com", "propublica.org", "motherjones.com", "slate.com", "salon.com", "medium.com", "substack.com", "ghost.org", "github.com", "stackoverflow.com", "stackexchange.com", "reddit.com", "quora.com", "ycombinator.com", "producthunt.com", "behance.net", "dribbble.com", "dev.to", "hashnode.com", "freecodecamp.org", "codecademy.com", "coursera.org", "edx.org", "udemy.com", "khanacademy.org", "mitocw.org", "arxiv.org", "pubmed.ncbi.nlm.nih.gov", "scholar.google.com", "researchgate.net", "academia.edu", "mendeley.com", "zotero.org", "jstor.org", "ieee.org", "acm.org", "aaas.org", "aps.org", "acs.org", "rsc.org", "elsevier.com", "wiley.com", "tandfonline.com", "sagepub.com", "cambridge.org", "oxfordjournals.org", "plos.org", "biorxiv.org", "medrxiv.org", "ssrn.com", " SSRN.com", "papers.ssrn.com", "ideas.repec.org", "nber.org", "cepr.org", "iza.org", "brookings.edu", "rand.org", "chathamhouse.org", "cfr.org", "carnegieendowment.org", "csis.org", "heritage.org", "aei.org", "cato.org", "mises.org", "brookings.edu", "pewforum.org", "pewresearch.org", "gallup.com", "polls.com", "fivethirtyeight.com", "vox.com", "politico.com", "axios.com", "propublica.org", "motherjones.com", "slate.com", "salon.com", "thedailybeast.com", "buzzfeednews.com", "vice.com", "vox.com", "theintercept.com", "democracynow.org", "commondreams.org", "truthout.org", "alternet.org", "rawstory.com", "dailykos.com", "thinkprogress.org", "mediamatters.org", "factcheck.org", "politifact.com", "snopes.com", "washingtonexaminer.com", "dailycaller.com", "breitbart.com", "theblaze.com", "dailywire.com", "nationalreview.com", "weeklystandard.com", "spectator.org", "thefederalist.com", "americanthinker.com", "townhall.com", "redstate.com", "hotair.com", "instapundit.com", "drudgereport.com", "zerohedge.com", "infowars.com", "naturalnews.com", "beforeitsnews.com", "activistpost.com", "globalresearch.ca", "veteranstoday.com", "veteransnewsnow.com", "whatreallyhappened.com", "rense.com", "prisonplanet.com", "infowars.com", "naturalnews.com", "mercola.com", "greenmedinfo.com", "healthimpactnews.com", "vaccineimpact.com", "childrenshealthdefense.org", "thehighwire.com", "delbigtree.com", "icandecide.org", "nvic.org", "ahrp.org", " allianceforhumanresearchprotection.org", "medicalveritas.org", "omsj.org", "rethinkingaids.com", "virusmyth.com", "houseofnumbers.com", "theperthgroup.com", "virustmyth.net", "bioinitiative.org", "ehtrust.org", "mdsafetech.org", "parents4safe schools.org", "screensandkids.org", "waituntil8th.org", "center4research.org", "breastcancerfund.org", "ewg.org", "skindeep.org", "foodandwaterwatch.org", "centerforfoodsafety.org", "non-gmoreport.com", "responsibletechnology.org", "gmwatch.org", "organicconsumers.org", "farmwars.info", "healthranger.com", "naturalnews.com", "mercola.com", "greenmedinfo.com", "healthimpactnews.com", "vaccineimpact.com", "childrenshealthdefense.org", "thehighwire.com", "delbigtree.com", "icandecide.org", "nvic.org", "ahrp.org", " allianceforhumanresearchprotection.org", "medicalveritas.org", "omsj.org", "rethinkingaids.com", "virusmyth.com", "houseofnumbers.com", "theperthgroup.com", "virustmyth.net", "bioinitiative.org", "ehtrust.org", "mdsafetech.org", "parents4safe schools.org", "screensandkids.org", "waituntil8th.org", "center4research.org", "breastcancerfund.org", "ewg.org", "skindeep.org", "foodandwaterwatch.org", "centerforfoodsafety.org", "non-gmoreport.com", "responsibletechnology.org", "gmwatch.org", "organicconsumers.org", "farmwars.info"];

  function scoreDomain(url) {
    if (!url) return 0;
    let raw = 0;
    const hits = [];
    const lower = String(url).toLowerCase();

    // TLD skew — these get a small bump, not a verdict
    for (const tld of AI_TLD_SKEW) {
      if (lower.endsWith(tld) || lower.includes(tld + "/")) {
        raw += 8; hits.push(`TLD: ${tld}`); break;
      }
    }
    for (const tld of LOW_TRUST_TLD) {
      if (lower.endsWith(tld) || lower.includes(tld + "/")) {
        raw += 12; hits.push(`low-trust TLD: ${tld}`); break;
      }
    }

    // Known-good publications → strong human signal (subtracts)
    for (const domain of NEWS_TLDS) {
      if (lower.includes(domain)) {
        raw -= 30; hits.push(`known publication: ${domain}`); break;
      }
    }

    // Long slug with many hyphens = SEO-bait
    const path = lower.split("?")[0].split("#")[0].replace(/^https?:\/\/[^/]+/, "");
    const segments = path.split("/").filter(Boolean);
    const lastSlug = segments[segments.length - 1] || "";
    const hyphenCount = (lastSlug.match(/-/g) || []).length;
    if (hyphenCount >= 5) { raw += 14; hits.push(`${hyphenCount}-hyphen slug`); }
    else if (hyphenCount >= 3) { raw += 6; hits.push(`${hyphenCount}-hyphen slug`); }

    // Numbers in slug ("top-10-things-…")
    if (/\d/.test(lastSlug) && hyphenCount >= 2) { raw += 4; hits.push("numbered listicle slug"); }

    // Path looks like /blog/yyyy/mm/dd/ — generic CMS date structure
    if (/\/\d{4}\/\d{2}\/\d{2}\//.test(lower)) { raw += 3; hits.push("date-stamped URL"); }

    // AI-generated content farms often use /ai-*/ or /generated/ paths
    if (/\/(ai|generated|auto|bot)\b/.test(lower)) { raw += 15; hits.push("AI path segment"); }

    // Subdomain patterns: blog., news., articles. are neutral; ai., auto., bot. are suspicious
    if (/^https?:\/\/(ai|auto|bot|generated)\./.test(lower)) { raw += 12; hits.push("AI subdomain"); }

    return Math.max(0, Math.min(100, raw + 30)); // re-baseline so most domains read ~30
  }

  /* ──────────────────────────────────────────────────────────────────
     Calibration — user-controlled sensitivity
     ──────────────────────────────────────────────────────────────────
     Low  : only obvious cases flag (multiplier 0.55)
     Med  : default (multiplier 1.0)
     High : sensitive (multiplier 1.35)
  */
  let CAL = "med";
  const CAL_MULT = { low: 0.55, med: 1.0, high: 1.35 };

  function setCalibration(level) {
    if (CAL_MULT[level]) CAL = level;
  }
  function getCalibration() { return CAL; }

  /* ──────────────────────────────────────────────────────────────────
     Combine
     ──────────────────────────────────────────────────────────────────
     Text patterns are by far the strongest signal — AI-isms are the
     most reliable client-side tell. Author is weak (we can't read
     most pages), domain is contextual. Weight: text 65%, author 15%,
     domain 20%. Then apply calibration multiplier and clamp.
  */
  function combine(textScore, authorScore, domainScore) {
    const weighted =
      textScore * 0.65 +
      authorScore * 0.15 +
      domainScore * 0.20;
    const cal = CAL_MULT[CAL] || 1.0;
    const final = Math.max(0, Math.min(100, Math.round(weighted * cal)));
    return final;
  }

  /* ──────────────────────────────────────────────────────────────────
     Public API
     ────────────────────────────────────────────────────────────────── */
  function score(input, opts = {}) {
    const text = String(input || "");
    const url = opts.url || "";
    const byline = opts.byline || "";

    const t = scoreText(text);
    const a = scoreAuthor({ byline, text });
    const d = scoreDomain(url);
    const overall = combine(t.score, a, d);

    const reasons = [
      ...t.hits.slice(0, 4),
    ];
    if (byline) reasons.push(`byline: "${byline}"`);
    if (d > 60) reasons.push(`URL flagged`);
    if (d < 20) reasons.push(`URL looks normal`);

    return {
      text: t.score,
      author: a,
      domain: d,
      overall,
      reasons,
    };
  }

  // Export for both browser extension (via window.AIScore) and Node tests
  const api = { score, scoreText, scoreAuthor, scoreDomain, combine, setCalibration, getCalibration };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AIScore = api;
})(typeof window !== "undefined" ? window : globalThis);