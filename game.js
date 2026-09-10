
var voicePlayer = document.getElementById('voicePlayer');

var VOICE_FILES = {
  fr: {
    intro:'fr_intro.mp3',
    good:['fr_good_01.mp3','fr_good_02.mp3','fr_good_03.mp3','fr_good_04.mp3','fr_good_05.mp3','fr_good_06.mp3'],
    bad:['fr_bad_01.mp3','fr_bad_02.mp3','fr_bad_03.mp3','fr_bad_04.mp3','fr_bad_05.mp3'],
    last_chance:'fr_last_chance.mp3',
    idle:['fr_idle_01.mp3','fr_idle_02.mp3','fr_idle_03.mp3','fr_idle_04.mp3','fr_idle_05.mp3'],
    hint_already:'fr_hint_already.mp3',
    hint:'fr_hint.mp3',
    win:'fr_win.mp3',
    lose:'fr_lose.mp3',
    quit:'fr_quit.mp3',
    language:'fr_language.mp3',
    test:'fr_test.mp3'
  },
  en: {
    intro:'en_intro.mp3',
    good:['en_good_01.mp3','en_good_02.mp3','en_good_03.mp3','en_good_04.mp3','en_good_05.mp3','en_good_06.mp3'],
    bad:['en_bad_01.mp3','en_bad_02.mp3','en_bad_03.mp3','en_bad_04.mp3','en_bad_05.mp3'],
    last_chance:'en_last_chance.mp3',
    idle:['en_idle_01.mp3','en_idle_02.mp3','en_idle_03.mp3','en_idle_04.mp3','en_idle_05.mp3'],
    hint_already:'en_hint_already.mp3',
    hint:'en_hint.mp3',
    win:'en_win.mp3',
    lose:'en_lose.mp3',
    quit:'en_quit.mp3',
    language:'en_language.mp3',
    test:'en_test.mp3'
  }
};

function voiceLang(){
  return (typeof lang !== 'undefined' && lang === 'en') ? 'en' : 'fr';
}

function playVoiceFile(file){
  if(!file || !voicePlayer) return false;
  try{
    if(typeof settings !== 'undefined' && settings.voice === 0) return true;
    voicePlayer.pause();
    voicePlayer.currentTime = 0;
    voicePlayer.src = 'voices/' + voiceLang() + '/' + file;
    voicePlayer.volume = (typeof settings !== 'undefined' && typeof settings.voice === 'number') ? settings.voice/100 : 0.30;
    var p = voicePlayer.play();
    if(p && typeof p.catch === 'function'){
      p.catch(function(){});
    }
    return true;
  }catch(e){
    return false;
  }
}

function playVoiceKey(key, index){
  var l = voiceLang();
  var entry = VOICE_FILES[l] && VOICE_FILES[l][key];
  if(!entry) return false;
  if(Object.prototype.toString.call(entry) === '[object Array]'){
    var i = (typeof index === 'number') ? index : Math.floor(Math.random()*entry.length);
    return playVoiceFile(entry[i % entry.length]);
  }
  return playVoiceFile(entry);
}

