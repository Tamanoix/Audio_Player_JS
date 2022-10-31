
const musicsData = [
  { title: "Solar", artist: "Betical", id: 1 },
  { title: "Electric-Feel", artist: "TEEMID", id: 2 },
  { title: "Aurora", artist: "SLUMB", id: 3 },
  { title: "Lost-Colours", artist: "Fakear", id: 4 },
];

const musicPlayer = document.querySelector('audio');
const musicTitle = document.querySelector('.music-title');
const artistName = document.querySelector('.artist-name');
const thumbnail = document.querySelector('.thumbnail');
const indexTxt = document.querySelector('.current-index');

let currentMusicIndex = 1;

// Fonction pour mettre à jour les données dans l'html (div.top-information) ainsi que l'image et la musique
function changeUI({title, artist}) {
  musicTitle.textContent = title;
  artistName.textContent = artist;
  thumbnail.src = `./ressources/thumbs/${title}.png`;
  musicPlayer.src = `./ressources/music/${title}.mp3`;
  indexTxt.textContent = `${currentMusicIndex} / ${musicsData.length}`;
}

// On lance la fonction une première fois pour alimenter l'html au chargement de la page avec la première chanson (index = id - 1 car il commence à 0)
changeUI(musicsData[currentMusicIndex - 1]);


const playBtn = document.querySelector('.play-btn');

playBtn.addEventListener('click', handlePlayPause);

function handlePlayPause() {
  // Si l'audio est sur pause, on rejoue, sinon on pause
  if (musicPlayer.paused) play();
  else pause();
}

function play() {
  playBtn.querySelector('img').src = "./ressources/icons/pause-icon.svg";
  musicPlayer.play();
}

function pause() {
  playBtn.querySelector('img').src = "./ressources/icons/play-icon.svg";
  musicPlayer.pause();
}


const displayCurrentTime = document.querySelector('.current-time');
const durationTime = document.querySelector('.duration-time');
const progressBar = document.querySelector('.progress-bar');

musicPlayer.addEventListener('loadeddata', fillDurationVariables);

let current;
let totalDuration;

function fillDurationVariables() {

  current = musicPlayer.currentTime;
  // Renvoie une durée en secondes
  totalDuration = musicPlayer.duration;

  formatValue(current, displayCurrentTime);
  formatValue(totalDuration, durationTime);
}

function formatValue(value, element) {

  // On enlève les chiffres après la virgule de la valeur divisée par 60
  let currentMin = Math.trunc(value / 60);
  // On utilise le modulo de la division par 60 pour les secondes
  let currentSec = Math.trunc(value % 60);

  // Si les secondes sont inférieures à 10, on affiche quand même 2 chiffres (avec un 0 devant)
  if (currentSec < 10) {
    currentSec = `0${currentSec}`;
  }

  // On le rajoute ensuite à notre élément (soit displayCurrentTime, soit durationTime)
  element.textContent = `${currentMin}:${currentSec}`;
}


musicPlayer.addEventListener('timeupdate', updateProgress);

function updateProgress(e) {

  // On récupère le temps de la musique actuelle dans le lecteur
  current = e.srcElement.currentTime;

  formatValue(current, displayCurrentTime);

  // On fait avancer la progressbar en fonction de l'avancement de la musique par rapport à la durée totale
  const progressValue = current / totalDuration;
  progressBar.style.transform = `scaleX(${progressValue})`;
}


const progressBarContainer = document.querySelector('.progress-container');

progressBarContainer.addEventListener('click', setProgress);


// Informations sur la position et dimensions de l'élément
let rect = progressBarContainer.getBoundingClientRect();
// La taille totale de notre progressBar
let width = rect.width;


function setProgress(e) {

  /* 
  clientX = là où se trouve le click par rapport au bord gauche de la fenêtre de l'écran
  rect.left = là où commence mon lecteur audio par rapport au bord gauche de la fenêtre de l'écran
  Donc cela nous donne le point où le client a cliqué exactement sur le lecteur 
  */
  const x = e.clientX - rect.left;

  // On actualise le currentTime avec le pourcentage de là où le client a cliqué (= son click / la taille totale de la progressBarContainer) par rapport à la durée totale de la vidéo
  musicPlayer.currentTime = ( x / width ) * totalDuration;
}


const btnShuffle = document.querySelector('.shuffle');

btnShuffle.addEventListener('click', switchShuffle);

// Par défaut, shuffle (donc lecture aléatoire) est sur false
let shuffle = false;

function switchShuffle() {

  // On toggle la classe active sur le bouton shuffle (pour l'effet visuel en css) et on toggle shuffle (true/false)
  btnShuffle.classList.toggle('active');
  shuffle = !shuffle;
}


const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');


// Pour chacun de mes boutons, je suis à l'écoute de l'événement click, qui lancera ma fonction changeSong
[prevBtn, nextBtn].forEach(btn => btn.addEventListener('click', changeSong));
// Egalement quand la musique se termine
musicPlayer.addEventListener('ended', changeSong);


function changeSong(e) {

  // Si shuffle est sur true, on joue une chanson au hasard et on sort de la fonction changeSong()
  if (shuffle) {
    playAShuffledSong();
    return;
  }

  // Si ce qui a provoqué l'événement est le click sur le bouton Next, ou bien si la musique vient de se terminer, on passe à la musique suivante, sinon c'est qu'on a appuyé sur le bouton Prev, et donc on revient en arrière
  e.target.classList.contains('next-btn') || e.type === "ended" ? currentMusicIndex++ : currentMusicIndex-- ;

  // Si je suis sur la première musique et que je clique sur Prev, on revient sur la dernière
  if (currentMusicIndex < 1) currentMusicIndex = musicsData.length;
  // Si je suis sur la dernière musique et qu'elle se termine ou qu'on appuie sur Next, on revient sur la première
  else if (currentMusicIndex > musicsData.length) currentMusicIndex = 1;

  // On change l'interface avec la nouvelle musique (l'index = l'id - 1 car il commence à 0)
  changeUI(musicsData[currentMusicIndex - 1]);
  // Et on lance la musique
  play();
}


// La fonction pour jouer une chanson au hasard (appelée via changeSong si shuffle est sur true)
function playAShuffledSong() {
  
  // On crée un tableau sans la chanson actuelle pour choisir une musique au hasard, mais on n'a pas envie de retomber sur la même musique (donc on filtre les musiques sans la musique actuelle)
  const musicsWithoutCurrentSong = musicsData.filter(el => el.id !== currentMusicIndex);

  // On génère un Math.random() de 0 à la taille totale du tableau (l'ensemble de nos musiques) qui nous permet de trouver une musique au hasard, sans la musique en cours
  const randomMusic = musicsWithoutCurrentSong[Math.trunc(Math.random() * musicsWithoutCurrentSong.length)];

  // On actualise currentMusicIndex pour qu'en relançant playAShuffledSong(), ce soit bien la nouvelle musique qui soit ignorée
  currentMusicIndex = randomMusic.id;

  // On actualise l'interface avec la nouvelle musique, et on la lance
  changeUI(randomMusic);
  play();
}

