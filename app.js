"use strict";
// Sample records (student-created, approximate). months = months open (1-12); cost = PKR per person per day
const DESTINATIONS = [
  {id:1,name:"Naran & Kaghan Valley",region:"Khyber Pakhtunkhwa",drive:7,minDays:2,cost:9000,months:[6,7,8,9],alt:2400,image:"Naran & Kaghan Valley.jpg",note:"Lake Saif-ul-Malook and alpine meadows."},
  {id:2,name:"Swat & Malam Jabba",region:"Khyber Pakhtunkhwa",drive:6,minDays:2,cost:8000,months:[3,4,5,6,7,8,9,10,11],alt:1000,image:"Swat & Malam Jabba.jpg",note:"Green valley, rivers and ski slopes."},
  {id:3,name:"Chitral & Kalash Valleys",region:"Khyber Pakhtunkhwa",drive:10,minDays:3,cost:9500,months:[4,5,6,7,8,9,10],alt:1500,image:"Chitral & Kalash Valleys.jpg",note:"Unique Kalash culture and Tirich Mir views."},
  {id:4,name:"Hunza Valley",region:"Gilgit-Baltistan",drive:15,minDays:3,cost:12000,months:[4,5,6,7,8,9,10],alt:2500,image:"Hunza Valley.jpg",note:"Baltit Fort, Attabad Lake, orchards."},
  {id:5,name:"Skardu",region:"Gilgit-Baltistan",drive:16,minDays:3,cost:13000,months:[4,5,6,7,8,9,10],alt:2230,image:"Skadru.jpg",note:"Shangrila, Upper Kachura and cold desert."},
  {id:6,name:"Fairy Meadows",region:"Gilgit-Baltistan",drive:12,minDays:2,cost:10000,months:[5,6,7,8,9],alt:3300,image:"Fairy Meadows.jpg",note:"Nanga Parbat base camp trek (hike required)."},
  {id:7,name:"Deosai National Park",region:"Gilgit-Baltistan",drive:18,minDays:2,cost:11000,months:[6,7,8,9],alt:4114,image:"Deosai National Park.jpg",note:"High plateau with wildflowers and wildlife."},
  {id:8,name:"Khunjerab Pass",region:"Gilgit-Baltistan",drive:19,minDays:3,cost:14000,months:[5,6,7,8,9,10],alt:4693,image:"Kunjerab Pass.jpg",note:"Border pass with Karakoram views."}
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = n => "PKR " + n.toLocaleString("en-PK");
const $ = id => document.getElementById(id);

let trip = [];                       // array of destination ids
let settings = {days:7, people:2, budget:150000, month:null};

// ---------- Form with validation ----------
const form = $("tripForm"), msg = $("formMsg");
$("start").min = new Date().toISOString().slice(0,10);

form.addEventListener("submit", e => {
  e.preventDefault();
  const bad = [...form.elements].filter(f => f.name && !f.checkValidity());
  [...form.elements].forEach(f => f.classList.toggle("bad", bad.includes(f)));
  if (bad.length) {
    bad[0].focus();
    msg.className = "err";
    msg.textContent = "Please fix: " + bad.map(f => form.querySelector(`label[for=${f.id}]`).textContent.split(" (")[0]).join(", ") + ".";
    return;
  }
  const d = new Date($("start").value);
  settings = {days:+$("days").value, people:+$("people").value, budget:+$("budget").value, month:d.getMonth()+1};
  msg.className = "ok";
  msg.textContent = `Saved for ${$("name").value.trim()}: ${settings.days} days, ${settings.people} traveller(s), starting in ${MONTHS[d.getMonth()]}.`;
  renderCards(); renderTrip();
});

// ---------- Interaction 1: filtering ----------
function renderCards() {
  const q = $("search").value.trim().toLowerCase(), reg = $("region").value, max = +$("maxCost").value;
  $("costOut").textContent = max;
  const list = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(q) && (reg === "all" || d.region === reg) && d.cost <= max &&
    (!$("openOnly").checked || !settings.month || d.months.includes(settings.month)));
  $("count").textContent = list.length ? `${list.length} destination(s) shown.` : "No destinations match your filters. Try widening them.";
  const ul = $("cards"); ul.replaceChildren();
  list.forEach(d => {
    const closed = settings.month && !d.months.includes(settings.month);
    const li = document.createElement("li");
    li.innerHTML = `<img class="destination-image" src="images/${encodeURIComponent(d.image)}" alt="${d.name} landscape" loading="lazy" decoding="async">
      <h3>${d.name}</h3><p>${d.note}</p>
      <p><span class="tag">${d.region}</span> <span class="tag">${d.alt} m</span>
      ${settings.month ? `<span class="tag ${closed ? "closed" : ""}">${closed ? "Closed/unsafe in " : "Open in "}${MONTHS[settings.month-1]}</span>` : ""}</p>
      <p>${d.drive} h drive from Islamabad · min ${d.minDays} days · ${fmt(d.cost)}/person/day</p>`;
    const b = document.createElement("button");
    const added = trip.includes(d.id);
    b.textContent = added ? "Added" : "Add to itinerary";
    b.disabled = added;
    b.setAttribute("aria-label", `${b.textContent}: ${d.name}`);
    b.addEventListener("click", () => { trip.push(d.id); renderCards(); renderTrip(); });
    li.append(b); ul.append(li);
  });
}
["search","region","maxCost","openOnly"].forEach(id => $(id).addEventListener("input", renderCards));