/* Sauve Ketty — FR/EN + menu administrateur KettyBot */
var LANG_KEY='sauveKettyLang', SETTINGS_KEY='sauveKettyAudioV2';
var lang=localStorage.getItem(LANG_KEY)||'fr';
var DEFAULT_WORDS_FR=['facteur','viarhona','ceramique','labyrinthe','baignade','palais','poire','rhone','lama','accrobranche','escargot','chevre','fruits','velo','randonner','vignoble'];
var WORDS_EN=['postman','viarhona','ceramics','maze','swimming','palace','pear','rhone','llama','treetop','snail','goat','fruits','bike','hiking','vineyard'];
var GOOD_FR=['Super !','Bonne réponse !','Cool !','Waouh !','Bravo !','C’est ça !','',''];
var BAD_FR=['Mince.','Aïe.','Ouille.','Et non.','Oups !','',''];
var GOOD_EN=['Great!','Good answer!','Cool!','Wow!','Well done!','That’s it!','',''];
var BAD_EN=['Oops.','Oh no.','Not this one.','Nope.','',''];
var WORDS=[],GOOD=[],BAD=[],word='',guessed={},wrong={},eliminated={},lives=10,hintUsed=false,previousWord='',idleTimers=[];
var music=document.getElementById('music');
var settings={voice:30,sfx:30,music:30};
try{var ss=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');if(ss){settings.voice=Number(ss.voice);settings.sfx=Number(ss.sfx);settings.music=Number(ss.music)}}catch(e){}
function byId(id){return document.getElementById(id)}
function all(sel){return document.querySelectorAll(sel)}
function addClass(el,c){if(el.classList)el.classList.add(c);else if((' '+el.className+' ').indexOf(' '+c+' ')<0)el.className+=' '+c}
function removeClass(el,c){if(el.classList)el.classList.remove(c);else el.className=(' '+el.className+' ').replace(' '+c+' ',' ').replace(/^\s+|\s+$/g,'')}
function has(obj,k){return obj[k]===true}
function cleanWord(w){w=String(w||'').toLowerCase();var from='àáâäãåçèéêëìíîïñòóôöõùúûüýÿœ';var to='aaaaaaceeeeiiiinooooouuuuyyoe';for(var i=0;i<from.length;i++)w=w.split(from.charAt(i)).join(to.substr(i,from.charAt(i)==='œ'?2:1));return w.replace(/[^a-z]/g,'')}
function loadWords(){if(lang==='en')return WORDS_EN.slice(0);try{var saved=JSON.parse(localStorage.getItem('sauveKettyWords')||'null');if(saved&&saved.length){var r=[];for(var i=0;i<saved.length;i++){var x=cleanWord(saved[i]);if(x)r.push(x)}return r}}catch(e){}return DEFAULT_WORDS_FR.slice(0)}
function setLanguage(l){lang=l;try{localStorage.setItem(LANG_KEY,l)}catch(e){}WORDS=loadWords();GOOD=l==='fr'?GOOD_FR:GOOD_EN;BAD=l==='fr'?BAD_FR:BAD_EN;paintLanguage()}
function paintLanguage(){
 byId('startBtn').innerHTML=lang==='fr'?'JOUER':'PLAY';
 byId('rulesBtn').innerHTML=lang==='fr'?'RÈGLES':'RULES';
 byId('againBtn').innerHTML=lang==='fr'?'REJOUER':'PLAY AGAIN';
 byId('homeBtn').innerHTML=lang==='fr'?'ACCUEIL':'HOME';
 var p=document.querySelector('.prompt span');if(p)p.innerHTML=lang==='fr'?'CHOISIS UNE LETTRE':'CHOOSE A LETTER';
 if(lang==='fr'){addClass(byId('frBtn'),'active-lang');removeClass(byId('enBtn'),'active-lang')}else{addClass(byId('enBtn'),'active-lang');removeClass(byId('frBtn'),'active-lang')}
}
function show(id){var s=all('.screen');for(var i=0;i<s.length;i++)removeClass(s[i],'active');addClass(byId(id),'active')}
function safePlay(el){if(!el)return;try{el.pause();el.currentTime=0;var p=el.play();if(p&&typeof p.catch==='function')p.catch(function(){})}catch(e){}}
function play(id){var el=byId(id);if(el){el.volume=Math.max(0,Math.min(1,settings.sfx/100));safePlay(el)}}
function applyAudio(){music.volume=Math.max(0,Math.min(1,settings.music/100));var a=all('audio');for(var i=0;i<a.length;i++)if(a[i]!==music)a[i].volume=Math.max(0,Math.min(1,settings.sfx/100));try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch(e){}}
function say(text, voiceKey, voiceIndex){
  var bubble = document.getElementById('pepperLine');
  if(bubble) bubble.textContent = text || '';
  if(!text) return;

  var autoKey = null;
  var goodTexts = ['Super !','Bonne réponse !','Cool !','Waouh !','Bravo !','C’est ça !','Great!','Good answer!','Cool!','Wow!','Well done!','That’s it!'];
  var badTexts = ['Mince.','Aïe.','Ouille.','Et non.','Oups !','Oops.','Oh no.','Not this one.','Nope.','Try again!'];
  var idleTexts = ['Clique sur une lettre pour trouver le mot.','N’aie pas peur, tu peux cliquer sur une lettre.','Il reste encore quelques lettres à deviner !','Eh bien alors ! J’ai besoin de ton aide ! Choisis une lettre.','Je me sens un peu seule. Tant pis, on jouera une prochaine fois ! Bye bye.','Tap a letter to find the word.','Go on, choose a letter!','There are still a few letters to find!','Hey! I need your help! Choose a letter.','I feel a little lonely. Never mind, we’ll play another time! Bye bye.'];
  if(!voiceKey){
    if(goodTexts.indexOf(text)>=0) autoKey='good';
    else if(badTexts.indexOf(text)>=0) autoKey='bad';
    else if(idleTexts.indexOf(text)>=0) autoKey='idle';
  }
  if((voiceKey || autoKey) && playVoiceKey(voiceKey || autoKey, voiceIndex)) return;


  /* Fallback only: browser speech synthesis, used if no MP3 key was supplied. */
  try{
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = voiceLang()==='en' ? 'en-GB' : 'fr-FR';
      u.rate = 1.03;
      u.pitch = 1.08;
      u.volume = (typeof settings !== 'undefined' && typeof settings.voice === 'number') ? settings.voice/100 : 0.30;
      window.speechSynthesis.speak(u);
    }
  }catch(e){}
}
function updateSettingsValues(){byId('voiceValue').innerHTML=settings.voice+'%';byId('sfxValue').innerHTML=settings.sfx+'%';byId('musicValue').innerHTML=settings.music+'%'}
byId('adminHotspot').onclick=function(){tapCount++;if(tapTimer)clearTimeout(tapTimer);tapTimer=setTimeout(function(){tapCount=0},2000);if(tapCount>=3){tapCount=0;openSettings()}};
byId('voiceVolume').oninput=function(){settings.voice=Number(this.value);updateSettingsValues();applyAudio()};
byId('sfxVolume').oninput=function(){settings.sfx=Number(this.value);updateSettingsValues();applyAudio()};
byId('musicVolume').oninput=function(){settings.music=Number(this.value);updateSettingsValues();applyAudio()};
byId('testVoice').onclick=function(){say(lang==='fr'?'Bonjour ! Je suis Ketty. Le réglage de ma voix fonctionne.':'Hello! I am Ketty. My voice setting is working.')};
byId('testSound').onclick=function(){play('sfxGood')};
byId('closeSettings').onclick=function(){addClass(byId('settingsModal'),'hidden')};
applyAudio();paintLanguage();
try{if(location.search.indexOf('admin=1')>=0)setTimeout(openSettings,300)}catch(e){}
