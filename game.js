function updateLanguageBackground(){
 var frImg='sauve_ketty_intro_kettybot.jpg';
 var enImg='sauve_ketty_intro_en.jpg';
 var src=(lang==='en'?enImg:frImg);

 var intro=byId('intro');
 if(intro){
   intro.style.backgroundImage="url('"+src+"')";
   intro.style.backgroundSize='cover';
   intro.style.backgroundPosition='center center';
   intro.style.backgroundRepeat='no-repeat';
 }

 var introImage=byId('introImage');
 if(introImage) introImage.src=src;
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
var voicePlayer=document.getElementById('voicePlayer');
var settings={voice:30,sfx:30,music:30};
try{var ss=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');if(ss){settings.voice=Number(ss.voice);settings.sfx=Number(ss.sfx);settings.music=Number(ss.music)}}catch(e){}
function byId(id){return document.getElementById(id)}
function all(sel){return document.querySelectorAll(sel)}
function addClass(el,c){if(el.classList)el.classList.add(c);else if((' '+el.className+' ').indexOf(' '+c+' ')<0)el.className+=' '+c}
function removeClass(el,c){if(el.classList)el.classList.remove(c);else el.className=(' '+el.className+' ').replace(' '+c+' ',' ').replace(/^\s+|\s+$/g,'')}
function has(obj,k){return obj[k]===true}
function cleanWord(w){w=String(w||'').toLowerCase();var from='àáâäãåçèéêëìíîïñòóôöõùúûüýÿœ';var to='aaaaaaceeeeiiiinooooouuuuyyoe';for(var i=0;i<from.length;i++)w=w.split(from.charAt(i)).join(to.substr(i,from.charAt(i)==='œ'?2:1));return w.replace(/[^a-z]/g,'')}
function loadWords(){if(lang==='en')return WORDS_EN.slice(0);try{var saved=JSON.parse(localStorage.getItem('sauveKettyWords')||'null');if(saved&&saved.length){var r=[];for(var i=0;i<saved.length;i++){var x=cleanWord(saved[i]);if(x)r.push(x)}return r}}catch(e){}return DEFAULT_WORDS_FR.slice(0)}
function resetLanguageToFrench(){
 lang='fr';
 try{localStorage.removeItem('kettyLang')}catch(e){}
 try{sessionStorage.removeItem('kettyLang')}catch(e){}
 setLanguage('fr');
}
function setLanguage(l){lang=l;try{localStorage.setItem(LANG_KEY,l)}catch(e){}WORDS=loadWords();GOOD=l==='fr'?GOOD_FR:GOOD_EN;BAD=l==='fr'?BAD_FR:BAD_EN;paintLanguage()}
function paintLanguage(){
 byId('startBtn').innerHTML=lang==='fr'?'JOUER':'PLAY';
 byId('rulesBtn').innerHTML=lang==='fr'?'RÈGLES':'RULES';
 byId('againBtn').innerHTML=lang==='fr'?'REJOUER':'PLAY AGAIN';
 byId('homeBtn').innerHTML=lang==='fr'?'ACCUEIL':'HOME';
 var p=document.querySelector('.prompt span');if(p)p.innerHTML=lang==='fr'?'CHOISIS UNE LETTRE':'CHOOSE A LETTER';
 if(lang==='fr'){addClass(byId('frBtn'),'active-lang');removeClass(byId('enBtn'),'active-lang')}else{addClass(byId('enBtn'),'active-lang');removeClass(byId('frBtn'),'active-lang')}

 updateLanguageBackground();
}
function show(id){var s=all('.screen');for(var i=0;i<s.length;i++)removeClass(s[i],'active');addClass(byId(id),'active')}
function safePlay(el){if(!el)return;try{el.pause();el.currentTime=0;var p=el.play();if(p&&typeof p.catch==='function')p.catch(function(){})}catch(e){}}
function play(id){var el=byId(id);if(el){el.volume=Math.max(0,Math.min(1,settings.sfx/100));safePlay(el)}}
function applyAudio(){music.volume=Math.max(0,Math.min(1,settings.music/100));var a=all('audio');for(var i=0;i<a.length;i++){if(a[i]===music)continue;if(a[i]===voicePlayer)a[i].volume=Math.max(0,Math.min(1,settings.voice/100));else a[i].volume=Math.max(0,Math.min(1,settings.sfx/100))}try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch(e){}}
function voiceFileFor(text){
 var fr={
 'Bienvenue dans Sauve Ketty. Oulala, il m’arrive un truc. Pour réparer mon système, il faut retrouver un mot de passe. Mais je ne vois plus rien ! J’ai besoin de ton aide !':'fr_intro.mp3',
 'Super !':'fr_good_01.mp3','Bonne réponse !':'fr_good_02.mp3','Cool !':'fr_good_03.mp3','Waouh !':'fr_good_04.mp3','Bravo !':'fr_good_05.mp3','C’est ça !':'fr_good_06.mp3',
 'Mince.':'fr_bad_01.mp3','Aïe.':'fr_bad_02.mp3','Ouille.':'fr_bad_03.mp3','Et non.':'fr_bad_04.mp3','Oups !':'fr_bad_05.mp3',
 'Attention, dernière chance pour me sauver !':'fr_last_chance.mp3',
 'Clique sur une lettre pour trouver le mot.':'fr_idle_01.mp3','N’aie pas peur, tu peux cliquer sur une lettre.':'fr_idle_02.mp3','Il reste encore quelques lettres à deviner !':'fr_idle_03.mp3','Eh bien alors ! J’ai besoin de ton aide ! Choisis une lettre.':'fr_idle_04.mp3','Je me sens un peu seule. Tant pis, on jouera une prochaine fois ! Bye bye.':'fr_idle_05.mp3',
 'Tu as déjà utilisé ton indice.':'fr_hint_already.mp3','Et hop, je vais t’enlever quelques mauvaises lettres !':'fr_hint.mp3',
 'Bravo ! Tu as trouvé le bon mot ! Je suis complètement réparée ! Merci.':'fr_win.mp3',
 'Ok. Une autre fois peut-être.':'fr_quit.mp3','Je parle français maintenant !':'fr_language.mp3','Bonjour ! Je suis Ketty. Le réglage de ma voix fonctionne.':'fr_test.mp3'
 };
 var en={
 'Welcome to Save Ketty! Oh no, something is wrong with me. To repair my system, you need to find a secret word. I can’t see it anymore. I need your help!':'en_intro.mp3',
 'Great!':'en_good_01.mp3','Good answer!':'en_good_02.mp3','Cool!':'en_good_03.mp3','Wow!':'en_good_04.mp3','Well done!':'en_good_05.mp3','That’s it!':'en_good_06.mp3',
 'Oops.':'en_bad_01.mp3','Oh no.':'en_bad_02.mp3','Not this one.':'en_bad_03.mp3','Nope.':'en_bad_04.mp3','Try again!':'en_bad_05.mp3',
 'Careful! This is your last chance to save me!':'en_last_chance.mp3',
 'Tap a letter to find the word.':'en_idle_01.mp3','Go on, choose a letter!':'en_idle_02.mp3','There are still a few letters to find!':'en_idle_03.mp3','Hey! I need your help! Choose a letter.':'en_idle_04.mp3','I feel a little lonely. Never mind, we’ll play another time! Bye bye.':'en_idle_05.mp3',
 'You have already used your hint.':'en_hint_already.mp3','Here we go! I’ll remove a few wrong letters for you!':'en_hint.mp3',
 'Well done! You found the word! I am completely repaired. Thank you!':'en_win.mp3',
 'Okay. Maybe another time.':'en_quit.mp3','I speak English now!':'en_language.mp3','Hello! I am Ketty. My voice setting is working.':'en_test.mp3'
 };
 if(lang==='fr' && fr[text])return 'voices/fr/'+fr[text];
 if(lang==='en' && en[text])return 'voices/en/'+en[text];
 if(lang==='fr' && text.indexOf('Ouf ! Heureusement que je suis incassable ! Le mot à trouver était ')===0)return 'voices/fr/fr_lose.mp3';
 if(lang==='en' && text.indexOf('Phew! Luckily I am unbreakable! The word was ')===0)return 'voices/en/en_lose.mp3';
 return '';
}
function say(text){byId('pepperLine').innerHTML=text||'';if(!text)return;var f=voiceFileFor(text);if(f&&voicePlayer){try{voicePlayer.pause();voicePlayer.currentTime=0;voicePlayer.src=f;voicePlayer.volume=Math.max(0,Math.min(1,settings.voice/100));var p=voicePlayer.play();if(p&&typeof p.catch==='function')p.catch(function(){});return}catch(e){}}try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang=lang==='fr'?'fr-FR':'en-GB';u.rate=1.03;u.pitch=1.08;u.volume=Math.max(0,Math.min(1,settings.voice/100));window.speechSynthesis.speak(u)}}catch(e){}}

