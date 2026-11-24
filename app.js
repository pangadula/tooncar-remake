"use strict";

// Language: a visitor whose browser is not Polish starts on the English page,
// once; the switch in the header remembers an explicit choice.
const pageLanguage = document.documentElement.lang;
let chosen = null;
try { chosen = localStorage.getItem("tooncar-language"); } catch { /* storage may be blocked */ }
for (const link of document.querySelectorAll(".lang-switch")) {
  link.addEventListener("click", () => {
    try { localStorage.setItem("tooncar-language", link.dataset.lang); } catch { /* ignore */ }
  });
}
const browserPolish = (navigator.languages || [navigator.language || ""]).some(l => /^pl\b/i.test(l));
if (!chosen && pageLanguage === "pl" && !browserPolish && navigator.language) {
  window.location.replace("en/" + window.location.hash);
}

// File links and instructions remain usable without JavaScript.
const platform = navigator.userAgentData?.platform || navigator.platform || "";
const os = /android/i.test(platform + navigator.userAgent) ? "android" : /win/i.test(platform) ? "windows" : /linux/i.test(platform) ? "linux" : null;
if (os) {
  document.querySelector(`#download-${os} .system-match`).hidden = false;
}

// Instructions: tabs with JavaScript, every section one below another without it.
const guide = document.querySelector(".guide");
const tabs = [...guide.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));

function select(index, focus = false) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
  if (focus) tabs[index].focus();
}

guide.classList.add("tabbed");
guide.querySelector('[role="tablist"]').hidden = false;
panels.forEach(panel => panel.tabIndex = 0);
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => select(i));
  tab.addEventListener("keydown", event => {
    const last = tabs.length - 1;
    const next = {ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  });
});

// Links such as #wymagania open their tab.
function openLinkedTab() {
  const hash = window.location.hash.slice(1);
  const index = panels.findIndex(panel => panel.id === hash);
  if (index >= 0) {
    select(index);
    guide.scrollIntoView({block: "start"});
  } else if (!tabs.some(tab => tab.getAttribute("aria-selected") === "true")) {
    select(0);
  }
}
window.addEventListener("hashchange", openLinkedTab);
openLinkedTab();
