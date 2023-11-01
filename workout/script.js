let currentDay = new Date().getDay();
let exercises;

function setDailyWorkout() {
  switch (currentDay) {
    case 1: // Monday
      exercises = [
        {name: 'Warm-Up', type: 'time', value: 600, sets: 1},
        {name: 'Push-Ups', type: 'reps', value: 15, sets: 3},
        {name: 'Plank', type: 'time', value: 60, sets: 3},
        {name: 'Bicycle Crunches', type: 'reps', value: 20, sets: 3},
        {name: 'Dumbbell Shoulder Press', type: 'reps', value: 10, sets: 3},
        {name: 'Cool Down', type: 'time', value: 600, sets: 1}
      ];
      break;
    case 2: // Tuesday
      exercises = [
        {name: 'Running', type: 'time', value: 2400, sets: 1}
      ];
      break;
    case 3: // Wednesday
      exercises = [
        {name: 'Warm-Up', type: 'time', value: 600, sets: 1},
        {name: 'Bodyweight Squats', type: 'reps', value: 20, sets: 3},
        {name: 'Side Planks', type: 'time', value: 60, sets: 3},
        {name: 'Reverse Lunges', type: 'reps', value: 15, sets: 3},
        {name: 'Glute Bridges', type: 'reps', value: 20, sets: 3},
        {name: 'Cool Down', type: 'time', value: 600, sets: 1}
      ];
      break;
    case 4: // Thursday
      exercises = [
        {name: 'Interval Running', type: 'time', value: 2400, sets: 1}
      ];
      break;
    case 5: // Friday
      exercises = [
        {name: 'Warm-Up', type: 'time', value: 600, sets: 1},
        {name: 'Mountain Climbers', type: 'reps', value: 20, sets: 3},
        {name: 'Russian Twists', type: 'reps', value: 20, sets: 3},
        {name: 'Burpees', type: 'reps', value: 10, sets: 3},
        {name: 'Alternating Arm/Leg Plank', type: 'reps', value: 10, sets: 3},
        {name: 'Cool Down', type: 'time', value: 600, sets: 1}
      ];
      break;
    default:
      exercises = [
        {name: 'Rest', type: 'time', value: 600, sets: 1}
      ];
  }
}

setDailyWorkout();

let currentExercise = 0;
let currentSet = 0;
let currentCount = 0;

const exerciseNameElement = document.getElementById('exercise-name');
const exerciseCountElement = document.getElementById('exercise-count');
const pauseButton = document.getElementById('pause-button');
const nextUpElement = document.getElementById('next-up');

let isPaused = false;

const audio = new Audio('https://freesound.org/data/previews/204/204694_2570743-lq.mp3');

pauseButton.addEventListener('click', function() {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Play' : 'Pause';
});

function startWorkout() {
  setInterval(function() {
    if (isPaused) return;

    const exercise = exercises[currentExercise];
    exerciseNameElement.textContent = exercise.name;

    // ... existing logic for running workouts
  }, 2000);
}

function nextExercise() {
  // ... existing logic for moving to next exercise
}

startWorkout();