function random(arr){return arr[Math.floor(Math.random()*arr.length)]}
WORDS=loadWords();GOOD=lang==='fr'?GOOD_FR:GOOD_EN;BAD=lang==='fr'?BAD_FR:BAD_EN;
function chooseWord(){var pool=[];for(var i=0;i<WORDS.length;i++)if(WORDS[i]!==previousWord)pool.push(WORDS[i]);word=random(pool.length?pool:WORDS);previousWord=word}
function clearIdle(){for(var i=0;i<idleTimers.length;i++)clearTimeout(idleTimers[i]);idleTimers=[]}
function resetIdle(){clearIdle();idleTimers.push(setTimeout(function(){say(lang==='fr'?random(['Clique sur une lettre pour trouver le mot.','N’aie pas peur, tu peux cliquer sur une lettre.','Il reste encore quelques lettres à deviner !']):random(['Tap a letter to find the word.','Go on, choose a letter!','There are still a few letters to find!']))},30000));idleTimers.push(setTimeout(function(){say(lang==='fr'?'Eh bien alors ! J’ai besoin de ton aide ! Choisis une lettre.':'Hey! I need your help! Choose a letter.');play('sfxTimer')},45000));idleTimers.push(setTimeout(function(){say(lang==='fr'?'Je me sens un peu seule. Tant pis, on jouera une prochaine fois ! Bye bye.':'I feel a little lonely. Never mind, we’ll play another time! Bye bye.');setTimeout(home,4500)},55000))}
function unlockAudio(){var aud=all('audio');for(var i=0;i<aud.length;i++){try{aud[i].load()}catch(e){}}}

