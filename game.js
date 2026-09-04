const DEFAULT_WORDS=["facteur", "viarhona", "ceramique", "labyrinthe", "baignade", "palais", "poire", "rhone", "lama", "accrobranche", "escargot", "chevre", "fruits", "velo", "randonner", "vignoble"];
const GOOD=['Super !','Bonne réponse !','Cool !','Waouh !','Bravo !','C’est ça !','',''];
const BAD=['Mince.','Aïe.','Ouille.','Et non.','Oups !','',''];

let WORDS=loadWords();
let word='', guessed=new Set(), wrong=new Set(), eliminated=new Set(), lives=10, hintUsed=false, previousWord='';
let idleTimers=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const music=$('#music');
const VOLUME_KEY='sauveKettyVolume';
let gameVolume=Math.max(0,Math.min(100,parseInt(localStorage.getItem(VOLUME_KEY)||'30',10)||0));

function applyGameVolume(v){
  gameVolume=Math.max(0,Math.min(100,Number(v)||0));
  localStorage.setItem(VOLUME_KEY,String(gameVolume));
  const n=gameVolume/100;
  music.volume=n*0.45;
  document.querySelectorAll('audio:not(#music)').forEach(a=>a.volume=n);
  const s=$('#volumeSlider'), t=$('#volumeValue');
  if(s)s.value=String(gameVolume);
  if(t)t.textContent=gameVolume+'%';
}


