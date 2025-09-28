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
const swatches = document.querySelectorAll('.swatch');
const downloadBtn = document.getElementById('downloadPdf');
const colorTrigger = document.getElementById('colorTrigger');
const colorMenu = document.getElementById('colorMenu');

function setAccent(color){
  document.documentElement.style.setProperty('--accent', color);
  if (chart) {
    chart.data.datasets[0].backgroundColor = [color, "#334155"];
    chart.data.datasets[0].borderColor = [shadeColor(color, -12), "#1f2937"];
    chart.update("none");
  }
  localStorage.setItem('accentColor', color);
  swatches.forEach(s=> s.classList.toggle('active', s.dataset.color===color));
}

function shadeColor(hex, percent){
  const num=parseInt(hex.replace('#',''),16);
  let r=(num>>16)&255, g=(num>>8)&255, b=num&255;
  r=Math.max(0,Math.min(255,Math.floor(r*(100+percent)/100)));
  g=Math.max(0,Math.min(255,Math.floor(g*(100+percent)/100)));
  b=Math.max(0,Math.min(255,Math.floor(b*(100+percent)/100)));
  return '#' + (1<<24 | (r<<16) | (g<<8) | b).toString(16).slice(1);
}

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

// Accent init
const savedAccent = localStorage.getItem('accentColor');
if (savedAccent) setAccent(savedAccent);
swatches.forEach(s=> s.addEventListener('click', ()=> setAccent(s.dataset.color)));
// Toggle color menu
colorTrigger?.addEventListener('click', ()=>{
  const isOpen = !colorMenu.hasAttribute('hidden');
  if (isOpen) {
    colorMenu.setAttribute('hidden','');
    colorTrigger.setAttribute('aria-expanded','false');
  } else {
    colorMenu.removeAttribute('hidden');
    colorTrigger.setAttribute('aria-expanded','true');
  }
});
document.addEventListener('click', (e)=>{
  if (!colorMenu || !colorTrigger) return;
  if (colorMenu.contains(e.target) || colorTrigger.contains(e.target)) return;
  if (!colorMenu.hasAttribute('hidden')){
    colorMenu.setAttribute('hidden','');
    colorTrigger.setAttribute('aria-expanded','false');
  }
});

// PDF download
downloadBtn?.addEventListener('click', async ()=>{
  const { jsPDF } = window.jspdf || {};
  const main = document.getElementById('main');
  if (!main || !window.html2canvas || !jsPDF) return;
  const canvas = await window.html2canvas(main, { backgroundColor: '#0f172a', scale: 1 });
  // Downscale if needed to bound pixel dimensions (helps file size)
  const MAX_SIDE = 1600; // px
  let workCanvas = canvas;
  if (Math.max(canvas.width, canvas.height) > MAX_SIDE) {
    const scale = MAX_SIDE / Math.max(canvas.width, canvas.height);
    const tmp = document.createElement('canvas');
    tmp.width = Math.floor(canvas.width * scale);
    tmp.height = Math.floor(canvas.height * scale);
    const ctx = tmp.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
    workCanvas = tmp;
  }
  // JPEG quality ladder targeting < 0.95 MB
  const targetBytes = 950 * 1024;
  const dataUrlBytes = (d) => {
    const b64 = d.split(',')[1] || '';
    return atob(b64).length;
  };
  let quality = 0.75;
  let imgData = workCanvas.toDataURL('image/jpeg', quality);
  let guard = 0;
  while (dataUrlBytes(imgData) > targetBytes && quality > 0.2 && guard < 10) {
    quality -= 0.1;
    imgData = workCanvas.toDataURL('image/jpeg', quality);
    guard++;
  }
  // If still too big, downscale further by 90% and retry at last quality
  guard = 0;
  while (dataUrlBytes(imgData) > targetBytes && guard < 3) {
    const tmp = document.createElement('canvas');
    tmp.width = Math.floor(workCanvas.width * 0.9);
    tmp.height = Math.floor(workCanvas.height * 0.9);
    const ctx = tmp.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(workCanvas, 0, 0, tmp.width, tmp.height);
    workCanvas = tmp;
    imgData = workCanvas.toDataURL('image/jpeg', quality);
    guard++;
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / workCanvas.width, pageHeight / workCanvas.height);
  const imgWidth = workCanvas.width * ratio;
  const imgHeight = workCanvas.height * ratio;
  const x = (pageWidth - imgWidth) / 2;
  const y = 36;
  pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
  // Add timestamp footer
  const ts = new Date().toLocaleString();
  pdf.setFontSize(10);
  pdf.setTextColor('#6b7280');
  pdf.text(`Generated: ${ts}`, pageWidth - 24, pageHeight - 16, { align: 'right' });
  pdf.save('skill_coverage_report.pdf');
});