function primeAudio(){
 try{
   music.volume=0;
   var p=music.play();
   if(p&&typeof p.then==='function'){
     p.then(function(){
       try{music.pause();music.currentTime=0;music.volume=Math.max(0,Math.min(1,settings.music/100))}catch(e){}
     }).catch(function(){
       music.volume=Math.max(0,Math.min(1,settings.music/100));
     });
   }else{
     try{music.pause();music.currentTime=0}catch(e){}
     music.volume=Math.max(0,Math.min(1,settings.music/100));
   }
 }catch(e){
   try{music.volume=Math.max(0,Math.min(1,settings.music/100))}catch(x){}
 }
}

function startGame(){unlockAudio();chooseWord();guessed={};wrong={};eliminated={};lives=10;hintUsed=false;show('game');try{music.currentTime=0}catch(e){}safePlay(music);render();say(lang==='fr'?'Bienvenue dans Sauve Ketty. Oulala, il m’arrive un truc. Pour réparer mon système, il faut retrouver un mot de passe. Mais je ne vois plus rien ! J’ai besoin de ton aide !':'Welcome to Save Ketty! Oh no, something is wrong with me. To repair my system, you need to find a secret word. I can’t see it anymore. I need your help!');resetIdle()}
function render(){renderWord();renderKeyboard();byId('batteryImg').src='battery/'+(lives===0?'00':String(lives*10))+'.png';var hb=byId('hintBtn');if(hintUsed)addClass(hb,'used');else removeClass(hb,'used');hb.getElementsByTagName('img')[0].src=hintUsed?'buttons/hint_done.png':'buttons/hint.png'}
function renderWord(){var box=byId('word');box.innerHTML='';for(var i=0;i<word.length;i++){var ch=word.charAt(i),slot=document.createElement('div');slot.className='letter-slot';if(has(guessed,ch))slot.innerHTML='<div class="letter">'+ch.toUpperCase()+'</div><img class="underline" src="underline_yes.png">';else slot.innerHTML='<img class="blur" src="letter_blur.png"><img class="underline" src="underline_no.png">';box.appendChild(slot)}}
function renderKeyboard(){var kb=byId('keyboard');kb.innerHTML='';var rows=['ABCDEFGHIJ','KLMNOPQRS','TUVWXYZ'];for(var r=0;r<rows.length;r++){var row=document.createElement('div');row.className='key-row';for(var i=0;i<rows[r].length;i++){(function(L){var l=L.toLowerCase(),b=document.createElement('button'),path='keyboard/normal/'+L+'.png';b.className='key';if(has(guessed,l))path='keyboard/right/'+L+'-right.png';if(has(wrong,l)||has(eliminated,l))path='keyboard/false/'+L+'-false.png';if(has(eliminated,l))addClass(b,'disabled');b.innerHTML='<img src="'+path+'" alt="'+L+'">';b.disabled=has(guessed,l)||has(wrong,l)||has(eliminated,l);b.onclick=function(){pick(l)};row.appendChild(b)})(rows[r].charAt(i))}kb.appendChild(row)}}
function allWordGuessed(){for(var i=0;i<word.length;i++)if(!has(guessed,word.charAt(i)))return false;return true}
function pick(letter){resetIdle();if(word.indexOf(letter)>=0){guessed[letter]=true;play('sfxGood');say(random(GOOD));render();if(allWordGuessed())finish(true)}else{wrong[letter]=true;lives=Math.max(0,lives-1);play('sfxLife');say(random(BAD));render();if(lives===1)setTimeout(function(){say(lang==='fr'?'Attention, dernière chance pour me sauver !':'Careful! This is your last chance to save me!')},500);if(lives===0)finish(false)}}
function finish(win){
 clearIdle();
 try{music.pause()}catch(e){}
 show('end');

 var img=byId('endImage');
 img.style.display='block';
 img.style.opacity='1';
 img.style.visibility='visible';
 img.style.webkitTransform='none';
 img.style.transform='none';
 img.src=win?'sauve_ketty_win_kettybot.jpg':'sauve_ketty_lose_kettybot.jpg';

 byId('endText').innerHTML=win
   ?(lang==='fr'?'Bravo ! Tu as trouvé le bon mot ! Ketty est réparée !':'Well done! You found the word! Ketty is repaired!')
   :(lang==='fr'?'Le mot à trouver était « '+word.toUpperCase()+' ». Heureusement, Ketty est incassable !':'The word was “'+word.toUpperCase()+'”. Luckily, Ketty is unbreakable!');

 /* IMPORTANT KETTYBOT:
    play the final voice immediately, before the end SFX, so the old WebView
    does not block it because of delayed/autoplay rules or simultaneous media. */
 if(win){
   say(lang==='fr'
     ?'Bravo ! Tu as trouvé le bon mot ! Je suis complètement réparée ! Merci.'
     :'Well done! You found the word! I am completely repaired. Thank you!');
   setTimeout(function(){play('sfxWin')},900);
 }else{
   say(lang==='fr'
     ?'Ouf ! Heureusement que je suis incassable ! Le mot à trouver était '+word+'.'
     :'Phew! Luckily I am unbreakable! The word was '+word+'.');
   setTimeout(function(){play('sfxLose')},900);
 }
}
function closeModal(){addClass(byId('modal'),'hidden')}
function modal(title,text,yesFn){byId('modalTitle').innerHTML=title;byId('modalText').innerHTML=text;var a=byId('modalActions');a.innerHTML='';var no=document.createElement('button');no.innerHTML=lang==='fr'?'NON':'NO';no.onclick=closeModal;a.appendChild(no);if(yesFn){var yes=document.createElement('button');yes.innerHTML=lang==='fr'?'OUI':'YES';yes.onclick=function(){yesFn();closeModal()};a.appendChild(yes)}removeClass(byId('modal'),'hidden')}
function useHint(){resetIdle();if(hintUsed){say(lang==='fr'?'Tu as déjà utilisé ton indice.':'You have already used your hint.');return}play('sfxHint');modal(lang==='fr'?'Indice':'Hint',lang==='fr'?'Attention, tu n’as droit qu’à un seul indice. Veux-tu vraiment l’utiliser maintenant ?':'Careful, you only have one hint. Do you really want to use it now?',function(){hintUsed=true;play('sfxLife');say(lang==='fr'?'Et hop, je vais t’enlever quelques mauvaises lettres !':'Here we go! I’ll remove a few wrong letters for you!');var c=[],alpha='abcdefghijklmnopqrstuvwxyz';for(var i=0;i<alpha.length;i++){var x=alpha.charAt(i);if(word.indexOf(x)<0&&!has(guessed,x)&&!has(wrong,x))c.push(x)}for(var j=0;j<3&&c.length;j++){var k=Math.floor(Math.random()*c.length);eliminated[c.splice(k,1)[0]]=true}render()})}
function quit(){resetIdle();modal(lang==='fr'?'Quitter':'Quit',lang==='fr'?'Es-tu sûr de vouloir quitter le jeu ?':'Are you sure you want to quit the game?',function(){play('sfxQuit');say(lang==='fr'?'Ok. Une autre fois peut-être.':'Okay. Maybe another time.');setTimeout(home,1800)})}
function rules(){byId('modalTitle').innerHTML=lang==='fr'?'Règles':'Rules';byId('modalText').innerHTML=lang==='fr'?'Trouve les bonnes lettres pour afficher le bon mot. Une mauvaise lettre fait baisser la batterie. Tu as 10 vies et un seul indice, qui élimine trois mauvaises lettres.':'Find the right letters to reveal the secret word. A wrong letter lowers the battery. You have 10 lives and one hint, which removes three wrong letters.';var a=byId('modalActions');a.innerHTML='';var b=document.createElement('button');b.innerHTML=lang==='fr'?'J’AI COMPRIS':'GOT IT';b.onclick=closeModal;a.appendChild(b);removeClass(byId('modal'),'hidden')}
function home(){
 resetLanguageToFrench();clearIdle();try{music.pause()}catch(e){}try{if(window.speechSynthesis)window.speechSynthesis.cancel()}catch(e){}show('intro');byId('pepperLine').innerHTML=''}
