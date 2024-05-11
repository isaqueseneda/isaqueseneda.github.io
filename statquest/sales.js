//Course Structure Filler

let data = [
  {
    "moduleNumber": 1,
    "moduleTitle": "THE 10 ATTRIBUTES",
    "videos": [
      {"nameVideo": "WELCOME", "videoTime": "5:10", "preview": false},
      {"nameVideo": "DIRECTION", "videoTime": "8:51", "preview": false},
      {"nameVideo": "LEVELS OF MEASUREMENT", "videoTime": "18:01", "preview": false},
      {"nameVideo": "CHOOSING A TEST", "videoTime": "4:56", "preview": false},
      {"nameVideo": "RUNNING, READING, REPORTING", "videoTime": "6:01", "preview": false},
      {"nameVideo": "H0, INTERPRETATION, STRENGTH", "videoTime": "3:23", "preview": false}
    ]
  },
  {
    "moduleNumber": 2,
    "moduleTitle": "MCRS: TESTING FUNDAMENTALS",
    "videos": [
      {"nameVideo": "STATS FUNDAMENTALS", "videoTime": "17:44", "preview": false},
      {"nameVideo": "Z-SCORES", "videoTime": "34:28", "preview": false},
      {"nameVideo": "ALL DISTRIBUTIONS", "videoTime": "41:29", "preview": false},
      {"nameVideo": "SCIENCE FUNDAMENTALS", "videoTime": "17:27", "preview": false},
      {"nameVideo": "✳️ LITERALLY EVERY TEST", "videoTime": "54:36", "preview": false}
    ]
  },
  {
    "moduleNumber": 3,
    "moduleTitle": "MCRS: THE 10 TESTS",
    "videos": [
      {"nameVideo": "✳️ LITERALLY EVERY (T-TEST)", "videoTime": "8:24", "preview": false},
      {"nameVideo": "ONE-SAMPLE T-TEST", "videoTime": "58:07", "preview": false},
      {"nameVideo": "INDEPENDENT-SAMPLES T-TEST", "videoTime": "38:01", "preview": false},
      {"nameVideo": "DEPEPENDENT-SAMPLES T-TEST", "videoTime": "45:42", "preview": false},
      {"nameVideo": "✳️ LITERALLY EVERY (F-TEST) / VAR", "videoTime": "5:42", "preview": false},
      {"nameVideo": "ONE-WAY ANOVA F-TEST", "videoTime": "58:46", "preview": false},
      {"nameVideo": "TWO-WAY ANOVA F-TEST", "videoTime": "61:11", "preview": false},
      {"nameVideo": "CORRELATION T-TEST", "videoTime": "57:19", "preview": false},
      {"nameVideo": "LINEAR REGRESSION F-TEST", "videoTime": "57:25", "preview": false},
      {"nameVideo": "CHI-SQUARE X-TEST", "videoTime": "63:00", "preview": false},
      {"nameVideo": "FACTOR ANALYSIS + RELIABILITY", "videoTime": "47:21", "preview": false}
    ]
  },
  {
    "moduleNumber": 4,
    "moduleTitle": "SMCR: THE 10 ATTRIBUTES II",
    "videos": [
      {"nameVideo": "1️⃣+2️⃣ ALL DISTRIBUTIONS II", "videoTime": "30:53", "preview": false},
      {"nameVideo": "3️⃣+4️⃣ THE BOUNCER DILEMMA", "videoTime": "23:56", "preview": false},
      {"nameVideo": "5️⃣+6️⃣ P-VALUES SUCK", "videoTime": "19:17", "preview": false}
    ]
  },
  {
    "moduleNumber": 5,
    "moduleTitle": "SMCR: PRO MODULE: 10 TESTS II",
    "videos": [
      {"nameVideo": "✳️ WHAT IS VARIANCE AGAIN?", "videoTime": "56:48", "preview": false},
      {"nameVideo": "7️⃣ ANOVA FOR REAL", "videoTime": "58:02", "preview": false},
      {"nameVideo": "✳️ REGRESSION FOR REAL", "videoTime": "57:30", "preview": false},
      {"nameVideo": "8️⃣ REGRESSION MODERATION 1", "videoTime": "53:37", "preview": false},
      {"nameVideo": "9️⃣ REGRESSION MODERATION 2", "videoTime": "61:49", "preview": false},
      {"nameVideo": "🔟 SUPPRESSORS & REINFORCERS", "videoTime": "60:11", "preview": false},
      {"nameVideo": "🔟 REGRESSION PATH MEDIATION", "videoTime": "54:06", "preview": false}
    ]
  },
  {
    "moduleNumber": 6,
    "moduleTitle": "FINAL PRACTICE",
    "videos": [
      {"nameVideo": "PRACTICE EXAM #1", "videoTime": "62:00", "preview": false},
      {"nameVideo": "PRACTICE EXAM #2", "videoTime": "55:44", "preview": false},
      {"nameVideo": "PRACTICE EXAM #3", "videoTime": "58:33", "preview": false},
      {"nameVideo": "PRACTICE EXAM #4", "videoTime": "53:22", "preview": false},
      {"nameVideo": "PRACTICE EXAM #5", "videoTime": "61:14", "preview": false},
      {"nameVideo": "PRACTICE EXAM #6", "videoTime": "61:14", "preview": false},
      {"nameVideo": "DIY PRACTICE EXAMS", "videoTime": "61:14", "preview": false}
    ]
  },
  {
    "moduleNumber": 7,
    "moduleTitle": "EXTRAS",
    "videos": [
      {"nameVideo": "REPEATED MEASURES F-TEST", "videoTime": "58:33", "preview": false},
      {"nameVideo": "ANCOVA FOR REAL", "videoTime": "53:22", "preview": false},
      {"nameVideo": "SOBEL TEST", "videoTime": "61:14", "preview": false}
    ]
  }
];

