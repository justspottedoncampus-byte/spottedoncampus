const STORAGE_KEY = "ms_people_v1";
const $ = (sel) => document.querySelector(sel);

function safeParse(json, fallback) { try { return JSON.parse(json); } catch { return fallback; } }
function loadPeople() { return safeParse(localStorage.getItem(STORAGE_KEY) || "[]", []); }
function savePeople(people) { localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); }
function makeId() { return "u-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16); }

function seedIfEmpty() {
  const existing = loadPeople();
  if (existing.length > 0) return;

  const seeded = [
    {
      id: "hotguy-mathew", category: "hot", badge: "Hot Guy of the Week", name: "Mathew",
      caption: "Spotted between classes",
      about: ["Major: BMOS", "Year: 2nd", "Age: (optional)"],
      photoUrl:"./images/mathew.jpg", createdAt:Date.now()
    },
    { id:"hotguy-damson", category:"hot-history", badge:"Past Hot Guy", name:"Damson",
      caption:"save a horse, ride a mustang 🐎",
      aboutFields: { age: "21", major: "BMOS", year: "3rd" },
      photoUrl:"./images/damson.jpg", createdAt:Date.now()
    },
    { id:"hm-theo", category:"honorable", badge:"Honorable Mention", name:"Theo",
      caption:" ",
      about:["Age: (optional)", "Major: (optional)", "Year: (optional)"],
      photoUrl:"./images/theo.jpg", createdAt:Date.now()
    },
    { id:"p-martin", category:"other", badge:"Profile", name:"Martin",
      caption:"",
      about:["Age: (optional)", "Major: (optional)", "Year: (optional)"],
      photoUrl:"./images/martin.jpg", createdAt:Date.now()
    },
    { id:"p-callum", category:"other", badge:"Profile", name:"Callum",
      caption:"",
      about:["Age: (optional)", "Major: (optional)", "Year: (optional)"],
      photoUrl:"./images/callum.jpg", createdAt:Date.now()
    },
    { id:"p-jacob", category:"other", badge:"Profile", name:"Jacob",
      caption:"",
      about:["Age: (optional)", "Major: (optional)", "Year: (optional)"],
      photoUrl:"./images/jacob.jpg", createdAt:Date.now()
    },
    { id:"p-keith", category:"other", badge:"Profile", name:"Keith",
      caption:"",
      about:["Age: (optional)", "Major: (optional)", "Year: (optional)"],
      photoUrl:"./images/keith.jpg", createdAt:Date.now()
    }
  ];

  savePeople(seeded);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

/* QR */
(function initQR() {
  const url = `${location.origin}${location.pathname}#submit`;
  $("#qrUrlText").textContent = url;

  const img = new Image();
  img.alt = "QR code";
  img.width = 170;
  img.height = 170;
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(url)}`;

  $("#qrBox").innerHTML = "";
  $("#qrBox").appendChild(img);
})();

/* Mount simple cropper for preview */
function mountCropper(frameId, zoomId, resetId) {
  const frame = document.getElementById(frameId);
  const zoom = document.getElementById(zoomId);
  const reset = document.getElementById(resetId);

  let img = null;
  let dragging = false;
  let startX = 0, startY = 0;
  let px = 0, py = 0;

  function apply() {
    if (!img) return;
    img.style.transform = `translate(${px}px, ${py}px) scale(${zoom.value})`;
  }

  function setImage(newImg) {
    img = newImg;
    px = 0; py = 0;
    zoom.value = 1;
    apply();

    img.onmousedown = (e) => {
      dragging = true;
      startX = e.clientX - px;
      startY = e.clientY - py;
    };

    window.onmousemove = (e) => {
      if (!dragging) return;
      px = e.clientX - startX;
      py = e.clientY - startY;
      apply();
    };

    window.onmouseup = () => dragging = false;
  }

  zoom.oninput = apply;
  reset.onclick = () => {
    px = 0; py = 0;
    zoom.value = 1;
    apply();
  };

  return { setImage };
}

/* Load Hot + HM into index */
function renderMain() {
  const people = loadPeople();
  const hot = people.find(p => p.category === "hot") || people.find(p => p.id === "hotguy-damson");
  const hms = people.filter(p => p.category === "honorable");

  // Hot card content
  if (hot) {
    $("#featuredName").textContent = hot.name || "Hot Guy";
    $("#featuredCaption").textContent = hot.caption || "";

    const aboutEl = $("#featuredAbout");
    aboutEl.innerHTML = "";
    (hot.about || []).forEach(line => {
      const li = document.createElement("li");
      li.textContent = line;
      aboutEl.appendChild(li);
    });

    const frame = $("#featuredFrame");
    frame.innerHTML = "";
    const src = hot.photoUrl || hot.photoDataUrl || "";
    if (src) {
      const img = new Image();
      img.src = src;
      img.alt = hot.name || "Hot Guy";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      frame.appendChild(img);
    } else {
      frame.innerHTML = `<div class="placeholder"><div class="ph-emoji">📸</div><div class="ph-text">No photo</div></div>`;
    }

    $("#openHotProfile").href = `./profile.html?id=${encodeURIComponent(hot.id)}`;
  }

  // Honorable mentions list
  const hmList = $("#hmList");
  hmList.innerHTML = "";

  if (hms.length === 0) {
    hmList.innerHTML = `<div class="small muted">No honorable mentions yet.</div>`;
    return;
  }

  hms.forEach(p => {
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
      img.alt = p.name || "Mention";
      thumb.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.innerHTML = `
      <p class="hm-name">${escapeHtml(p.name || "Honorable Mention")}</p>
      <p class="hm-cap">${escapeHtml(p.caption || "")}</p>
    `;

    row.appendChild(thumb);
    row.appendChild(meta);
    hmList.appendChild(row);
  });
}

seedIfEmpty();
renderMain();

/* Submit + Preview */
const caption = $("#caption");
const capCount = $("#capCount");
const nameInput = $("#name");
const handleInput = $("#handle");
const photoInput = $("#photo");

const previewName = $("#previewName");
const previewHandle = $("#previewHandle");
const previewCaption = $("#previewCaption");
const previewTime = $("#previewTime");
const result = $("#result");

let submittedPhotoDataUrl = "";

function updatePreviewText() {
  previewName.textContent = nameInput.value.trim() || "Name / Nickname";
  const h = handleInput.value.trim();
  previewHandle.textContent = h ? (h.startsWith("@") ? h : `@${h}`) : "@handle";
  previewCaption.textContent = caption.value.trim() || "Caption preview…";
  previewTime.textContent = "just now";
}

caption.addEventListener("input", () => {
  capCount.textContent = String(caption.value.length);
  updatePreviewText();
});
nameInput.addEventListener("input", updatePreviewText);
handleInput.addEventListener("input", updatePreviewText);
updatePreviewText();

const previewCrop = mountCropper("previewFrame", "previewZoom", "previewReset");

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    submittedPhotoDataUrl = String(reader.result || "");
    const frame = $("#previewFrame");
    frame.innerHTML = "";

    const img = new Image();
    img.src = submittedPhotoDataUrl;
    img.alt = "Preview";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    frame.appendChild(img);

    previewCrop.setImage(img);
  };
  reader.readAsDataURL(file);
});

$("#submitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!$("#consent").checked) return;

  const displayName = nameInput.value.trim() || "Anonymous Mustang";
  const cap = caption.value.trim();

  const ig = handleInput.value.trim();
  const igLine = ig ? `IG: ${ig.startsWith("@") ? ig : "@" + ig}` : "IG: (optional)";

  // Stored as pending (not shown on profiles.html, but saved for future admin tools)
  const newPerson = {
    id: makeId(),
    category: "pending",
    badge: "Pending",
    name: displayName,
    caption: cap,
    about: [igLine],
    photoDataUrl: submittedPhotoDataUrl || "",
    createdAt: Date.now()
  };

  const people = loadPeople();
  people.push(newPerson);
  savePeople(people);

  result.style.display = "block";
  result.textContent = "Submitted! (Saved locally.)";

  // Clear form after submit (optional)
  // e.target.reset();
});

$("#clearBtn").addEventListener("click", () => {
  nameInput.value = "";
  handleInput.value = "";
  caption.value = "";
  photoInput.value = "";
  submittedPhotoDataUrl = "";
  $("#consent").checked = false;
  capCount.textContent = "0";

  $("#previewFrame").innerHTML = `
    <div class="placeholder">
      <div class="ph-emoji">🫶</div>
      <div class="ph-text">Your preview will show here</div>
    </div>
  `;
  result.style.display = "none";
  result.textContent = "";
  updatePreviewText();
});

/* Removal form (demo) */
const rDetails = $("#rDetails");
const remCount = $("#remCount");
const removeResult = $("#removeResult");

rDetails.addEventListener("input", () => {
  remCount.textContent = String(rDetails.value.length);
});

$("#removeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  removeResult.style.display = "block";
  removeResult.textContent = "Removal request submitted (demo).";
  e.target.reset();
  remCount.textContent = "0";
});
