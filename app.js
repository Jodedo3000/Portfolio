// app.js — renders the portfolio from window data. No framework, no build step.
(function () {
  "use strict";

  var PROFILE = window.PROFILE,
      USE_CASES = window.USE_CASES,
      TECH = window.TECH,
      BUILD_TOOLS = window.BUILD_TOOLS,
      PROJECTS = window.PROJECTS,
      EXPERIENCE = window.EXPERIENCE,
      EDUCATION = window.EDUCATION;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (e) { return url; }
  }

  /* ---------- icons ---------- */
  var IconLinkedIn = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z"/></svg>';
  var IconGitHub = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>';
  var IconMail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>';

  function socials(cls) {
    var l = PROFILE.links || {};
    var out = "";
    if (l.linkedin) out += '<a class="soc" href="' + esc(l.linkedin) + '" target="_blank" rel="noreferrer" aria-label="LinkedIn">' + IconLinkedIn + "</a>";
    if (l.github) out += '<a class="soc" href="' + esc(l.github) + '" target="_blank" rel="noreferrer" aria-label="GitHub">' + IconGitHub + "</a>";
    return '<div class="' + cls + '">' + out + "</div>";
  }

  /* ---------- taxonomy helpers ---------- */
  function orderedCats(dim) {
    if (dim === "buildTool") return BUILD_TOOLS.filter(function (t) { return PROJECTS.some(function (p) { return p.buildTool === t; }); });
    return Object.keys(USE_CASES).filter(function (u) { return PROJECTS.some(function (p) { return p.useCase === u; }); });
  }
  function labelFor(dim, c) { return dim === "useCase" ? USE_CASES[c].label : TECH[c].label; }
  function colorFor(dim, c) { return dim === "buildTool" ? TECH[c].color : USE_CASES[c].accent; }
  function keyOf(p, dim) { return dim === "useCase" ? p.useCase : p.buildTool; }
  function sortFeatured(arr) { return arr.slice().sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); }); }

  /* ---------- shared bits ---------- */
  function chip(label, color) {
    return '<span class="chip">' + (color ? '<span class="chip-dot" style="background:' + color + '"></span>' : "") + esc(label) + "</span>";
  }
  function stackRow(p, max) {
    var chips = [];
    var bt = TECH[p.buildTool];
    if (bt) chips.push(chip(bt.label, bt.color));
    (p.stack || []).forEach(function (tag) {
      if (bt && tag.toLowerCase() === bt.label.toLowerCase()) return;
      chips.push(chip(tag, null));
    });
    var rest = 0;
    if (max && chips.length > max) { rest = chips.length - max; chips = chips.slice(0, max); }
    return '<div class="stack-row">' + chips.join("") + (rest ? '<span class="chip chip-more">+' + rest + "</span>" : "") + "</div>";
  }
  function meta(p) {
    return '<div class="meta"><span class="meta-cat">' + esc(USE_CASES[p.useCase].label) + "</span>" +
      '<span class="meta-sep">/</span>' +
      '<span class="status status-' + p.status.toLowerCase() + '">' + esc(p.status) + "</span></div>";
  }
  function linksRow(p) {
    var l = p.links || {}, html = "";
    if (l.live) html += '<a href="' + esc(l.live) + '" target="_blank" rel="noreferrer" class="lnk">' + esc(l.liveLabel || "Live") + ' <span aria-hidden="true">↗</span></a>';
    if (l.github) html += '<a href="' + esc(l.github) + '" target="_blank" rel="noreferrer" class="lnk lnk-ghost">Code</a>';
    return html ? '<div class="links">' + html + "</div>" : "";
  }
  function preview(p, ratio) {
    ratio = ratio || "16 / 10";
    var url = (p.links && p.links.live) ? hostOf(p.links.live) : p.id + ".app";
    return '<div class="pv" style="aspect-ratio:' + ratio + '">' +
      '<div class="pv-bar"><span class="pv-dot"></span><span class="pv-dot"></span><span class="pv-dot"></span><span class="pv-url">' + esc(url) + "</span></div>" +
      '<div class="pv-body"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + ' screenshot" loading="lazy"></div>' +
      "</div>";
  }

  /* ---------- slab card ---------- */
  function slab(p, i) {
    var accent = USE_CASES[p.useCase].accent;
    return '<article class="slab card ' + (i % 2 ? "slab-flip" : "") + '" data-open="' + esc(p.id) + '" style="--accent:' + accent + '">' +
      '<div class="slab-media">' + preview(p) + "</div>" +
      '<div class="slab-body">' +
        '<span class="kicker">' + pad(i + 1) + " · " + esc(USE_CASES[p.useCase].label) + "</span>" +
        '<h3 class="slab-title">' + esc(p.title) + "</h3>" +
        '<p class="slab-tag">' + esc(p.tagline) + "</p>" +
        '<p class="slab-desc">' + esc(p.long) + "</p>" +
        stackRow(p, 6) +
        '<div class="slab-foot">' + meta(p) + linksRow(p) + "</div>" +
      "</div>" +
    "</article>";
  }

  /* ---------- projects section ---------- */
  var state = { dim: "useCase", filter: "all" };

  function controlsHTML() {
    var dim = state.dim;
    var cats = orderedCats(dim);
    var chips = '<button class="fchip' + (state.filter === "all" ? " on" : "") + '" data-filter="all">All <span class="fchip-count">' + PROJECTS.length + "</span></button>";
    cats.forEach(function (c) {
      var count = PROJECTS.filter(function (p) { return keyOf(p, dim) === c; }).length;
      chips += '<button class="fchip' + (state.filter === c ? " on" : "") + '" data-filter="' + esc(c) + '">' +
        (dim === "buildTool" ? '<span class="fdot" style="background:' + colorFor(dim, c) + '"></span>' : "") +
        esc(labelFor(dim, c)) + ' <span class="fchip-count">' + count + "</span></button>";
    });
    return '<div class="pj-controls">' +
      '<div class="pj-controls-row"><div class="seg-group"><span class="seg-label">Browse by</span>' +
        '<div class="seg" role="tablist" aria-label="Browse dimension">' +
          '<button class="' + (dim === "useCase" ? "on" : "") + '" data-dim="useCase">Use case</button>' +
          '<button class="' + (dim === "buildTool" ? "on" : "") + '" data-dim="buildTool">Technology</button>' +
        "</div></div></div>" +
      '<div class="chips-filter">' + chips + "</div>" +
    "</div>";
  }

  function groupsHTML() {
    var dim = state.dim;
    var cats = orderedCats(dim);
    var visible = state.filter === "all" ? cats : [state.filter];
    var html = "";
    visible.forEach(function (c) {
      var items = sortFeatured(PROJECTS.filter(function (p) { return keyOf(p, dim) === c; }));
      if (!items.length) return;
      html += '<div class="group">' +
        '<div class="group-head"><h3><span class="group-dot" style="background:' + colorFor(dim, c) + '"></span>' + esc(labelFor(dim, c)) + "</h3>" +
        '<span class="group-count">' + items.length + " project" + (items.length > 1 ? "s" : "") + "</span>" +
        '<span class="group-line"></span></div>' +
        '<div class="slabs">' + items.map(slab).join("") + "</div>" +
      "</div>";
    });
    return html;
  }

  function renderProjects() {
    document.getElementById("pj-controls-mount").innerHTML = controlsHTML();
    document.getElementById("pj-groups-mount").innerHTML = groupsHTML();
  }

  /* ---------- modal ---------- */
  function modalHTML(p) {
    var l = p.links || {};
    var cta = "";
    if (l.live) cta += '<a href="' + esc(l.live) + '" target="_blank" rel="noreferrer" class="btn btn-primary">' + esc(l.liveLabel || "Visit live") + ' <span aria-hidden="true">↗</span></a>';
    if (l.github) cta += '<a href="' + esc(l.github) + '" target="_blank" rel="noreferrer" class="btn btn-ghost">View code</a>';

    var side =
      '<div class="ms-block"><span class="ms-label">Built with</span>' + stackRow(p) + "</div>" +
      (p.role ? '<div class="ms-block"><span class="ms-label">My role</span><p class="ms-val">' + esc(p.role) + "</p></div>" : "") +
      (p.outcome ? '<div class="ms-block"><span class="ms-label">Outcome</span><p class="ms-val ms-outcome">' + esc(p.outcome) + "</p></div>" : "") +
      '<div class="ms-block ms-meta"><div><span class="ms-label">Category</span><p class="ms-val">' + esc(USE_CASES[p.useCase].label) + "</p></div>" +
        '<div><span class="ms-label">Status</span><p class="ms-val status status-' + p.status.toLowerCase() + '">' + esc(p.status) + "</p></div></div>";

    return '<div class="modal-scrim" data-close="1">' +
      '<div class="modal" style="--accent:' + USE_CASES[p.useCase].accent + '" role="dialog" aria-modal="true">' +
        '<button class="modal-x" data-close="1" aria-label="Close">✕</button>' +
        '<div class="modal-hero">' + preview(p, "16 / 9") + "</div>" +
        '<div class="modal-body">' +
          '<div class="modal-head"><div><span class="kicker">' + esc(USE_CASES[p.useCase].label) + "</span>" +
            '<h2 class="modal-title">' + esc(p.title) + "</h2>" +
            '<p class="modal-tag">' + esc(p.tagline) + "</p></div>" +
            (cta ? '<div class="modal-cta">' + cta + "</div>" : "") + "</div>" +
          '<div class="modal-grid"><div class="modal-main">' +
            '<p class="modal-lead">' + esc(p.short) + "</p>" +
            '<p class="modal-long">' + esc(p.long) + "</p></div>" +
            '<aside class="modal-side">' + side + "</aside></div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  var modalMount = null;
  function openModal(id) {
    var p = PROJECTS.find(function (x) { return x.id === id; });
    if (!p) return;
    modalMount.innerHTML = modalHTML(p);
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modalMount.innerHTML = "";
    document.body.style.overflow = "";
  }

  /* ---------- static sections ---------- */
  function navHTML() {
    return '<nav class="nav"><div class="wrap nav-inner">' +
      '<a href="#top" class="logo">' + esc(PROFILE.initials) + "</a>" +
      '<div class="nav-links">' +
        '<a href="#about">About</a><a href="#projects">Projects</a><a href="#experience">Experience</a>' +
        '<a href="#contact" class="nav-cta">Let\'s talk</a>' +
      "</div></div></nav>";
  }
  function heroHTML() {
    return '<header class="hero wrap" id="top"><div class="hero-grid"><div>' +
      '<span class="kicker">' + esc(PROFILE.kicker) + "</span>" +
      "<h1>Product Builder, <em>Vibe Coder</em>, Product Manager</h1>" +
      '<p class="hero-lede">Twenty years shipping products used by millions, now building the things I imagine myself, end to end. A showcase of AI experiments, tools, and apps made with modern agentic workflows and a lot of rapid prototyping.</p>' +
      '<div class="hero-actions">' +
        '<a href="#contact" class="btn btn-primary">' + IconMail + " Let's talk</a>" +
        '<a href="#projects" class="btn btn-ghost">See projects ↓</a>' +
      "</div>" + socials("hero-socials") + "</div>" +
      '<div class="hero-portrait">' +
        '<img class="hero-photo" src="' + esc(PROFILE.photo) + '" alt="' + esc(PROFILE.name) + '">' +
        '<span class="hero-tag">~ build · ship · repeat</span>' +
      "</div></div></header>";
  }
  function aboutHTML() {
    return '<section class="about section" id="about"><div class="wrap about-grid">' +
      '<div><span class="section-eyebrow">About</span><h2 class="section-title" style="margin-top:14px">The short version</h2></div>' +
      '<div class="about-body">' +
        "<p>I'm a product manager by craft and curiosity. Originally from Germany, based in London for the last twenty years. I've worked at <strong>Microsoft</strong>, <strong>Yahoo</strong>, and several smaller fast-moving teams, shipping products used by hundreds of millions of people across more than fifty markets, and collaborating with hundreds of colleagues across a wide mix of cultures.</p>" +
        "<p>My background is in <strong>psychology</strong>, which shapes how I lead and how I read people and problems. I'm at my best bringing clarity to messy situations, helping teams regroup, and moving work forward with a sense of purpose and momentum.</p>" +
        "<p>Lately my focus has been the AI-native frontier: force-multiplying every part of the product lifecycle, automating the boring processes, and prototyping things that used to need a whole team. <strong>Vibe-coding</strong> is genuinely where I'm happiest right now.</p>" +
        '<div class="about-stats">' +
          '<div><div class="stat-n">20<span style="color:var(--accent)">+</span></div><div class="stat-l">Years in product</div></div>' +
          '<div><div class="stat-n">50+</div><div class="stat-l">Markets shipped to</div></div>' +
          '<div><div class="stat-n">' + PROJECTS.length + '</div><div class="stat-l">Shipped side-projects</div></div>' +
        "</div></div></div></section>";
  }
  function projectsHTML() {
    return '<section class="projects section" id="projects"><div class="wrap">' +
      '<div class="section-head"><div><span class="section-eyebrow">Featured Projects</span>' +
        '<h2 class="section-title" style="margin-top:12px">Things I\'ve built</h2>' +
        '<p class="section-sub">A collection of AI-powered experiments and applications. Browse them by what they do, or by what they\'re made with.</p></div></div>' +
      '<div id="pj-controls-mount"></div><div id="pj-groups-mount"></div>' +
    "</div></section>";
  }
  function experienceHTML() {
    var xp = EXPERIENCE.map(function (x) {
      return '<article class="xp"><div class="xp-when"><span class="xp-org">' + esc(x.org) + "</span>" +
        '<span class="xp-period">' + esc(x.period) + "</span></div>" +
        '<div><h3 class="xp-role">' + esc(x.role) + "</h3>" +
        '<ul class="xp-bullets">' + x.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul></div></article>";
    }).join("");
    return '<section class="experience section" id="experience"><div class="wrap">' +
      '<div class="section-head"><div><span class="section-eyebrow">Experience</span>' +
        '<h2 class="section-title" style="margin-top:12px">Two decades in product</h2></div></div>' +
      '<div class="xp-list">' + xp + "</div>" +
      '<div class="edu"><div class="xp-when"><span class="xp-org">Education</span></div>' +
        '<div><h3 class="edu-school">' + esc(EDUCATION.school) + "</h3>" +
        '<p class="edu-degree">' + esc(EDUCATION.degree) + " · " + esc(EDUCATION.period) + "</p></div></div>" +
    "</div></section>";
  }
  function contactHTML() {
    return '<section class="contact" id="contact"><div class="wrap">' +
      '<span class="section-eyebrow">Get in touch</span>' +
      "<h2>Let's build<br>something.</h2>" +
      "<p>Interested in collaborating or just want to say hi? I'd love to hear from you.</p>" +
      '<div class="contact-actions"><a class="btn btn-primary" href="mailto:' + esc(PROFILE.email) + '">' + IconMail + " " + esc(PROFILE.email) + "</a></div>" +
      socials("contact-socials") +
      "</div>" +
      '<div class="wrap foot"><span>© 2026 ' + esc(PROFILE.name) + "</span><span>Built with vibes · " + esc(PROFILE.location) + "</span></div>" +
    "</section>";
  }

  /* ---------- mount ---------- */
  function init() {
    var root = document.getElementById("root");
    root.innerHTML = navHTML() + heroHTML() + aboutHTML() + projectsHTML() + experienceHTML() + contactHTML();
    modalMount = document.createElement("div");
    document.body.appendChild(modalMount);
    renderProjects();

    document.addEventListener("click", function (e) {
      var t = e.target;
      var dimBtn = t.closest("[data-dim]");
      if (dimBtn) { state.dim = dimBtn.getAttribute("data-dim"); state.filter = "all"; renderProjects(); return; }
      var fBtn = t.closest("[data-filter]");
      if (fBtn) { state.filter = fBtn.getAttribute("data-filter"); renderProjects(); return; }
      if (t.closest("[data-close]")) { closeModal(); return; }
      if (t.closest("a")) return; // let real links work, don't open modal
      var card = t.closest("[data-open]");
      if (card) { openModal(card.getAttribute("data-open")); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
