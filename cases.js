// --- Datos de productos y casos ---
const products = [
  {id:'ajo', name:'Ajo Negro OX', icon:'🧄', tags:['fatiga','inmunidad','antioxidante']},
  {id:'termo', name:'Termo Cell Alfa', icon:'🔥', tags:['modelado','circulacion','estetica']},
  {id:'serum', name:'Serum Nat', icon:'💧', tags:['piel','hidratacion','antiage']},
  {id:'arti', name:'Arti Dol Flex', icon:'🦵', tags:['dolor','muscular','alivio']},
  {id:'belle', name:'Belle Nat', icon:'🌸', tags:['piel','reafirmar','belleza']},
  {id:'collagen', name:'Collagen Nat', icon:'🥤', tags:['piel','articulaciones','colageno']},
  {id:'artiplus', name:'Arti Dol Flex Plus', icon:'💪', tags:['articulaciones','movilidad']},
  {id:'curcu', name:'Curcu Nat', icon:'🌿', tags:['digestión','antinflamatorio','fibra']},
  {id:'tea', name:'Tea Mach', icon:'🍵', tags:['energia','digestión','matcha']},
  {id:'multi', name:'Multi Nat', icon:'🍫', tags:['multivitaminico','energia']},
  {id:'faja', name:'Faja Fit Deportiva', icon:'🩳', tags:['postura','modelado']}
];

const caseScenariosPerProduct = 7;
const cases = [];

const personas = ['adulto','adulto joven','madre','deportista','estudiante','profesional','adulto mayor'];
const contexts = ['turnos nocturnos','entrenamientos intensos','viajes frecuentes','trabajo sedentario','estrés laboral','cambios de dieta','etapa postparto'];
const objectives = ['energía','recuperación','mejorar piel','mejorar digestión','alivio articular','modelado corporal','mejorar postura'];

function goodOption(productName, benefit){
  return `${productName} puede ayudar: aporta ${benefit} de forma natural y es fácil de integrar en su rutina.`;
}
function neutralOption(){ return `No estoy seguro si esto funcionará, tal vez pruebe algo más tarde.`; }
function badOption(){ return `Esto no es importante, mejor esperar.`; }

products.forEach(prod => {
  for(let i=1;i<=caseScenariosPerProduct;i++){
    const persona = personas[(i-1)%personas.length];
    const context = contexts[(i+1)%contexts.length];
    const objective = objectives[(i-1)%objectives.length];
    const cid = `${prod.id}_c${i.toString().padStart(2,'0')}`;
    const title = `${prod.name} — Caso ${i}`;
    const narrative = `Cliente (${persona}) con ${context} busca ${objective}.`;
    const need = [objective, prod.name.toLowerCase(), ...prod.tags];
    const productsSuggested = [prod.id];
    const justification = `${prod.name} aporta ingredientes que apoyan ${objective} y complementa con hábitos saludables.`;
    const roleQ = `¿Cómo le presentarías ${prod.name} a este cliente para abordar ${objective}?`;
    const opts = [goodOption(prod.name, objective), neutralOption(), badOption()];
    const correctIndex = 0;
    const quiz = {q:`¿Cuál es el objetivo principal de este caso?`, opts:[objective,'otro','ninguno'], a:0};
    cases.push({id:cid,title,narrative,need,products:productsSuggested,justification,roleplay:{q:roleQ,opts,a:correctIndex},quiz});
  }
});

// --- Renderizado de productos ---
const grid = document.getElementById('productGrid');
products.forEach(p=>{
  const card = document.createElement('div');
  card.className='bg-neutral-800/30 p-4 rounded';
  card.innerHTML = `<div class="icon">${p.icon}</div><h4 class='font-bold mt-2'>${p.name}</h4><div class='text-xs text-neutral-300 mt-1'>Etiquetas: ${p.tags.join(', ')}</div><div class='mt-3'><button class='viewProduct px-3 py-1 bg-emerald-600 rounded text-xs' data-id='${p.id}'>Ver casos</button></div>`;
  grid.appendChild(card);
});

// --- Búsqueda ---
const casesList = document.getElementById('casesList');
document.getElementById('searchBtn').addEventListener('click', ()=>performSearch());
document.getElementById('needInput').addEventListener('keypress', (e)=>{ if(e.key==='Enter') performSearch(); });

function performSearch(){
  const q = document.getElementById('needInput').value.trim().toLowerCase();
  casesList.innerHTML = '';
  if(!q){ casesList.innerHTML = '<div class="text-sm text-neutral-400">Escribe una palabra clave para buscar casos.</div>'; return; }
  const matched = cases.filter(c => (c.title+' '+c.narrative+' '+c.need.join(' ')).toLowerCase().includes(q));
  if(matched.length===0){ casesList.innerHTML = '<div class="text-sm text-amber-400">No se encontraron casos. Prueba otra palabra.</div>'; return; }
  matched.forEach(c=>casesList.innerHTML += renderCaseCard(c));
}