// Section 1: Schedule generator

// Container for the schedule
const scheduleContainer = document.querySelector('.schedule_wrapper');

// Iterating over data array
data.forEach((module, index) => {
  const schedule = document.createElement('div');
  schedule.className = "schedule";

  const scheduleHeader = document.createElement('div');
  scheduleHeader.className = "schedule_header";
  
  const img = document.createElement('img');
  img.className = "course-mod-img";
  img.src = `images/n${module.moduleNumber}.png`;
  
  const title = document.createElement('div');
  title.className = "course-mod-txt";
  title.textContent = module.moduleTitle;

  scheduleHeader.appendChild(img);
  scheduleHeader.appendChild(title);
  schedule.appendChild(scheduleHeader);

  module.videos.forEach(video => {
    const courseRow = document.createElement('div');
    courseRow.className = "course-row";
    
    const arrow = document.createElement('div');
    arrow.className = "course-mod-arrow";
    
    const videoName = document.createElement('div');
    videoName.className = "course-mod-txt list";
    videoName.textContent = video.nameVideo;
    
    const videoTime = document.createElement('a');
    videoTime.className = "course-mod-length";
    videoTime.textContent = video.videoTime;  

    const videoPreview = document.createElement('a');
    videoPreview.className = "course-mod-preview";
    videoPreview.textContent = " PREVIEW";
    videoPreview.style.display = video.preview ? "block" : "none";

    if (video.preview) {
      arrow.style.filter = "brightness(0%)";
    }

    courseRow.appendChild(arrow);
    courseRow.appendChild(videoName);
    courseRow.appendChild(videoTime);
    courseRow.appendChild(videoPreview);
    schedule.appendChild(courseRow);
  });

  scheduleContainer.appendChild(schedule);
});

const div = document.createElement('div');
div.className = "course-mod-length legend";
div.innerHTML = '1️⃣ = BOOK CHAPTER OF "A GENTLE BUT CRITICAL INTRODUCTION TO STATISTICAL INFERENCE"';
scheduleContainer.appendChild(div);

// Section 2: Collapse Mechanisms

