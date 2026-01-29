// profiles.js
// Seeds defaults once. Renders Past Hot Guys archive + Other Profiles (only).

const STORAGE_KEY = "ms_people_v2";

function safeParse(json, fallback) { try { return JSON.parse(json); } catch { return fallback; } }
function loadPeople() { return safeParse(localStorage.getItem(STORAGE_KEY) || "[]", []); }
function savePeople(people) { localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); }

function daysAgo(n) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function seedIfEmpty() {
  const existing = loadPeople();
  if (existing.length > 0) return;

  const seeded = [
    // Current featured (used on main page)
    {
  id: "hotguy-damson",
  category: "hot-history",
  badge: "Past Hot Guy",
  name: "Damson",
  caption: "🐎",
  aboutFields: {
    major: "BMOS",
    year: "3rd",
    age: "21",
    ig: "@damson"
  },
  verifiedFields: ["major", "year"], // ⭐ THESE WILL SHOW
  photoUrl: "./images/damson.jpg",
  createdAt: daysAgo(0)
}
,
    {
      id: "hm-theo",
      category: "honorable",
      badge: "Honorable Mention",
      name: "Theo",
      caption: "Respectfully… wow.",
      aboutFields: { major: "—", year: "—", age: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/theo.jpg",
      createdAt: daysAgo(0)
    },
    {
  id: "p-mathew",
  category: "hot",
  badge: "Hot Guy of the Week",
  name: "Mathew",
  caption: "Spotted between classes",
  aboutFields: {
    major: "BMOS",
    year: "2nd",
    age: "—",
    ig: "@—"
  },
  verifiedFields: [],
  photoUrl: "./images/mathew.jpg",
  createdAt: Date.now()
},


    // Other profiles (these show on Profiles page)
    {
      id: "p-martin",
      category: "other",
      badge: "Profile",
      name: "Martin",
      caption: "Campus legend energy.",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/martin.jpg",
      createdAt: daysAgo(5)
    },
    {
      id: "p-callum",
      category: "other",
      badge: "Profile",
      name: "Callum",
      caption: "Spotted being iconic.",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/callum.jpg",
      createdAt: daysAgo(8)
    },
    {
      id: "p-jacob",
      category: "other",
      badge: "Profile",
      name: "Jacob",
      caption: "Main character vibes.",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/jacob.jpg",
      createdAt: daysAgo(12)
    },
    {
      id: "p-keith",
      category: "other",
      badge: "Profile",
      name: "Keith",
      caption: "Mustang certified.",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/keith.jpg",
      createdAt: daysAgo(15)
    },

    // Past Hot Guys archive (these show in archive section)
    {
      id: "hot-history-1",
      category: "hot-history",
      badge: "Hot Guy of the Week (Past)",
      name: "Damson (Week 1)",
      caption: "Archive pick ✨",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/damson.jpg",
      createdAt: daysAgo(21)
    },
    {
      id: "hot-history-2",
      category: "hot-history",
      badge: "Hot Guy of the Week (Past)",
      name: "Theo (Week 2)",
      caption: "Another classic 🏆",
      aboutFields: { major: "—", year: "—", ig: "@—" },
      verifiedFields: [],
      photoUrl: "./images/theo.jpg",
      createdAt: daysAgo(14)
    }
  ];

  savePeople(seeded);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function makeCard(person) {
  const a = document.createElement("a");
  a.className = "card person-card";
  a.href = `./profile.html?id=${encodeURIComponent(person.id)}`;

  const imgWrap = document.createElement("div");
  imgWrap.className = "photo-frame vertical";
  const src = person.photoUrl || person.photoDataUrl || "";

  if (src) {
    const img = new Image();
    img.src = src;
    img.alt = person.name || "Profile";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = `<div class="placeholder"><div class="ph-emoji">📸</div><div class="ph-text">No photo yet</div></div>`;
  }

  const body = document.createElement("div");
  body.className = "pc-body";
  body.innerHTML = `
    <div class="pill">${escapeHtml(person.badge || "Profile")}</div>
    <p class="pc-name">${escapeHtml(person.name || "Unnamed")}</p>
    <p class="pc-cap">${escapeHtml(person.caption || "")}</p>
  `;

  a.appendChild(imgWrap);
  a.appendChild(body);
  return a;
}

seedIfEmpty();

const people = loadPeople();

const pastHotContainer = document.getElementById("pastHotContainer");
const otherContainer = document.getElementById("otherContainer");

const past = people
  .filter(p => p.category === "hot-history")
  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const other = people.filter(p => p.category === "other");

pastHotContainer.innerHTML = "";
if (past.length === 0) {
  pastHotContainer.innerHTML = `<div class="small muted">No past Hot Guys yet.</div>`;
} else {
  past.forEach(p => pastHotContainer.appendChild(makeCard(p)));
}

otherContainer.innerHTML = "";
other.forEach(p => otherContainer.appendChild(makeCard(p)));