function cleanWord(w){return w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'')}
function loadWords(){
  try{
    const saved=JSON.parse(localStorage.getItem('sauveKettyWords')||'null');
    if(Array.isArray(saved)&&saved.length) return saved.map(cleanWord).filter(Boolean);
  }catch(e){}
  return [...DEFAULT_WORDS];
}
function saveWords(list){
  const cleaned=[...new Set(list.map(cleanWord).filter(Boolean))];
  WORDS=cleaned.length?cleaned:[...DEFAULT_WORDS];
  localStorage.setItem('sauveKettyWords',JSON.stringify(WORDS));
}
function show(id){$$('.screen').forEach(x=>x.classList.remove('active')); $('#'+id).classList.add('active')}
function play(id){const a=$(id); try{a.currentTime=0;a.play()}catch(e){}}
function say(text){$('#pepperLine').textContent=text||''; if(!text)return; if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=1.03;u.pitch=1.08;speechSynthesis.speak(u)}}
function random(arr){return arr[Math.floor(Math.random()*arr.length)]}
function chooseWord(){let pool=WORDS.filter(w=>w!==previousWord); word=random(pool.length?pool:WORDS); previousWord=word}
function resetIdle(){idleTimers.forEach(clearTimeout); idleTimers=[]; idleTimers.push(setTimeout(()=>say(random(['Clique sur une lettre pour trouver le mot.','N’aie pas peur, tu peux cliquer sur une lettre.','Il reste encore quelques lettres à deviner !'])),30000));idleTimers.push(setTimeout(()=>{say('Et bah alors ! J’ai besoin de ton aide ! Clique sur le clavier, pour choisir une lettre.');play('#sfxTimer')},45000));idleTimers.push(setTimeout(()=>{say('Je me sens un peu seul. Tant pis, on jouera une prochaine fois ! Bye bye.');setTimeout(home,4500)},55000))}
function startGame(){chooseWord(); guessed=new Set();wrong=new Set();eliminated=new Set();lives=10;hintUsed=false;show('game');music.currentTime=0;music.play().catch(()=>{});render();say('Bienvenue dans Sauve Ketty. Oulala, il m’arrive un truc. Pour réparer mon système, il faut retrouver un mot de passe. Mais je ne vois plus rien ! J’ai besoin de ton aide !');resetIdle()}
function render(){renderWord();renderKeyboard();$('#batteryImg').src=`battery/${String(lives*10).padStart(2,'0')}.png`;$('#hintBtn').classList.toggle('used',hintUsed);$('#hintBtn img').src=hintUsed?'buttons/hint_done.png':'buttons/hint.png'}
function renderWord(){const box=$('#word');box.innerHTML='';[...word].forEach(ch=>{const slot=document.createElement('div');slot.className='letter-slot';if(guessed.has(ch)){slot.innerHTML=`<div class="letter">${ch.toUpperCase()}</div><img class="underline" src="underline_yes.png">`}else{slot.innerHTML=`<img class="blur" src="letter_blur.png"><img class="underline" src="underline_no.png">`}box.appendChild(slot)})}
function renderKeyboard(){const kb=$('#keyboard');kb.innerHTML='';const rows=['ABCDEFGHIJ','KLMNOPQRS','TUVWXYZ'];rows.forEach(r=>{const row=document.createElement('div');row.className='key-row';[...r].forEach(L=>{const l=L.toLowerCase(),b=document.createElement('button');b.className='key';let path=`keyboard/normal/${L}.png`;if(guessed.has(l))path=`keyboard/right/${L}-right.png`;if(wrong.has(l))path=`keyboard/false/${L}-false.png`;if(eliminated.has(l)){b.classList.add('disabled');path=`keyboard/false/${L}-false.png`}b.innerHTML=`<img src="${path}" alt="${L}">`;b.disabled=guessed.has(l)||wrong.has(l)||eliminated.has(l);b.addEventListener('click',()=>pick(l));row.appendChild(b)});kb.appendChild(row)})}
function pick(letter){resetIdle();if(word.includes(letter)){guessed.add(letter);play('#sfxGood');say(random(GOOD));render();const needed=new Set([...word]);if([...needed].every(c=>guessed.has(c)))setTimeout(()=>finish(true),700)}else{wrong.add(letter);lives=Math.max(0,lives-1);say(random(BAD));render();if(lives===1)setTimeout(()=>say('Attention, dernière chance pour me sauver !'),500);if(lives===0)setTimeout(()=>finish(false),700)}}
function finish(win){idleTimers.forEach(clearTimeout);music.pause();show('end');$('#endImage').src=win?'sauve_ketty_win.png':'sauve_ketty_lose.png';$('#endText').textContent=win?'Bravo ! Tu as trouvé le bon mot ! Ketty est réparée !':`Le mot à trouver était « ${word.toUpperCase()} ». Heureusement, Ketty est incassable !`;if(win){play('#sfxWin');say('Bravo ! Tu as trouvé le bon mot ! Je suis complètement réparée ! Merci.')}else{play('#sfxLose');say(`Ouf ! Heureusement que je suis incassable ! Le mot à trouver était ${word}.`)}}
function modal(title,text,actions,extraHtml=''){ $('#modalTitle').textContent=title;$('#modalText').textContent=text;$('#modalExtra').innerHTML=extraHtml;const a=$('#modalActions');a.innerHTML='';actions.forEach(x=>{const b=document.createElement('button');b.textContent=x.label;b.onclick=()=>{if(x.fn){const close=x.fn();if(close===false)return}closeModal()};a.appendChild(b)});$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden');$('#modalExtra').innerHTML=''}
function useHint(){resetIdle();if(hintUsed){say('Tu as déjà utilisé ton indice.');return}play('#sfxHint');modal('Indice','Attention, tu n’as droit qu’à un seul indice. Veux-tu vraiment l’utiliser maintenant ?',[{label:'NON',fn:()=>say("D'accord")},{label:'OUI',fn:()=>{hintUsed=true;play('#sfxLife');say("Et hop, je vais t’enlever quelques mauvaises lettres !");const candidates='abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>!word.includes(c)&&!guessed.has(c)&&!wrong.has(c));for(let i=0;i<3&&candidates.length;i++){const j=Math.floor(Math.random()*candidates.length);eliminated.add(candidates.splice(j,1)[0])}render()}}])}
function quit(){resetIdle();modal('Quitter','Es-tu sûr de vouloir quitter le jeu ?',[{label:'NON',fn:()=>say('Cool')},{label:'OUI',fn:()=>{play('#sfxQuit');say('Ok. Une autre fois peut-être.');setTimeout(home,1800)}}])}
function rules(){modal('Règles','Trouve les bonnes lettres pour afficher le bon mot. Une mauvaise lettre fait baisser la batterie. Tu as 10 vies et un seul indice, qui élimine trois mauvaises lettres.',[{label:'J’AI COMPRIS'}])}

function settings(){
  const value=WORDS.join('\n');
  const extra=`<div class="settings-form">
    <label>Mots à deviner — un mot par ligne</label>
    <textarea id="wordsEditor">${value}</textarea>
    <label>Changer l’image d’accueil</label>
    <input id="introUpload" type="file" accept="image/*">
    <label>Changer l’image de victoire</label>
    <input id="winUpload" type="file" accept="image/*">
    <div class="settings-help">Les réglages sont mémorisés sur cet appareil. Les accents, espaces et tirets dans les mots sont simplifiés automatiquement pour le clavier A–Z.</div>
  </div>`;
  modal('Paramètres','Tu peux modifier le jeu sans toucher au code.',[
    {label:'ANNULER'},
    {label:'RÉINITIALISER',fn:()=>{localStorage.removeItem('sauveKettyWords');localStorage.removeItem('sauveKettyIntro');localStorage.removeItem('sauveKettyWin');WORDS=[...DEFAULT_WORDS];applyCustomImages();}},
    {label:'ENREGISTRER',fn:()=>{
      saveWords($('#wordsEditor').value.split(/[\n,;]+/));
      const intro=$('#introUpload').files[0], win=$('#winUpload').files[0];
      let pending=0;
      const done=()=>{pending--; if(pending<=0){applyCustomImages();closeModal()}};
      if(intro){pending++; const r=new FileReader();r.onload=()=>{localStorage.setItem('sauveKettyIntro',r.result);done()};r.readAsDataURL(intro)}
      if(win){pending++; const r=new FileReader();r.onload=()=>{localStorage.setItem('sauveKettyWin',r.result);done()};r.readAsDataURL(win)}
      if(!pending){applyCustomImages();}
    }}
  ],extra);
}
function applyCustomImages(){
  const intro=localStorage.getItem('sauveKettyIntro');
  document.querySelector('.intro-screen').style.backgroundImage=`url("${intro||'sauve_ketty_intro.png'}")`;
}
function getWinImage(){return localStorage.getItem('sauveKettyWin')||'sauve_ketty_win.png'}
function home(){idleTimers.forEach(clearTimeout);music.pause();if('speechSynthesis'in window)speechSynthesis.cancel();show('intro');$('#pepperLine').textContent='';applyCustomImages()}
const oldFinish=finish;
finish=function(win){idleTimers.forEach(clearTimeout);music.pause();show('end');$('#endImage').src=win?getWinImage():'sauve_ketty_lose.png';$('#endText').textContent=win?'Bravo ! Tu as trouvé le bon mot ! Ketty est réparée !':`Le mot à trouver était « ${word.toUpperCase()} ». Heureusement, Ketty est incassable !`;if(win){play('#sfxWin');say('Bravo ! Tu as trouvé le bon mot ! Je suis complètement réparée ! Merci.')}else{play('#sfxLose');say(`Ouf ! Heureusement que je suis incassable ! Le mot à trouver était ${word}.`)}}

$('#startBtn').onclick=startGame;$('#rulesBtn').onclick=rules;$('#settingsBtn').onclick=settings;$('#hintBtn').onclick=useHint;$('#quitBtn').onclick=quit;$('#againBtn').onclick=startGame;$('#homeBtn').onclick=home;
applyCustomImages();

function applyAdminMode(){
  const admin = new URLSearchParams(window.location.search).get('admin') === '1';
  const btn = document.querySelector('#settingsBtn');
  if(btn){
    btn.style.display = admin ? '' : 'none';
  }
}
applyAdminMode();

applyGameVolume(gameVolume);




function installAdminVolumeControl(){
  const admin = new URLSearchParams(window.location.search).get('admin') === '1';
  if(!admin || $('#volumeControl')) return;

  const box = document.createElement('div');
  box.id = 'volumeControl';
  box.className = 'volume-control';
  box.innerHTML = `
    <span aria-hidden="true">🔊</span>
    <input id="volumeSlider" type="range" min="0" max="100" step="5" value="${gameVolume}" aria-label="Volume du jeu">
    <span id="volumeValue">${gameVolume}%</span>
  `;
  document.body.appendChild(box);

  const slider = $('#volumeSlider');
  slider.addEventListener('input', e => applyGameVolume(e.target.value));
  slider.addEventListener('change', e => applyGameVolume(e.target.value));
  applyGameVolume(gameVolume);
}
installAdminVolumeControl();