// Function to create collapsible container
const createCollapsibleContainer = (containerSelector, buttonWrapperSelector) => {
  const container = document.querySelector(containerSelector);

  // Generate unique button ids based on the container selector
  const buttonId = `collapse-button-${containerSelector.replace('.', '')}`;
  const topButtonId = `collapse-button-top-${containerSelector.replace('.', '')}`;

  // Initialize container to be collapsed
  container.style.height = '250px';
  container.style.overflow = 'hidden';

  const createButton = (isTopButton = false) => {
    const button = document.createElement('button');
    button.id = isTopButton ? topButtonId : buttonId;
    button.textContent = isTopButton ? '↑' : '↓';
    button.addEventListener('click', function() {
      if (container.style.height == '250px') {
        container.style.height = 'auto';
      } else {
        container.style.height = '250px';
      }

      if (!document.querySelector(`#${topButtonId}`)) {
        const topButton = createButton(true);
        container.prepend(topButton);
      }

      document.querySelectorAll(`#${buttonId}, #${topButtonId}`).forEach(btn => {
        if (container.style.height == 'auto') {
          btn.textContent = '↑'; 
        } else {
          btn.textContent = '↓'; 
        }
      });

      const topButton = document.querySelector(`#${topButtonId}`);
      if (topButton) {
        topButton.style.display = (container.style.height == 'auto') ? 'block' : 'none';
      }

      if (container.style.height != 'auto' && !isTopButton) {
        const rect = button.getBoundingClientRect();
        window.scrollTo({
          top: window.pageYOffset + rect.top - window.innerHeight / 2, 
          behavior: 'smooth'
        });
      }
    });
    return button;
  };

  // Fetch collapse-button-wrapper and append button there
  const collapseButtonWrapper = document.querySelector(buttonWrapperSelector);
  collapseButtonWrapper.appendChild(createButton());
};

// Apply the collapse mechanism to the schedule wrapper
createCollapsibleContainer('.schedule_wrapper', '#collapse-button-wrapper2');

// Apply the collapse mechanism to the live wrapper
createCollapsibleContainer('.live_wrapper', '#collapse-button-wrapper');






//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//







    // Define event structure
const Event = {
    title: '',
    startDate: '',
    endDate: '',
    time: '',
    location: '',
};

function getEventStatus(start, end, signUpDate) {
    const today = new Date();
    const endOfPlan = new Date();
    endOfPlan.setDate(today.getDate() + 60);

    if (start < today && end > today) {
        return { text: 'PARTIALLY INCLUDED (STARTED)', color: 'blue' };
    } else if (start >= today && end <= endOfPlan) {
        return { text: 'INCLUDED', color: 'green' };
    } else if (start < endOfPlan && end > endOfPlan) {
        return { text: 'PARTIALLY INCLUDED (RENEW)', color: 'blue' };
    } else {
        const signUpDateStr = `${signUpDate.toLocaleString('default', { month: 'long' })} ${signUpDate.getDate()}`;
        return { text: `RENEW FROM ${signUpDateStr.toUpperCase()}`, color: 'grey' };
    }
}

// Function to generate event HTML
function createEventHTML(event, title) {
    const start = new Date(event.startDate.split("-").reverse().join("-"));
    const end = new Date(event.endDate.split("-").reverse().join("-"));

    const signUpDate = new Date(start.getTime());
    signUpDate.setDate(signUpDate.getDate() - 60);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // If the event is already over, do not create HTML for it
    if (end < today) {
        return '';
    }

    const startDateStr = `${start.toLocaleString('default', { month: 'long' }).toUpperCase()} ${start.getDate()}`;
    const endDateStr = `${end.toLocaleString('default', { month: 'long' }).toUpperCase()} ${end.getDate()}`;
    const dateRange = `${startDateStr} -> ${endDateStr}`;

    const eventStatus = getEventStatus(start, end, signUpDate);

    let html = `${title}
    <div class="event_wrapper">
        <div class="liveplus_event">
            <div class="event_header">
                <div class="tier-price out">
                    <div STYLE="display: flex; align-items: center;">
                        <div style="width: 10px; height: 10px; border-radius: 20px; background-color: ${eventStatus.color}; margin-right: 3px;"></div>
                        <div style="color: ${eventStatus.color};">LIVE</div>
                    </div>
                </div>
                <div class="event_included">
                    <img src="images/incl.svg" class="event_included_img">
                    <div class="event_included_text" style="color: ${eventStatus.color};">${eventStatus.text}</div>
                </div>
            </div>
            <div class="event_title">${event.title}</div>
            <div class="event_date">${dateRange}</div>
        </div>`;

    const endOfPlan = new Date();
    endOfPlan.setDate(today.getDate() + 30);

    for(let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateStr = `${dt.toLocaleString('default', { month: 'long' }).toUpperCase()} ${dt.getDate()}`;

        let appendixStyle = '';
        let textColor = '';
        let borderColor = '';

        if(dt < today) {
            appendixStyle = 'background: repeating-linear-gradient(-45deg, #f3f3f3, #f3f3f3 7px, #000 2px, #000 8px);';
        } else if(dt > endOfPlan) {
            textColor = 'color: #c2c2c2;';
            borderColor = 'border: 1px solid #c2c2c2;'
        }

        html += `
            <div class="liveplus_event appendix" style="${appendixStyle}">
                <div class="event_footer" style="${textColor}">
                    <div class="event_time" style="${borderColor}">${dateStr}</div>
                    <div class="event_included_text">${event.time}</div>
                </div>
                <div class="event_place" style="${textColor}">${event.location}</div>
            </div>`;
    }

    html += '</div>';

    return html;
}

