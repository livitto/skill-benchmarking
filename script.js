// Default demo dataset
let skills = [
  {name:"figma", weight:0.10, has:false},
  {name:"wireframing", weight:0.06, has:false},
  {name:"prototyping", weight:0.08, has:false},
  {name:"usability_testing", weight:0.08, has:false},
  {name:"heuristic_evaluation", weight:0.05, has:false},
  {name:"user_interviews", weight:0.07, has:false},
  {name:"accessibility", weight:0.06, has:false},
  {name:"html_css", weight:0.05, has:false},
  {name:"javascript", weight:0.04, has:false},
  {name:"python", weight:0.04, has:false},
  {name:"sql", weight:0.03, has:false},
  {name:"ab_testing", weight:0.04, has:false},
  {name:"data_visualization", weight:0.03, has:false}
];

const totalWeight = skills.reduce((acc, s) => acc + s.weight, 0);
const totalSkills = skills.length;

const skillsContainer = document.getElementById("skills");
const computeButton = document.getElementById("compute");
const rawPctEl = document.getElementById("rawPct");
const weightedPctEl = document.getElementById("wPct");
const missingListEl = document.getElementById("missingList");
const chartCanvas = document.getElementById("chart");

let chart = new Chart(chartCanvas, {
  type: "doughnut",
  data: { labels: ["Covered", "Uncovered"], datasets: [{ data: [0, totalWeight] }] },
  options: { animation: false, plugins: { legend: { labels: { color: "#e5e7eb" } } } }
});

function renderSkills(){
  let html = "";
  skills.forEach((s, idx) => {
    html += `<label><input type="checkbox" data-idx="${idx}"/> ${s.name} (${s.weight})</label>`;
  });
  skillsContainer.innerHTML = html;
}

skillsContainer.addEventListener("change", (event) => {
  const target = event.target;
  if (target && target.matches('input[type="checkbox"]')) {
    const idx = Number(target.dataset.idx);
    if (!Number.isNaN(idx)) {
      skills[idx].has = target.checked;
    }
  }
});

function compute(){
  let selectedCount = 0;
  let coveredWeight = 0;
  for (const s of skills) {
    if (s.has) {
      selectedCount++;
      coveredWeight += s.weight;
    }
  }

  const raw = selectedCount / totalSkills;
  const weighted = coveredWeight / totalWeight;

  rawPctEl.innerText = (raw * 100).toFixed(1) + "%";
  weightedPctEl.innerText = (weighted * 100).toFixed(1) + "%";

  const uncoveredWeight = totalWeight - coveredWeight;
  chart.data.datasets[0].data = [coveredWeight, uncoveredWeight];
  chart.update("none");

  const miss = skills
    .filter(s => !s.has)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
  missingListEl.innerText = "Top missing: " + miss.map(m => m.name).join(", ");
}

computeButton.onclick = compute;
renderSkills();
