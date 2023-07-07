// check for saved 'darkMode' in localStorage
let darkMode = localStorage.getItem('darkMode'); 

const darkModeToggle = document.querySelector('#dark-mode-toggle');

// Adding audio element and setting loop to true
const audioElement = new Audio('audio/chaos.mp3');
audioElement.loop = true;

const enableDarkMode = () => {
  // 1. Add the class to the body
  document.body.classList.add('darkmode');
  // 2. Update darkMode in localStorage
  localStorage.setItem('darkMode', 'enabled');
  // 3. Play the audio
  audioElement.play();
}

const disableDarkMode = () => {
  // 1. Remove the class from the body
  document.body.classList.remove('darkmode');
  // 2. Update darkMode in localStorage 
  localStorage.setItem('darkMode', null);
  // 3. Pause the audio
  audioElement.pause();
  // 4. Reset the audio time
  audioElement.currentTime = 0;
}
 
// If the user already visited and enabled darkMode
// start things off with it on
if (darkMode === 'enabled') {
  enableDarkMode();
}

// When someone clicks the button
darkModeToggle.addEventListener('click', () => {
  // get their darkMode setting
  darkMode = localStorage.getItem('darkMode'); 
  
  // if it not current enabled, enable it
  if (darkMode !== 'enabled') {
    enableDarkMode();
  // if it has been enabled, turn it off  
  } else {  
    disableDarkMode(); 
  }
});

// If darkMode is enabled when the page loads, start playing the audio
window.addEventListener('load', () => {
  darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    audioElement.play();
  }
});