byId('startBtn').onclick=startGame;byId('rulesBtn').onclick=rules;byId('hintBtn').onclick=useHint;byId('quitBtn').onclick=quit;byId('againBtn').onclick=startGame;byId('homeBtn').onclick=home;


/* Language buttons */
byId('frBtn').onclick=function(){primeAudio();setLanguage('fr');say('Je parle français maintenant !')};
byId('enBtn').onclick=function(){primeAudio();setLanguage('en');say('I speak English now!')};

/* Hidden admin: 3 taps in top-right within 2 seconds + ?admin=1 */
var tapCount=0,tapTimer=null;
function openSettings(){
 byId('settingsTitle').innerHTML=lang==='fr'?'Réglages Ketty':'Ketty settings';
 byId('voiceLabel').innerHTML=lang==='fr'?'🗣 Voix de Ketty':'🗣 Ketty voice';
 byId('sfxLabel').innerHTML=lang==='fr'?'🔔 Effets sonores':'🔔 Sound effects';
 byId('musicLabel').innerHTML=lang==='fr'?'🎵 Musique':'🎵 Music';
 byId('testVoice').innerHTML=lang==='fr'?'▶ Tester la voix':'▶ Test voice';
 byId('testSound').innerHTML=lang==='fr'?'▶ Tester le son':'▶ Test sound';
 byId('closeSettings').innerHTML=lang==='fr'?'FERMER':'CLOSE';
 byId('voiceVolume').value=settings.voice;byId('sfxVolume').value=settings.sfx;byId('musicVolume').value=settings.music;
 updateSettingsValues();
 var ok=!!voicePlayer;
 byId('voiceStatus').innerHTML=(lang==='fr'?'Voix MP3 intégrée : ':'MP3 voice integrated: ')+(ok?'OUI / YES':'NON / NO');
 removeClass(byId('settingsModal'),'hidden');
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

try{updateLanguageBackground();}catch(e){}

try{resetLanguageToFrench();}catch(e){}
