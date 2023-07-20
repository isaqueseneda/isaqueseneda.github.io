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

  // 4. Add distortions
  distortElements();

  // 5. Change background
  if(window.innerWidth >= 500) {
    // Add 'background-active' class to the body
    document.body.classList.add('background-active');
  
    // Skew the background
    skewBackground();
  }
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
  
  // 5. Remove all distortions
  revertElements();

  // If viewport width is 500px or more, remove 'background-active' class
  if(window.innerWidth >= 500) {
    // Remove 'background-active' class from the body
    document.body.classList.remove('background-active');
  }
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






// chaos distort function
// chaos distort function
// chaos distort function


function distortElements() {
  // Get all elements on the page
  let allElements = document.querySelectorAll('*');

  // Iterate over each element
  allElements.forEach((el) => {
    // Ignore elements with tagName 'HTML', 'BODY' or class 'inheadertitlebox' or 'header'
    if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.classList.contains('inheadertitlebox') || el.classList.contains('header') || el.classList.contains('theproject')) {
      return;
    }

    //vw ratio
    var ratioBon = Math.min(1, (window.innerWidth - 300) / 2200);

    // Generate random skew and scale values
    let skewX = (Math.random() * 60 - 30) * ratioBon; // Between -30 and 30 degrees
    let skewY = (Math.random() * 60 - 30) * ratioBon; // Between -30 and 30 degrees
    let scaleX = 1 + (Math.random() * 0.2 - 0.1); // Between 0.9 and 1.1
    let scaleY = 1 + (Math.random() * 0.2 - 0.1); // Between 0.9 and 1.1

    // Set the transformation
    el.style.transform = `skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`;
  });
}

// Remove all transformations
function revertElements() {
  // Get all elements on the page
  let allElements = document.querySelectorAll('*');

  // Iterate over each element
  allElements.forEach((el) => {
    // Ignore elements with tagName 'HTML', 'BODY' or class 'inheadertitlebox' or 'header'
    if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.classList.contains('inheadertitlebox') || el.classList.contains('header') || el.classList.contains('theproject')) {
      return;
    }

    // Remove all transformations
    el.style.transform = '';
  });
}





//skewing-bg
function skewBackground() {
  // Generate random skew values
  let skewX = Math.random() * 20 + 70; // Between -60 and 60 degrees
  let skewY = Math.random() * 5 + 10; // Between -60 and 60 degrees

  // Apply skew to the body's before pseudo-element
  document.documentElement.style.setProperty('--bg-skew-x', `${skewX}deg`);
  document.documentElement.style.setProperty('--bg-skew-y', `${skewY}deg`);
}
