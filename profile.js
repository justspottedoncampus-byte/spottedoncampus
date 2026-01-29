// profile.js
// Shows: profile photo + smart About fields + verified stars + Added date
// Comments: name + optional Quick Info + comment text
// Past Hot Guys: shows people with category === "hot-history"

const STORAGE_KEY = "ms_people_v1";

function safeParse(json, fallback) { try { return JSON.parse(json); } catch { return fallback; } }
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function getId() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

function loadPeople() {
  return safeParse(localStorage.getItem(STORAGE_KEY) || "[]", []);
}

function commentKey(id) { return `ms_comments_${id}`; }
function loadComments(id) { return safeParse(localStorage.getItem(commentKey(id)) || "[]", []); }
function saveComments(id, comments) { localStorage.setItem(commentKey(id), JSON.stringify(comments)); }

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatAddedDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/* ------------------------------
   Smart About + Verified
------------------------------ */
function normalizeAbout(person) {
  // Output: [{ key, label, value }]
  // Supports:
  // 1) aboutFields object (recommended)
  // 2) about array lines like "Major: BMOS"

  const labelMap = {
    major: "Major",
    year: "Year",
    age: "Age",
    program: "Program",
    faculty: "Faculty",
    residence: "Residence",
    ig: "IG",
  };

  const out = [];

  if (person.aboutFields && typeof person.aboutFields === "object") {
    for (const [k, v] of Object.entries(person.aboutFields)) {
      if (!v) continue;
      const key = String(k).toLowerCase().trim();
      out.push({
        key,
        label: labelMap[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
        value: String(v).trim(),
      });
    }
    return out;
  }

  const arr = Array.isArray(person.about) ? person.about : [];
  for (const line of arr) {
    const s = String(line || "").trim();
    if (!s) continue;

    const parts = s.split(":");
    if (parts.length >= 2) {
      const rawLabel = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(":").trim();

      const key =
        rawLabel.includes("major") ? "major" :
        rawLabel.includes("year") ? "year" :
        rawLabel.includes("age") ? "age" :
        rawLabel.includes("ig") ? "ig" :
        rawLabel.replace(/\s+/g, "_");

      out.push({
        key,
        label: labelMap[key] || parts[0].trim(),
        value,
      });
    } else {
      out.push({ key: s.toLowerCase().replace(/\s+/g, "_"), label: "Info", value: s });
    }
  }

  return out;
}

function getVerifiedSet(person) {
  const arr = Array.isArray(person.verifiedFields) ? person.verifiedFields : [];
  return new Set(arr.map(x => String(x).toLowerCase().trim()));
}

function renderAboutSmart(person) {
  const aboutEl = document.getElementById("pAbout");
  if (!aboutEl) return;

  aboutEl.innerHTML = "";

  const entries = normalizeAbout(person);
  const verified = getVerifiedSet(person);

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "No info yet.";
    aboutEl.appendChild(li);
    return;
  }

  entries.forEach(({ key, label, value }) => {
    const li = document.createElement("li");
    li.className = "about-row";

    const lab = document.createElement("span");
    lab.className = "about-label";
    lab.textContent = `${label}:`;

    const val = document.createElement("span");
    val.className = "about-value";
    val.textContent = value;

    li.appendChild(lab);
    li.appendChild(val);

    if (verified.has(key)) {
      const badge = document.createElement("span");
      badge.className = "verified-star";
      badge.innerHTML = `<span class="star">★</span> Verified`;
      li.appendChild(badge);
    }

    aboutEl.appendChild(li);
  });
}

/* ------------------------------
   Photo
------------------------------ */
function renderPhoto(url) {
  const frame = document.getElementById("profileFrame");
  frame.innerHTML = "";
  if (!url) {
    frame.innerHTML = `<div class="placeholder"><div class="ph-emoji">📸</div><div class="ph-text">No photo</div></div>`;
    return;
  }
  const img = new Image();
  img.src = url;
  img.alt = "Profile photo";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  frame.appendChild(img);
}

