(()=>{'use strict';
const $=s=>document.querySelector(s), key='baby-guess-voter-id-v1';
const intro=$('#intro-screen'),screen=$('#reveal-screen'),envelope=$('#envelope-trigger'),voting=$('#voting-panel'),results=$('#results-panel'),celebration=$('#gender-reveal-panel'),status=$('#status-message'),nameInput=$('#voter-name'),submit=$('#vote-button'),overlay=$('#submitting-overlay'),choices=[...document.querySelectorAll('[data-choice]')];
const configured=window.BABY_REVEAL_CONFIG?.actualGender;const actualGender=configured==='boy'||configured==='girl'?configured:null;
let selected=null,busy=false,opened=false,latest=null,hasVoted=false;
let voterId;try{voterId=localStorage.getItem(key)}catch(_){};if(!voterId||!/^[0-9a-f-]{36}$/i.test(voterId)){voterId=crypto.randomUUID();try{localStorage.setItem(key,voterId)}catch(_){}}
const setStatus=s=>{status.textContent=s||''};
function updateButton(){submit.disabled=busy||!selected||!nameInput.value.trim()}
function setBusy(b){busy=b;submit.textContent=b?'Submitting...':'Submit my guess ♡';nameInput.disabled=b;choices.forEach(x=>x.disabled=b);overlay.classList.toggle('hidden',!b);updateButton()}
function open(){if(opened)return;opened=true;intro.classList.add('opening');setTimeout(()=>{intro.classList.add('hidden');screen.classList.remove('hidden');window.scrollTo({top:0,behavior:'instant'})},820)}
function enterInstant(){opened=true;intro.classList.add('hidden');screen.classList.remove('hidden')}
async function parse(r){const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Something went wrong. Please try again.');return data}
function populateResults(d){latest=d;const b=Number(d.boy)||0,g=Number(d.girl)||0,t=b+g,bp=t?Math.round(100*b/t):0,gp=t?100-bp:0;$('#boy-percent').textContent=bp+'%';$('#girl-percent').textContent=gp+'%';$('#boy-bar').style.width=bp+'%';$('#girl-bar').style.width=gp+'%';$('#total-votes').textContent=t.toLocaleString('en-US');$('#thanks-line').textContent=`${d.yourName?d.yourName+', ':''}thank you for joining!`}
function showResults(d){populateResults(d);voting.classList.add('hidden');celebration.classList.add('hidden');results.classList.remove('hidden');results.scrollIntoView({behavior:'smooth',block:'start'});setStatus('')}
function showReveal(d){populateResults(d);voting.classList.add('hidden');results.classList.add('hidden');celebration.classList.remove('hidden');celebration.classList.toggle('is-boy',actualGender==='boy');celebration.classList.toggle('is-girl',actualGender==='girl');$('#celebration-cloud-image').src=actualGender==='boy'?'/assets/watercolor-boy-cloud.png':'/assets/watercolor-girl-cloud.png';$('#gender-reveal-title').textContent=actualGender==='boy'?"It's a Boy!":"It's a Girl!";$('#gender-reveal-caption').textContent=`${d.yourName?d.yourName+', ':''}thank you for celebrating with us!`;const cloud=$('#celebration-cloud');cloud.style.animation='none';void cloud.offsetHeight;cloud.style.animation='';celebration.scrollIntoView({behavior:'smooth',block:'start'});setStatus('')}
envelope.addEventListener('click',open);
choices.forEach(x=>x.addEventListener('click',()=>{if(busy)return;selected=x.dataset.choice;choices.forEach(y=>y.setAttribute('aria-pressed',String(x===y)));updateButton();setStatus('')}));
nameInput.addEventListener('input',()=>{updateButton();setStatus('')});
submit.addEventListener('click',async()=>{if(busy||!selected||!nameInput.value.trim())return;setBusy(true);setStatus('');try{const r=await fetch('/api/votes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({voterId,choice:selected,name:nameInput.value.trim()})});const d=await parse(r);setBusy(false);hasVoted=true;if(actualGender)showReveal(d);else showResults(d)}catch(e){setBusy(false);setStatus(e.message)}});
$('#see-results-button').addEventListener('click',()=>{if(latest)showResults(latest)});
$('#share-button').addEventListener('click',async()=>{const url=location.origin+location.pathname;try{if(navigator.share)await navigator.share({title:'Peter & Lauren · Gender Reveal',text:'Come guess: Team Boy or Team Girl? ♡',url});else{await navigator.clipboard.writeText(url);$('#share-button').textContent='Link copied ✓'}}catch(e){if(e.name!=='AbortError')setStatus('Please copy the website URL directly.')}});
fetch('/api/votes?voterId='+encodeURIComponent(voterId)).then(parse).then(d=>{if(d.yourChoice&&!hasVoted){hasVoted=true;enterInstant();if(actualGender)showReveal(d);else showResults(d)}}).catch(()=>{});
})();
