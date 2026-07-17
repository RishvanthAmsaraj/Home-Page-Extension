/* Calibration harness for the AI Signal scorer.
   Run: node test-score.node.js
   Bands: <35 Human-like | 35-64 Mixed | >=65 Likely AI
   Each fixture declares which band it SHOULD land in at medium sensitivity. */

const AIScore = require("./score.js");

const FIXTURES = [
  // ── Human writing (should be "low") ──────────────────────────────
  { want: "low", label: "Atlantic-style political scene",
    url: "https://www.theatlantic.com/politics/archive/2026/03/senate-vote-doubt/681234/",
    text: "The night before the vote, Senator Murray sat in her office reading the bill for the third time. She had been against it in committee. Now she was not sure. The hearing had changed her mind — or at least the way she held her doubt. \"I don't love this version,\" she told her chief of staff. \"But I don't love the other one either.\"" },

  { want: "low", label: "Personal cooking Substack",
    url: "https://someonescooking.substack.com/p/i-burned-the-roux-again",
    text: "I burned the roux. Twice. The second time I was sure I'd followed the recipe but no — I forgot to turn the heat down after the butter foamed and the whole thing went black in about forty seconds. My husband walked in, looked at the pan, and just said \"again?\" without even looking up from his phone. We ordered pizza." },

  { want: "low", label: "Investigative news lede",
    url: "https://www.propublica.org/article/agency-emails-lobbyist-records",
    text: "The emails, obtained through a public records request, span 14 months and include exchanges between three senior officials and a lobbyist for the firm. One of them — sent at 11:47 p.m. on a Sunday — contradicts what the agency's director told reporters the next morning." },

  { want: "low", label: "Wikipedia-style neutral prose",
    url: "https://en.wikipedia.org/wiki/Roux",
    text: "A roux is a mixture of flour and fat cooked together and used to thicken sauces. The fat is usually butter in French cuisine, but may be lard or vegetable oil in other cuisines. Roux is typically made from equal parts of flour and fat by weight." },

  { want: "low", label: "Casual forum answer",
    url: "https://www.reddit.com/r/AskCulinary/comments/x1y2z3/roux_keeps_burning/",
    text: "Your heat is too high, full stop. Cast iron holds heat like crazy so even after you turn the dial down it keeps cooking. I do mine on 4 out of 10 and it still takes barely six minutes to get to blonde. Also stop walking away from it lol. Ask me how I know." },

  { want: "low", label: "Human sports recap with byline",
    url: "https://www.espn.com/nba/story/_/id/12345/celtics-comeback",
    byline: "By Marcus Delgado",
    text: "By Marcus Delgado. Down 17 with nine minutes left, the Celtics did what they've done all season: they got weird. Hauser hit three corner threes in four possessions, the crowd forgot it was a Tuesday, and Tatum never even had to take over." },

  // ── Genuinely ambiguous corporate/formal (acceptable: low or med) ─
  { want: "low|med", label: "Formal press release (human, corporate)",
    url: "https://www.acmecorp.com/newsroom/q3-results",
    text: "Acme Corporation today announced financial results for the third quarter ended September 30. Revenue increased 12 percent year over year to $4.2 billion, driven primarily by growth in the industrial segment. The board also declared a quarterly dividend of $0.42 per share, payable November 15." },

  // ── AI-flavored writing (should be "high", or at least "med") ────
  { want: "high", label: "SEO marketing sludge",
    url: "https://growth-hacks-daily.xyz/blog/10-ai-marketing-strategies-to-unlock-growth-in-2026",
    text: "In today's digital landscape, navigating the complexities of modern marketing can be a daunting task. It is important to note that businesses must delve into data-driven strategies in order to remain competitive. By leveraging the power of AI-driven insights, organizations can unlock unprecedented growth and navigate the ever-evolving challenges of the industry." },

  { want: "high", label: "AI listicle intro",
    url: "https://best-eco-tips.click/sustainable-living-complete-guide-2026-tips-tricks",
    text: "Welcome to our comprehensive guide to sustainable living. In this article, we will explore the multifaceted benefits of eco-friendly practices and delve into actionable strategies that empower individuals to make a meaningful impact. It is essential to understand that small changes can lead to substantial results over time." },

  { want: "med|high", label: "AI product description",
    url: "https://smartdesk.io/products/flow-pro",
    text: "Our cutting-edge solution is designed to seamlessly integrate into your workflow, delivering unparalleled efficiency and robust performance. In conclusion, this innovative product represents a paradigm shift in how professionals approach their daily tasks — a testament to the power of thoughtful design." },

  { want: "high", label: "ChatGPT-style explainer paragraph",
    url: "https://www.techinsightshub.co/what-is-cloud-computing-a-comprehensive-overview-for-beginners",
    text: "Cloud computing has revolutionized the way businesses operate in today's fast-paced world. It is important to note that there are several key benefits to consider. Firstly, cloud solutions offer unparalleled scalability. Secondly, they provide robust security features. Additionally, cloud platforms enable seamless integration with existing tools. In conclusion, embracing cloud technology is essential for organizations looking to stay ahead in the ever-evolving digital landscape." },

  { want: "med|high", label: "AI travel filler",
    url: "https://wanderlust-guides.buzz/top-10-hidden-gems-in-portugal-you-must-visit-in-2026",
    text: "Nestled along the stunning Atlantic coastline, Portugal boasts a vibrant tapestry of culture and history. Whether you're a seasoned traveler or a first-time visitor, this comprehensive guide will help you discover the hidden gems that make this destination truly unforgettable. From breathtaking vistas to charming villages, there is something for everyone." },

  // ── Short snippets (low information — should stay out of "high") ─
  { want: "low|med", label: "Very short snippet",
    url: "https://example.org/about",
    text: "We build small tools for busy teams. Founded in 2019 in Detroit." },
];