// Array of events
const events = [
    {
      title: 'OFFICE HOURS',
      startDate: '28-02-2024',
      endDate: '28-03-2024',
      time: '8:00PM CET',
      location: 'VIA ZOOM',
  },
    // Add more events here
];

// Generate the HTML for all events
const liveWrapper = document.querySelector('.live_wrapper');
let upcomingTitleAdded = false;
let afterTitleAdded = false;

events.forEach(event => {
    const start = new Date(event.startDate.split("-").reverse().join("-"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfPlan = new Date();
    endOfPlan.setDate(today.getDate() + 60);

    let title = "";
    if (start <= endOfPlan && !upcomingTitleAdded) {
        title = "";
        upcomingTitleAdded = true;
    } else if (start > endOfPlan && !afterTitleAdded) {
        title = "<h2>UPCOMING</h2>";
        afterTitleAdded = true;
    }

    const eventHTML = createEventHTML(event, title);
    liveWrapper.innerHTML += eventHTML;
});









//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//









window.addEventListener('load', function() {
    // Get the current date
    var uniqueCurrentDate = new Date();

    // Add 30 days to the current date
    uniqueCurrentDate.setDate(uniqueCurrentDate.getDate() + 30);

    // Create a string with the month and day
    var uniqueMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var uniqueMonth = uniqueMonthNames[uniqueCurrentDate.getMonth()];
    var uniqueDay = uniqueCurrentDate.getDate();

    var uniqueFutureDate = uniqueMonth + " " + uniqueDay;

    // Set the uniqueFutureDate string as the innerHTML of all elements with the class sign-up-line-date
    var signUpLineDateElements = document.querySelectorAll(".SignUpLineDate");
    signUpLineDateElements.forEach(function(element) {
        element.innerHTML = uniqueFutureDate;
    });
});





//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//







function increaseValue(inputId) {
  var inputElement = document.getElementById(inputId);
  if(!inputElement) return; // Safeguard
  var value = parseInt(inputElement.value, 10);
  value = isNaN(value) ? 0 : value;
  if (inputId === 'numFriends' && value < 5) {
      value++;
      
      var studentDiv = document.createElement('div');
      studentDiv.className = 'student';
      var studentsWrapper = document.querySelector('.students_wrapper');
      if(studentsWrapper) studentsWrapper.appendChild(studentDiv); // Safeguard
  }
  inputElement.value = value;
  calculate();
  updateButtonURL();
}

function decreaseValue(inputId) {
  var inputElement = document.getElementById(inputId);
  if(!inputElement) return; // Safeguard
  var value = parseInt(inputElement.value, 10);
  value = isNaN(value) ? 0 : value;
  if (inputId === 'numFriends' && value > 1) {
      value--;
      
      var wrapper = document.querySelector('.students_wrapper');
      if(wrapper) { // Safeguard
          var lastStudent = wrapper.querySelector('.student:last-child');
          if (lastStudent) {
              wrapper.removeChild(lastStudent);
          }
      }
  }
  inputElement.value = value;
  calculate();
  updateButtonURL();
}

var url;

function updateButtonURL() {
  var numFriendsElement = document.getElementById('numFriends');
  if(!numFriendsElement) return; // Safeguard
  var numFriends = parseInt(numFriendsElement.value);
  switch(numFriends) {
        case 1: 
            url = 'https://megatable.teachable.com/purchase?product_id=5097261';
            break;
        case 2: 
            url = 'https://megatable.teachable.com/purchase?product_id=5097268';
            break;
        case 3: 
            url = 'https://megatable.teachable.com/purchase?product_id=5097272';
            break;
        case 4: 
            url = 'https://megatable.teachable.com/purchase?product_id=5097277';
            break;
        case 5: 
            url = 'https://megatable.teachable.com/purchase?product_id=5097280';
            break;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
  var ctaButtonGroup = document.querySelector('.cta-button.group');
  if(ctaButtonGroup) { // Safeguard
      ctaButtonGroup.addEventListener('click', function() {
          window.location.href = url;
      });
  }
});

function calculate() {
  var numFriendsElement = document.getElementById('numFriends');
  if(!numFriendsElement) return; // Safeguard

  var baselineCost = 153;
  var numFriends = parseInt(numFriendsElement.value);

  // Calculate discount + change text
  var discount = 0;
  if (numFriends === 1) {
      discount = 0;

      // Change every id group_true to display:none
      var groupElements = document.querySelectorAll('[id="group_true"]');
      groupElements.forEach(function(element) {
          element.style.display = 'none';
      });

  } else {
      discount = (0 * numFriends) * numFriends;  // Proportional increase to reach 10 when there are 5 students

      // Remove the display style from every id group_true
      var groupElements = document.querySelectorAll('[id="group_true"]');
      groupElements.forEach(function(element) {
          element.style.removeProperty('display');
      });
  }

  var totalCost = (baselineCost + (numFriends - 1) * 8) - discount;
  var costPerPerson = Math.ceil(totalCost / numFriends);
  var costPerExtraSessionPerPerson = Math.ceil(24.50 / numFriends); 

  var resultElement = document.getElementById('result');
  var resultExtraElement = document.getElementById('resultExtra');
  var resultTotalElement = document.getElementById('resultTotal');

  if(resultElement && resultExtraElement && resultTotalElement) { // Safeguard
      resultElement.innerText = '€' + costPerPerson;
      resultExtraElement.innerText = '€' + costPerExtraSessionPerPerson;
      resultTotalElement.innerText = '€' + totalCost;
  }
  updateButtonURL();
}
















//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//
//SCRIPT-SPLIT//




const csvData = `
University,Degree,Course
University of Amsterdam,BSc Communication Science,Methods of Communication Research and Statistics
University of Amsterdam,BSc Communication Science,Statistical Modelling for Communication Research
Vrije Universiteit,BSc Communication Science,Descriptive and Inferential Statistics
Vrije Universiteit,BSc Communication Science,Quantitative Research Methodology
Vrije Universiteit,BSc Communication Science,Multivariate Analysis
Erasmus University Rotterdam,BSc International Communication & Media,Quantitative Methods in Media and Communication
Erasmus University Rotterdam,BSc Psychology,Statistics I
Erasmus University Rotterdam,BSc Psychology,Statistics II
University of Amsterdam,BSc Psychology,Research Methods & Statistics
University of Amsterdam,BSc Psychology,Scientific and Statistical Reasoning
University of Amsterdam,BSc Psychology,Methods & Statistics
University of Amsterdam,BSc Sociology,Introduction to Statistics
University of Amsterdam,BSc Sociology,Advanced Statistics
University of Amsterdam,BSc Political Science,Introduction to Political Science Research
University of Amsterdam,BSc Political Science,Research methods
University of Amsterdam,BSc PPLE,Introduction to Statistical Analysis
University of Amsterdam,BSc Sign Language Linguistics (Linguistics),Research Methods and Statistics
University of Amsterdam,BSc Linguistics,Research Methods & Statistics
University of Amsterdam,BSc Liberal Arts & Sciences (AUC),Advanced Research Methods and Statistics
University of Amsterdam,BSc Liberal Arts & Sciences (AUC),BRMS1
University of Amsterdam,BSc Liberal Arts & Sciences (AUC),BRMS2
University of Amsterdam,BSc Liberal Arts & Sciences (AUC),Statistics for Sciences
University of Amsterdam,BSc Human Geography and Planning,Research Methods 1
University of Amsterdam,BSc Economics and Business Economics,Statistics 1 for Economics
University of Amsterdam,BSc Economics and Business Economics,Statistics 2 for Economics
University of Amsterdam,BSc Business Administration,Quantitative Data Analysis 1
University of Amsterdam,BSc Business Administration,Quantitative Data Analysis 2
University of Amsterdam,BSc European Studies,A Friendly Introduction to Statistics in Political Economy
University of Amsterdam,BSc European Economics,A Friendly Introduction to Statistics in Political Economy
`




const dropdownData = {};

const rows = csvData.trim().split('\n');
rows.shift(); // Removing the header

rows.forEach(row => {
    const [university, degree, course] = row.split(',').map(item => item.trim());
    
    if (!dropdownData[university]) {
        dropdownData[university] = {};
    }

    if (!dropdownData[university][degree]) {
        dropdownData[university][degree] = [];
    }

    dropdownData[university][degree].push(course);
});







function populateDropdowns() {
    const uniDropdown = document.getElementById('uninameDropdown');
    Object.keys(dropdownData).forEach(uniname => {
        const option = new Option(uniname, uniname);
        uniDropdown.add(option);
    });
    uniDropdown.add(new Option("Other", "Other"));
}

function updatePrograms() {
    const selectedUni = document.getElementById('uninameDropdown').value;

    // Handle "Other" selection
    if (selectedUni === "Other") {
        handleOtherSelection();
        return;
    }

    // Reset visibility if a valid university is selected
    document.getElementById('displayUniname').style.display = 'block';
    document.getElementById('displayProgramname').style.display = 'block';

    localStorage.setItem('uniname', selectedUni);

    const programDropdown = document.getElementById('programnameDropdown');
    programDropdown.innerHTML = "";
    const defaultOption = new Option("Degree", "", true, true);
    defaultOption.disabled = true;
    programDropdown.add(defaultOption);
    programDropdown.disabled = false;

    Object.keys(dropdownData[selectedUni]).forEach(program => {
        const option = new Option(program, program);
        programDropdown.add(option);
    });
    programDropdown.add(new Option("Other", "Other"));

    localStorage.removeItem('programname');
    localStorage.removeItem('coursename');
}

function updateCourses() {
    const selectedUni = document.getElementById('uninameDropdown').value;
    const selectedProgram = document.getElementById('programnameDropdown').value;

    // Handle "Other" selection
    if (selectedProgram === "Other") {
        handleOtherSelection();
        return;
    }

    localStorage.setItem('programname', selectedProgram);

    const courseDropdown = document.getElementById('coursenameDropdown');
    courseDropdown.innerHTML = "";
    const defaultOption = new Option("Course", "", true, true);
    defaultOption.disabled = true;
    courseDropdown.add(defaultOption);
    courseDropdown.disabled = false;

    dropdownData[selectedUni][selectedProgram].forEach(course => {
        const option = new Option(course, course);
        courseDropdown.add(option);
    });
    courseDropdown.add(new Option("Other", "Other"));
}

function saveCourse() {
    const selectedCourse = document.getElementById('coursenameDropdown').value;

    // Handle "Other" selection
    if (selectedCourse === "Other") {
        handleOtherSelection();
        return;
    }

    localStorage.setItem('coursename', selectedCourse);

    if (localStorage.getItem('uniname') && localStorage.getItem('programname') && localStorage.getItem('coursename')) {
        displayInfo();
    }

    // Hide the sign-up line if course is not "Other"
    document.getElementById('sign-up-line').style.display = 'none';
}


function handleOtherSelection() {
    localStorage.setItem('uniname', 'Other');
    localStorage.setItem('programname', 'Other');
    localStorage.setItem('coursename', 'Other');

    document.getElementById('displayUniname').style.display = 'none';
    document.getElementById('displayProgramname').style.display = 'none';
    document.getElementById('displayCoursename').textContent = 'Self-Learners';

    displayInfo();
    
    // 1. Show the sign-up line when "Other" is selected
    document.getElementById('sign-up-line').style.display = 'block';
}

function displayInfo() {
    document.getElementById('dropdowns-container').style.display = 'none';
    document.getElementById('info-container').style.display = 'block';
    document.getElementById('unibox-bg').style.display = 'block';

    document.getElementById('displayUniname').textContent = localStorage.getItem('uniname');
    document.getElementById('displayProgramname').textContent = localStorage.getItem('programname');
    
    // Check for "Other" before setting textContent
    const courseName = localStorage.getItem('coursename');
    document.getElementById('displayCoursename').textContent = courseName === 'Other' ? 'Self-Learners' : courseName;
}


function returnToFirstScreen() {
    localStorage.clear();

    document.getElementById('uninameDropdown').selectedIndex = 0;
    document.getElementById('unibox-bg').style.display = 'none';
    document.getElementById('sign-up-line').style.display = 'block';


    const programDropdown = document.getElementById('programnameDropdown');
    const courseDropdown = document.getElementById('coursenameDropdown');

    programDropdown.innerHTML = "";
    courseDropdown.innerHTML = "";

    const defaultProgramOption = new Option("Degree", "", true, true);
    defaultProgramOption.disabled = true;
    programDropdown.add(defaultProgramOption);
    programDropdown.disabled = true;

    const defaultCourseOption = new Option("Course", "", true, true);
    defaultCourseOption.disabled = true;
    courseDropdown.add(defaultCourseOption);
    courseDropdown.disabled = true;

    document.getElementById('dropdowns-container').style.display = 'flex';
    document.getElementById('info-container').style.display = 'none';
}

document.getElementById('uninameDropdown').addEventListener('change', updatePrograms);
document.getElementById('programnameDropdown').addEventListener('change', updateCourses);
document.getElementById('coursenameDropdown').addEventListener('change', saveCourse);















window.onload = function() {
    populateDropdowns();

    if (localStorage.getItem('uniname') && localStorage.getItem('programname') && localStorage.getItem('coursename')) {
        displayInfo();
    } else {
        document.getElementById('dropdowns-container').style.display = 'flex';
    }

    calculate();
};



// Script to hide the floating arrow on scroll
window.addEventListener('scroll', () => {
    document.querySelector('.floating-arrow').style.display = 'none';
  });

// Click to go down

document.addEventListener('DOMContentLoaded', () => {
    const floatingArrowElement = document.querySelector('.floating-arrow');
    const courseHeroElement = document.querySelector('.divider');
  
    if (floatingArrowElement && courseHeroElement) {
      floatingArrowElement.addEventListener('click', () => {
        courseHeroElement.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });






  //affiliate link rebatedor

  
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const affcode = urlParams.get('affcode');
  
    if (affcode) {
      const affcodeParam = `?affcode=${affcode}`;
  
      // Adding to href attributes
      document.querySelectorAll('a[href]').forEach(anchor => {
        let url;
        try {
          url = new URL(anchor.href);
          url.searchParams.set('affcode', affcode);
          anchor.href = url.toString();
        } catch (e) {
          if (anchor.href.includes('?')) {
            anchor.href = anchor.href.replace('?', affcodeParam + '&');
          } else {
            anchor.href += affcodeParam;
          }
        }
      });
  
      // Adding to onclick attributes
      document.querySelectorAll('*[onclick]').forEach(element => {
        const originalOnClick = element.getAttribute('onclick');
        const modifiedOnClick = originalOnClick.replace(/'([^']+)'/g, (match, p1) => {
          if (p1.includes('http') || p1.includes('.html') || p1.includes('.com') || p1.includes('.org')) {
            if (p1.includes('?')) {
              return `'${p1}&affcode=${affcode}'`;
            } else {
              return `'${p1}?affcode=${affcode}'`;
            }
          } else {
            return match;
          }
        });
        element.setAttribute('onclick', modifiedOnClick);
      });
    }
  });
  
  
  
  
