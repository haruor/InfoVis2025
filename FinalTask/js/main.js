// main.js
let input_data = [];
let scatter_plot = null;
let bar_chart = null;

// linked views state (W12 pattern)
window.filter = [];     // selected spectral classes e.g., ['G','M']
window.Filter = Filter; // make callable from BarChart

function toSpecClass(st_spectype) {
  if (!st_spectype) return "Other";
  const s = String(st_spectype).trim().toUpperCase();
  if (s.length === 0) return "Other";
  const c = s[0];
  return ["F", "G", "K", "M"].includes(c) ? c : "Other";
}

function showOtherEnabled() {
  const el = document.getElementById("show-other");
  return el ? el.checked : false;
}

// Apply current filter to scatter plot data
function Filter() {
  if (!scatter_plot) return;

  let base = input_data;

  // Other ON/OFF
  if (!showOtherEnabled()) {
    base = base.filter(d => d.spec_class !== "Other");
  }

  const active = window.filter || [];
  if (active.length === 0) {
    scatter_plot.setData(base);
  } else {
    scatter_plot.setData(base.filter(d => active.includes(d.spec_class)));
  }
  scatter_plot.update();
}

// ---------- Load static data ----------
d3.csv("data/exoplanets_static.csv")
  .then(data => {
    // Convert + add spec_class (IMPORTANT)
    data.forEach(d => {
      d.pl_name = d.pl_name;
      d.pl_rade = +d.pl_rade;
      d.pl_eqt = +d.pl_eqt;
      d.pl_orbper = +d.pl_orbper;
      d.st_spectype = d.st_spectype;
      d.spec_class = toSpecClass(d.st_spectype);
    });

    // remove rows that would break scatter plot
    input_data = data.filter(d => Number.isFinite(d.pl_rade) && Number.isFinite(d.pl_eqt));

    // init views
    scatter_plot = new ScatterPlot(
      {
        parent: "#drawing_region_scatterplot",
        width: 520,
        height: 420,
        margin: { top: 20, right: 20, bottom: 55, left: 65 }
      },
      input_data
    );

    bar_chart = new BarChart(
      {
        parent: "#drawing_region_barchart",
        width: 300,
        height: 420,
        margin: { top: 20, right: 20, bottom: 55, left: 60 }
      },
      input_data
    );

    scatter_plot.update();
    bar_chart.update();
    Filter();

    // ---------- UI events ----------
    document.getElementById("reverse")?.addEventListener("click", () => {
      bar_chart?.reverseOrder();
    });

    document.getElementById("show-other")?.addEventListener("change", () => {
      bar_chart?.update();
      Filter();
    });

    document.getElementById("fetch-latest")?.addEventListener("click", fetchLatestFromTAP);
  })
  .catch(err => console.error(err));

// ---------- Live fetch from TAP (simple + robust) ----------
async function fetchLatestFromTAP() {
  try {
    const adql = `
      SELECT TOP 2000
        pl_name, pl_rade, pl_eqt, pl_orbper, st_spectype
      FROM ps
      WHERE pl_rade IS NOT NULL AND pl_eqt IS NOT NULL
    `.trim();

    const url =
      "https://exoplanetarchive.ipac.caltech.edu/TAP/sync" +
      "?query=" + encodeURIComponent(adql) +
      "&format=json";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TAP fetch failed: ${res.status}`);

    const json = await res.json();

    // some TAP services return {data:[...]} ; try both
    const rows = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn("No rows from TAP or unexpected JSON format.");
      return;
    }

    const live = rows
      .map(d => ({
        pl_name: d.pl_name,
        pl_rade: +d.pl_rade,
        pl_eqt: +d.pl_eqt,
        pl_orbper: +d.pl_orbper,
        st_spectype: d.st_spectype,
        spec_class: toSpecClass(d.st_spectype)
      }))
      .filter(d => Number.isFinite(d.pl_rade) && Number.isFinite(d.pl_eqt));

    // replace dataset with live
    input_data = live;

    scatter_plot?.setData(input_data);
    bar_chart?.setData(input_data);

    bar_chart?.update();
    Filter();
  } catch (e) {
    console.error(e);
    // graceful fallback: keep static data
  }
}