const args = process.argv.slice(2);
const sens = args.find(a => ["low","med","high"].includes(a)) || "med";
AIScore.setCalibration(sens);

/* At LOW sensitivity, compression to "med" is the intended behavior for
   fixtures that rely on text evidence alone — only extreme, corroborated
   cases (e.g. self-disclosed AI on a low-trust domain) should still cross
   the Likely-AI line. Widen those expectations accordingly. */
function expectedFor(f) {
  if (sens === "low" && f.want === "high") return "med|high";
  return f.want;
}

function bandOf(p) { return p < 35 ? "low" : p < 65 ? "med" : "high"; }

let pass = 0, fail = 0;
const rows = [];
for (const f of FIXTURES) {
  const r = AIScore.score(f.text, { url: f.url || "", byline: f.byline || "" });
  const got = bandOf(r.overall);
  const want = expectedFor(f);
  const ok = want.split("|").includes(got);
  if (ok) pass++; else fail++;
  rows.push({ ok, want, got, overall: r.overall, text: r.text, author: r.author, domain: r.domain, trust: r.trust, label: f.label });
}

console.log(`\nSensitivity: ${sens}\n`);
console.log("OK  WANT      GOT   OVR  TXT  AUT  DOM  TRUST  LABEL");
for (const r of rows) {
  console.log(
    (r.ok ? "✓  " : "✗  ") +
    r.want.padEnd(9) + " " + r.got.padEnd(5) +
    String(r.overall).padStart(4) + " " + String(r.text).padStart(4) + " " +
    String(r.author).padStart(4) + " " + String(r.domain).padStart(4) + " " +
    String(r.trust).padStart(5) + "  " + r.label
  );
}
console.log(`\n${pass}/${pass + fail} fixtures in expected band`);

// LOW-sensitivity invariant: an extreme, corroborated case must still flag.
{
  const prev = AIScore.getCalibration();
  AIScore.setCalibration("low");
  const extreme = AIScore.score(
    "This AI-generated article delves into the ever-evolving landscape of productivity. In conclusion, leveraging the power of automation can unlock the potential of seamless integration and unparalleled efficiency for your workflow needs.",
    { url: "https://content-farm.xyz/10-best-ai-productivity-tools-2026-guide" }
  ).overall;
  console.log(`Low-sensitivity flag test: extreme case scores ${extreme} → ${extreme >= 65 ? "OK (still flaggable)" : "FAIL (Likely-AI band unreachable)"}`);
  if (extreme < 65) fail++;
  AIScore.setCalibration(prev);
}

// Determinism check (trust must not be random)
const t1 = AIScore.score("Hello world, testing determinism now.", { url: "https://www.nytimes.com/2026/01/01/x.html" }).trust;
const t2 = AIScore.score("Hello world, testing determinism now.", { url: "https://www.nytimes.com/2026/01/01/x.html" }).trust;
console.log(`Determinism: trust ${t1} vs ${t2} → ${t1 === t2 ? "OK" : "FAIL (non-deterministic)"}`);

process.exit(fail > 0 ? 1 : 0);
