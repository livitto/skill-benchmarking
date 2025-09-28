cat > script.js <<'EOF'
let skills = [
  {name:"figma", weight:0.1, has:false},
  {name:"usability_testing", weight:0.08, has:false},
  {name:"python", weight:0.05, has:false},
  {name:"accessibility", weight:0.06, has:false},
  {name:"sql", weight:0.04, has:false}
];

const sum = arr => arr.reduce((a,b)=>a+b,0);
let chart;

function renderSkills(){
  const list=document.getElementById("skills");
  list.innerHTML="";
  skills.forEach((s,idx)=>{
    const div=document.createElement("div");
    div.innerHTML=`<label><input type="checkbox" data-idx="${idx}"/> ${s.name} (${s.weight})</label>`;
    list.appendChild(div);
  });
}
function compute(){
  const checks=document.querySelectorAll("#skills input");
  checks.forEach(c=> skills[c.dataset.idx].has=c.checked);
  const sel=skills.filter(s=>s.has);
  const raw=sel.length/skills.length;
  const weighted=sum(sel.map(s=>s.weight))/sum(skills.map(s=>s.weight));
  document.getElementById("rawPct").innerText=(raw*100).toFixed(1)+"%";
  document.getElementById("wPct").innerText=(weighted*100).toFixed(1)+"%";
  const covered=sum(sel.map(s=>s.weight));
  const uncovered=sum(skills.map(s=>s.weight))-covered;
  if(!chart){
    chart=new Chart(document.getElementById("chart"),{type:"doughnut",
      data:{labels:["Covered","Uncovered"],datasets:[{data:[covered,uncovered]}]},
      options:{plugins:{legend:{labels:{color:"#e5e7eb"}}}}});
  } else {
    chart.data.datasets[0].data=[covered,uncovered];
    chart.update();
  }
  const miss=skills.filter(s=>!s.has).sort((a,b)=>b.weight-a.weight).slice(0,5);
  document.getElementById("missingList").innerText="Top missing: "+miss.map(m=>m.name).join(", ");
}
document.getElementById("compute").onclick=compute;
renderSkills();
EOF