function renderCaseCard(c){
  return `<div class='p-3 bg-neutral-800/30 rounded'>
    <div class='font-semibold'>${c.title}</div>
    <div class='text-xs text-neutral-300 mt-1'>${c.narrative}</div>
    <div class='mt-2 flex gap-2'>
      <button class='openCase px-2 py-1 bg-emerald-600 rounded text-xs' data-id='${c.id}'>Abrir caso</button>
      <button class='takeQuick px-2 py-1 border rounded text-xs' data-id='${c.id}'>Quiz & Roleplay</button>
    </div>
  </div>`;
}

// --- Eventos delegados ---
document.addEventListener('click', (e)=>{
  if(e.target.classList.contains('viewProduct')){
    const pid=e.target.dataset.id;
    const filtered = cases.filter(c=>c.products.includes(pid));
    casesList.innerHTML='';
    filtered.forEach(c=>casesList.innerHTML += renderCaseCard(c));
  }
  if(e.target.classList.contains('openCase')){
    const cid=e.target.dataset.id; const c=cases.find(x=>x.id===cid); showCaseModal(c);
  }
  if(e.target.classList.contains('takeQuick')){
    const cid=e.target.dataset.id; const c=cases.find(x=>x.id===cid); showQuickModal(c);
  }
  if(e.target.id==='closeModal') closeModal();
});

function showCaseModal(c){
  const modal=document.getElementById('modal'); const content=document.getElementById('modalContent');
  modal.classList.remove('hidden');
  const prodNames = c.products.map(pid=>products.find(p=>p.id===pid)?.name||pid).join(', ');
  content.innerHTML = `<h2 class='text-2xl font-bold mb-2'>🩺 ${c.title}</h2><p class='text-sm text-neutral-300 mb-3'>${c.narrative}</p><h4 class='font-semibold'>Necesidad</h4><div class='text-sm text-neutral-300 mb-2'>${c.need.join(', ')}</div><h4 class='font-semibold'>Productos sugeridos</h4><div class='text-sm text-neutral-300 mb-3'>${prodNames}</div><h4 class='font-semibold'>Justificación</h4><div class='text-sm text-neutral-300 mb-3'>${c.justification}</div><div class='mt-3'><button class='takeQuick px-3 py-1 bg-emerald-600 rounded' data-id='${c.id}'>Ir a Quiz & Roleplay</button></div>`;
}

function showQuickModal(c){
  const modal=document.getElementById('modal'); const content=document.getElementById('modalContent'); modal.classList.remove('hidden');
  const prodNames = c.products.map(pid=>products.find(p=>p.id===pid)?.name||pid).join(', ');
  content.innerHTML = `
    <h2 class='text-2xl font-bold mb-2'>${c.title}</h2>
    <p class='text-sm text-neutral-300 mb-2'>${c.narrative}</p>
    <h4 class='font-semibold'>Producto(s):</h4>
    <div class='text-sm text-neutral-300 mb-3'>${prodNames}</div>
    <h4 class='font-semibold'>Quiz</h4>
    <div class='mt-2 text-sm'>${renderQuiz(c)}</div>
    <h4 class='font-semibold mt-4'>Roleplay</h4>
    <p class='text-sm mb-2'>${c.roleplay.q}</p>
    ${c.roleplay.opts.map((o,i)=>`<label class='block text-xs'><input type='radio' name='rp_${c.id}' value='${i}'> ${o}</label>`).join('')}
    <div class='mt-3 flex gap-2'>
      <button class='px-3 py-1 bg-emerald-600 rounded' onclick='submitQuiz("${c.id}")'>Enviar Quiz</button>
      <button class='px-3 py-1 border rounded' onclick='submitRoleplay("${c.id}")'>Enviar Roleplay</button>
    </div>
    <div id='feedback_${c.id}' class='mt-2 text-sm'></div>
  `;
}

function renderQuiz(c){
  const q=c.quiz;
  return `<p class='text-sm'>${q.q}</p>` + q.opts.map((o,idx)=>`<label class='block text-xs'><input type='radio' name='q_${c.id}' value='${idx}'> ${o}</label>`).join('');
}

function submitQuiz(cid){
  const c=cases.find(x=>x.id===cid); const sel=document.querySelector(`input[name='q_${cid}']:checked`);
  const fb=document.getElementById(`feedback_${cid}`);
  if(!sel){ fb.textContent='Selecciona una opción del quiz.'; fb.className='text-sm text-amber-400'; return; }
  const val=parseInt(sel.value);
  if(val===c.quiz.a){
    fb.textContent='✅ Quiz correcto. +10 pts'; fb.className='text-sm text-green-400';
  } else {
    fb.textContent='❌ Quiz incorrecto.'; fb.className='text-sm text-red-400';
  }
}

function submitRoleplay(cid){
  const sel=document.querySelector(`input[name='rp_${cid}']:checked`);
  const fb=document.getElementById(`feedback_${cid}`);
  if(!sel){ fb.textContent='Selecciona una opción del roleplay.'; fb.className='text-sm text-amber-400'; return; }
  const val=parseInt(sel.value);
  if(val===0){
    fb.textContent='✅ Roleplay correcto. +15 pts'; fb.className='text-sm text-green-400';
  } else {
    fb.textContent='❌ Respuesta poco efectiva.'; fb.className='text-sm text-red-400';
  }
}

function closeModal(){ document.getElementById('modal').classList.add('hidden'); }