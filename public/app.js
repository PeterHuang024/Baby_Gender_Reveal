(()=>{'use strict';
const $=s=>document.querySelector(s), screens=['intro-screen','opening-screen','party-screen','answer-screen','results-screen'];
const idKey='baby-guess-voter-id-v1';let voterId;try{voterId=localStorage.getItem(idKey)}catch{}
if(!/^[0-9a-f-]{36}$/i.test(voterId||'')){voterId=crypto.randomUUID();try{localStorage.setItem(idKey,voterId)}catch{}}
let selected=null,busy=false,current=null,started=false;
const actual=window.BABY_REVEAL_CONFIG?.actualGender;
function show(screen){screens.forEach(s=>$('#'+s).classList.toggle('hidden',s!==screen));window.scrollTo({top:0,behavior:'instant'})}
function voteReady(){$('#vote-button').disabled=busy||!selected||!$('#voter-name').value.trim()}
function error(e){$('#status-message').textContent=e?.message||'Something went wrong. Please try again.'}
async function parse(res){const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Please try again later.');return data}
function drawResults(data){current=data;const boy=Number(data.boy)||0,girl=Number(data.girl)||0,total=boy+girl,pct=total?Math.round(100*boy/total):0;
$('#boy-count').textContent=boy;$('#girl-count').textContent=girl;$('#boy-percent').textContent=pct+'%';$('#girl-percent').textContent=(total?100-pct:0)+'%';$('#boy-bar').style.width=pct+'%';$('#girl-bar').style.width=(total?100-pct:0)+'%';$('#total-votes').textContent=total;$('#thanks-line').textContent=data.yourChoice?`${data.yourName?data.yourName+', ':''}you guessed Team ${data.yourChoice==='boy'?'Boy':'Girl'} ♡`:'';show('results-screen')}
function reveal(data){current=data;if(actual!=='boy'&&actual!=='girl'){drawResults(data);return;}const girl=actual==='girl';$('#answer-art').src=girl?'/assets/girl.webp':'/assets/boy.webp';$('#answer-art').alt=girl?'Watercolor celebration: it’s a girl':'Watercolor celebration: it’s a boy';$('#answer-title').textContent=girl?"It's a Girl!":"It's a Boy!";$('#answer-screen').classList.toggle('is-girl',girl);$('#answer-caption').textContent=(data.yourName?data.yourName+', t':'T')+'hank you for celebrating with us!';show('answer-screen')}
$('#envelope-trigger').addEventListener('click',()=>{if(started)return;started=true;$('#intro-screen').classList.add('is-opening');setTimeout(()=>{show('opening-screen');setTimeout(()=>{if(current?.yourChoice)reveal(current);else show('party-screen')},1100)},650)});
for(const b of document.querySelectorAll('[data-choice]'))b.addEventListener('click',()=>{if(busy)return;selected=b.dataset.choice;document.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));voteReady()});
$('#voter-name').addEventListener('input',voteReady);
$('#voting-form').addEventListener('submit',async e=>{e.preventDefault();if(busy||!selected)return;const name=$('#voter-name').value.trim();if(!name){$('#voter-name').focus();return;}busy=true;voteReady();$('#loading-overlay').classList.remove('hidden');$('#status-message').textContent='';try{const res=await fetch('/api/votes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({voterId,choice:selected,name})});const data=await parse(res);reveal(data)}catch(e){error(e)}finally{busy=false;voteReady();$('#loading-overlay').classList.add('hidden')}});
$('#see-results-button').addEventListener('click',()=>current&&drawResults(current));
$('#share-button').addEventListener('click',async()=>{const data={title:'Peter & Lauren • Gender Reveal',text:'Come guess Team Boy or Team Girl!',url:location.origin+location.pathname};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);$('#share-button').textContent='Link copied ✓'}}catch(e){if(e.name!=='AbortError')$('#share-button').textContent='Copy this page URL to share'}});
fetch('/api/votes?voterId='+encodeURIComponent(voterId)).then(parse).then(d=>{if(d.yourChoice)current=d}).catch(()=>{});
})();