/* ------------------------------
   Past Hot Guys
------------------------------ */
function renderPastHotGuys(people) {
  const wrap = document.getElementById("pastHotList");
  if (!wrap) return;

  wrap.innerHTML = "";

  const past = people
    .filter(p => p.category === "hot-history")
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (past.length === 0) {
    wrap.innerHTML = `<div class="small muted">No past Hot Guys yet.</div>`;
    return;
  }

  past.forEach(p => {
    const row = document.createElement("div");
    row.className = "hm-item";
    row.addEventListener("click", () => {
      window.location.href = `./profile.html?id=${encodeURIComponent(p.id)}`;
    });

    const thumb = document.createElement("div");
    thumb.className = "hm-thumb";
    const src = p.photoUrl || p.photoDataUrl || "";
    if (src) {
      const img = new Image();
      img.src = src;
      img.alt = p.name || "Past Hot Guy";
      thumb.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.innerHTML = `
      <p class="hm-name">${escapeHtml(p.name || "Hot Guy")}</p>
      <p class="hm-cap">${escapeHtml(p.caption || "")}</p>
      <p class="small muted" style="margin:6px 0 0;">${p.createdAt ? "Added " + escapeHtml(formatAddedDate(p.createdAt)) : ""}</p>
    `;

    row.appendChild(thumb);
    row.appendChild(meta);
    wrap.appendChild(row);
  });
}

/* ------------------------------
   Comments (with Quick Info)
------------------------------ */
function renderComments(comments) {
  const list = document.getElementById("commentList");
  list.innerHTML = "";

  if (!comments || comments.length === 0) {
    const li = document.createElement("li");
    li.className = "small muted";
    li.textContent = "No comments yet. Be the first (respectfully).";
    list.appendChild(li);
    return;
  }

  comments.forEach(c => {
    const li = document.createElement("li");
    li.className = "comment";

    const infoLine = (c.info || "").trim()
      ? `<div class="small" style="margin-top:6px;"><span class="pill" style="padding:4px 10px;">${escapeHtml(c.info)}</span></div>`
      : "";

    li.innerHTML = `
      <div class="who">${escapeHtml(c.name || "Anonymous")}</div>
      ${infoLine}
      <p class="text">${escapeHtml(c.text || "")}</p>
    `;
    list.appendChild(li);
  });
}

/* ------------------------------
   Main
------------------------------ */
function showNotFound() {
  setText("badge", "Profile");
  setText("pName", "Profile not found");
  setText("pCaption", "Go back and click a person again.");
  setText("pDate", "");
  renderPhoto("");
  renderComments([]);
  const aboutEl = document.getElementById("pAbout");
  if (aboutEl) aboutEl.innerHTML = "";
}

const id = getId();
const people = loadPeople();
const person = people.find(p => p.id === id);

renderPastHotGuys(people);

if (!id || !person) {
  showNotFound();
} else {
  setText("badge", person.badge || "Profile");
  setText("pName", person.name || "Unnamed");
  setText("pCaption", person.caption || "");

  const added = formatAddedDate(person.createdAt);
  setText("pDate", added ? `Added ${added}` : "");

  renderAboutSmart(person);
  renderPhoto(person.photoUrl || person.photoDataUrl || "");

  let comments = loadComments(id).sort((a,b) => (b.ts||0) - (a.ts||0));
  renderComments(comments);

  document.getElementById("commentForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("commentName").value.trim().slice(0, 40);
    const info = document.getElementById("commentInfo").value.trim().slice(0, 80);
    const text = document.getElementById("commentText").value.trim().slice(0, 200);
    if (!text) return;

    comments = [{ name, info, text, ts: Date.now() }, ...comments].slice(0, 300);
    saveComments(id, comments);
    renderComments(comments);
    e.target.reset();
  });
}

