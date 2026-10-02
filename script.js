/* ============================================================
   DEMO DATA — replace this object later with a real API call:
   const visitorData = await (await fetch('/api/visitor')).json();
   ============================================================ */
const visitorData = {
  number: 18403,
  today: 127,
  weekly: 2481,
  allTime: 18403
};

/* ---------- helpers ---------- */
const fmt = n => '#' + n.toLocaleString('en-US');
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/* ---------- fill every [data-bind] from visitorData ---------- */
function render() {
  $$('[data-bind]').forEach(el => {
    el.textContent = fmt(visitorData[el.dataset.bind]);
  });
}

/* ---------- hero: rolling count-up ---------- */
function rollHero() {
  const el = $('#heroNumber');
  const end = visitorData.number;
  if (reduced) { el.textContent = fmt(end); return; }
  const start = end - 13, dur = 1800, t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 4); // slows down as it lands
    el.textContent = fmt(Math.round(start + (end - start) * eased));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------- live position: people arrive after you ---------- */
let after = 0;
function arrive() {
  const n = rand(1, 3);
  after += n;
  visitorData.allTime += n;
  const nowToday = visitorData.today + after;
  $('#after').textContent = after;
  $('#nowToday').textContent = fmt(nowToday);
  $('#tToday').textContent = fmt(nowToday);
  $('#tWeek').textContent = fmt(visitorData.weekly + after);
  $('#tAll').textContent = fmt(visitorData.allTime);
  ['#tToday', '#tWeek', '#tAll'].forEach(id => {
    const el = $(id); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  });
  addChip(visitorData.allTime);
  $('#hereNow').textContent = Math.max(20, Number($('#hereNow').textContent) + rand(-2, 2));
}
function startArrivals() {
  if (reduced) return;
  (function loop() { setTimeout(() => { arrive(); loop(); }, rand(3500, 7000)); })();
}

/* ---------- tiny live universe ---------- */
const universe = $('#universe');
function addChip(num) {
  const c = document.createElement('span');
  c.className = 'chip new';
  c.textContent = fmt(num);
  c.style.left = rand(4, 80) + '%';
  c.style.top = rand(8, 80) + '%';
  universe.appendChild(c);
  setTimeout(() => c.classList.remove('new'), 1500);
  const chips = universe.querySelectorAll('.chip');
  if (chips.length > 8) chips[0].remove();
}
function buildUniverse() {
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('i');
    p.className = 'pt';
    p.style.left = rand(2, 96) + '%';
    p.style.top = rand(4, 94) + '%';
    p.style.animationDelay = (-rand(0, 90) / 10) + 's';
    universe.appendChild(p);
  }
  for (let i = 1; i <= 4; i++) addChip(visitorData.allTime + i + 17);
}

/* ---------- archive of traces ---------- */
function buildTrace() {
  const base = visitorData.allTime - 13;
  $('#trace').innerHTML = Array.from({ length: 6 }, (_, i) =>
    `<li${i === 2 || i === 5 ? ' class="hi"' : ''}>${fmt(base + i)}</li>`).join('');
}

/* ---------- share ---------- */
function shareText() {
  return `I just found my place on the internet.\n\nMy Internet Number:\n${fmt(visitorData.number)}\n\nToday:\n${fmt(visitorData.today)}\n\nWhat's yours?`;
}
function say(msg) {
  const t = $('#toast'); t.textContent = msg;
  setTimeout(() => { t.textContent = ''; }, 2500);
}
$('#shareBtn').addEventListener('click', async () => {
  const text = shareText();
  try {
    if (navigator.share) {
      await navigator.share({ title: 'My Internet Number', text, url: location.href });
    } else {
      await navigator.clipboard.writeText(text + '\n' + location.href);
      say('Copied. Now send it to someone.');
    }
  } catch (e) {
    if (e.name !== 'AbortError') say('Could not share. Try a screenshot instead.');
  }
});

/* ---------- gentle scroll reveal (big sections only) ---------- */
function reveal() {
  const els = $$('.dark .wrap > *:first-child, #positions, .steps, .final-h');
  if (!('IntersectionObserver' in window) || reduced) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

/* ---------- start ---------- */
render();
buildUniverse();
buildTrace();
rollHero();
reveal();
startArrivals();