// ---------- Interaction 2: calculation + conflict checking ----------
function renderTrip() {
  const stops = trip.map(id => DESTINATIONS.find(d => d.id === id));
  $("empty").hidden = stops.length > 0; $("summary").hidden = !stops.length;
  const ol = $("stops"); ol.replaceChildren();
  stops.forEach(d => {
    const li = document.createElement("li");
    li.append(`${d.name} (${d.minDays} days)`);
    const b = document.createElement("button");
    b.className = "secondary"; b.textContent = "Remove"; b.setAttribute("aria-label", "Remove " + d.name);
    b.addEventListener("click", () => { trip = trip.filter(i => i !== d.id); renderCards(); renderTrip(); });
    li.append(b); ol.append(li);
  });
  if (!stops.length) return;

  const stay = stops.reduce((s,d) => s + d.minDays, 0);
  const needed = stay + stops.length;                       // +1 transfer day per stop
  const cost = stops.reduce((s,d) => s + d.cost * d.minDays, 0) * settings.people;
  const drive = stops.reduce((s,d) => s + d.drive, 0);
  $("sNeed").textContent = `${needed} (${stay} stay + ${stops.length} transfer) of ${settings.days} available`;
  $("sCost").textContent = `${fmt(cost)} for ${settings.people} traveller(s)`;
  $("sDrive").textContent = `${drive} hours one-way, combined`;

  const alerts = [];
  if (needed > settings.days) alerts.push(["bad", `Time conflict: you need ${needed} days but planned ${settings.days}. Remove a stop or add ${needed - settings.days} day(s).`]);
  if (cost > settings.budget) alerts.push(["bad", `Over budget by ${fmt(cost - settings.budget)}.`]);
  if (settings.month) stops.filter(d => !d.months.includes(settings.month))
    .forEach(d => alerts.push(["bad", `Season conflict: ${d.name} is usually closed or unsafe in ${MONTHS[settings.month-1]}.`]));
  else alerts.push(["warn", "Save your trip details (step 1) to check seasons, days and budget."]);
  if (stops.some(d => d.alt >= 4000)) alerts.push(["warn", "High altitude stop (4000 m+): allow time to acclimatise."]);
  if (drive / stops.length > 14) alerts.push(["warn", "Long drives: consider a flight to Gilgit/Skardu or overnight breaks."]);
  if (!alerts.some(a => a[0] === "bad") && settings.month) alerts.unshift(["ok", "No conflicts found. Your itinerary fits your days, budget and season."]);
  $("alerts").replaceChildren(...alerts.map(([c,t]) => Object.assign(document.createElement("li"), {className:c, textContent:t})));
}
$("clear").addEventListener("click", () => { trip = []; renderCards(); renderTrip(); });

renderCards(); renderTrip();
