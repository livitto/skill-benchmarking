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
const explainEl = document.getElementById("explain");
const chartCanvas = document.getElementById("chart");

let chart = new Chart(chartCanvas, {
  type: "doughnut",
  data: { labels: ["Covered", "Uncovered"], datasets: [{ data: [0, totalWeight], backgroundColor:["#22c55e","#334155"], borderColor:["#16a34a","#1f2937"], borderWidth:1 }] },
  options: { cutout: '60%', animation: false, plugins: { legend: { labels: { color: "#e5e7eb" } } } }
});

function renderSkills(){
  let html = "";
  skills.forEach((s, idx) => {
    const id = `skill_${idx}`;
    html += `<label for="${id}" class="${s.has ? 'selected' : ''}"><input id="${id}" name="skills" type="checkbox" data-idx="${idx}" ${s.has ? 'checked' : ''}/> ${s.name.replaceAll('_',' ')}</label>`;
  });
  skillsContainer.innerHTML = html;
}

skillsContainer.addEventListener("change", (event) => {
  const target = event.target;
  if (target && target.matches('input[type="checkbox"]')) {
    const idx = Number(target.dataset.idx);
    if (!Number.isNaN(idx)) {
      skills[idx].has = target.checked;
      const label = target.closest('label');
      if (label) {
        if (target.checked) label.classList.add('selected');
        else label.classList.remove('selected');
      }
    }
  }
});

skillsContainer.addEventListener("click", (event) => {
  const label = event.target.closest('label');
  if (!label) return;
  const input = label.querySelector('input[type="checkbox"]');
  if (!input) return;
  input.checked = !input.checked;
  const idx = Number(input.dataset.idx);
  if (!Number.isNaN(idx)) {
    skills[idx].has = input.checked;
    label.classList.toggle('selected', input.checked);
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

  const topMissing = skills
    .filter(s => !s.has)
    .sort((a, b) => b.weight - a.weight)[0];
  missingListEl.innerText = topMissing
    ? "Top missing skill: " + topMissing.name.replaceAll('_',' ')
    : "All skills covered";

  explainEl.innerText = `Raw coverage counts how many skills are selected (${selectedCount} of ${totalSkills}). Weighted coverage sums the importance of selected skills (${coveredWeight.toFixed(2)} of ${totalWeight.toFixed(2)} total weight).`;
}

computeButton.onclick = compute;
renderSkills();
