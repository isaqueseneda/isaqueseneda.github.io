// Allowed badges (whitelist)
const ALLOWED_BADGES = new Set([
  "🏆",
  "📐 STRAT",
  "✏️ CREAT",
  "📟 #####",
  "✨ NEW",
  "MORE",
]);

// Function to get current page URL without domain
function getCurrentPage() {
  const path = window.location.pathname;
  // Extract just the filename from the full path
  const filename = path.split("/").pop();
  console.log("Current page:", filename); // For debugging
  return filename;
}

// Data object for projects with CSS classes
const projects = [
  // {
  //   href: "booking.html",
  //   cssClass: "booking",
  //   title: "BOOKING.COM",
  //   subtitle: "NOT THE BEST HOTELS",
  //   tags: ["📐 STRAT", "PRODUCT"],
  // },
  {
    href: "phone.html",
    cssClass: "bphone",
    title: "HEINEKEN",
    // subtitle: "THE FRESHEST UPGRADE COMES STRAIGHT FROM 2005",
    subtitle: "WE MADE SMARTPHONES OBSOLETE WITH 2005 TECH",
    tags: ["🏆", "📐 STRAT", "✏️ CREAT"],
  },
  {
    href: "ice.html",
    cssClass: "ice",
    title: "ROGERS",
    subtitle: "WE HACKED THE NHL FINAL AND SMUGGLED ICE FROM HOME",
    tags: ["✨ NEW", "📐 STRAT", "✏️ CREAT"],
  },
  {
    href: "megatable.html",
    cssClass: "megatable",
    title: "MEGA TABLE",
    // subtitle: "A MODULAR EDUCATION PLATFORM FOR PROCRASTINATORS",
    subtitle: "WE BUILT A SCHOOL FOR PEOPLE WHO HATE STATS",
    tags: ["📐 STRAT", "📟 #####"],
  },
  {
    href: "mysig.html",
    cssClass: "mysig",
    title: "MY-SIG (MENSA INTERNATIONAL)",
    // subtitle: "A SMART DASHBOARD FOR A CAMP WITH LESS CLICKS",
    subtitle: "WE MADE AN APP THAT WANTS YOU GONE CAMPING",
    tags: ["📐 STRAT", "📟 #####"],
  },

  {
    href: "barxp.html",
    cssClass: "barxp",
    title: "HEINEKEN",
    // subtitle: "MAKE BARTENDING A SEXY CAREER CHOICE",
    subtitle: "WE REBRANDED BARTENDING AS A SEXY CAREER CHOICE",
    tags: ["🏆", "📐 STRAT", "✏️ CREAT"],
  },

  // below is temporary

  {
    href: "fridge.html",
    cssClass: "fridge",
    title: "HEINEKEN",
    // subtitle: "COOL DOWN YOUR CPU WITH SOCIALIZATION",
    subtitle: "WE OPTIMIZED PCs FOR SOCIALIZATION",
    tags: ["🏆", "📐 STRAT"],
  },
  // below is temporary
  {
    href: "feed-peek.html",
    cssClass: "blei",
    title: "UNITED NATIONS",
    // subtitle: "DONATE YOUR ALGORITHM AGAINST STEREOTYPES",
    subtitle: "WE MADE ACTIVISM FREE AND REPLACED STEREOTYPES",
    tags: ["🏆", "📐 STRAT", "✏️ CREAT", "📟 #####"],
  },
  // {
  //   href: "mysig.html",
  //   cssClass: "mysig",
  //   title: "MENSA INTERNATIONAL",
  //   subtitle: "A SMART DASHBOARD FOR A CAMP WITH LESS CLICKS",
  //   tags: ["📟 #####"],
  // },
  {
    href: "open-wine-like-magic.html",
    cssClass: "wp",
    title: "WINEPOPPER",
    // subtitle: "WE MADE WINE OPENING FUN AND PISSED OFF TRADITION",
    subtitle: "WE MADE OPENING WINE LESS SACRED",
    tags: ["📐 STRAT", "📟 #####"],
  },
  // {
  //   href: "megatable.html",
  //   cssClass: "megatable",
  //   title: "MEGA TABLE",
  //   subtitle: "A MODULAR STATS PLATFORM FOR PROCRASTINATORS",
  //   tags: ["📐 STRAT", "📟 #####"],
  // },
  {
    href: "evolutionary.html",
    cssClass: "evolutionary",
    title: "ERASMUS UNIVERSITY ROTTERDAM",
    // subtitle: "WE MADE WINE OPENING FUN AND PISSED OFF TRADITION",
    subtitle: "WE BURIED DON DRAPER AND REPLACED HIM WITH DATA ",
    tags: ["📐 STRAT"],
  },
  {
    href: "journeys.html#2",
    cssClass: "comboakounb",
    title: "AUDIOVISUAL JOURNEYS",
    // subtitle: "FILMMAKING + MUSIC ENDEAVORS",
    subtitle: "WE TOLD GRAND STORIES WITH BROKE GEAR",
    tags: ["MORE"],
  },
  // {
  //   href: "the-tinnitus-earbuds.html",
  //   cssClass: "bose",
  //   title: "BOSE",
  //   subtitle: "FINDING A NEW DEMAND SEGMENT FOR SILENCE",
  //   tags: ["📐 STRAT", "✏️ CREAT"],
  // },
  // {
  //   href: "fairphone.html",
  //   cssClass: "tide",
  //   title: "FAIRPHONE",
  //   subtitle: "A LAUNCH TO HALT SALES",
  //   tags: ["🥇", "✏️ CREAT"],
  // },
  // {
  //   href: "ford.html",
  //   cssClass: "data",
  //   title: "FORD",
  //   subtitle: "YIELDING EV CONVERSION IN THE FINAL WEEK",
  //   tags: ["📐 STRAT"],
  // },
  // {
  //   href: "megafocus.html",
  //   cssClass: "kys",
  //   title: "MEGA TABLE",
  //   subtitle: "CREATING BRAND MEANIGFULNESS WITH A CHROME EXTENSION",
  //   tags: ["📐 STRAT"],
  // },
  // {
  //   href: "high-symphonies.html",
  //   cssClass: "highs",
  //   title: "CONCERTGEBOUW",
  //   subtitle: "BRINGING THE YOUTH TO CLASSICAL MUSIC",
  //   tags: ["🥉", "✏️ CREAT"],
  // },
  // {
  //   href: "forms.html",
  //   cssClass: "forms",
  //   title: "FORMS",
  //   subtitle: "A BRAND IDENTITY BASED ON ANTENNAE AND SPARKS",
  //   tags: ["✏️ CREAT"],
  // },
  // {
  //   href: "web3.html",
  //   cssClass: "web3",
  //   title: "TEZOS",
  //   subtitle: "WEB3 BY WEB3",
  //   tags: ["✏️ CREAT"],
  // },
  // {
  //   href: "mentelity.html",
  //   cssClass: "mentelity",
  //   title: "MENTELITY FOUNDATION",
  //   subtitle: "THE DRAMATIC LIVES OF PROSTHETIC LEGS",
  //   tags: ["🥈"],
  // },
  // {
  //   href: "gosh.html",
  //   cssClass: "gosh",
  //   title: "GREAT ORMOND STREET HOSPITAL",
  //   subtitle: "GOSH SPORTS, INC.",
  //   tags: [],
  // },
  // {
  //   href: "buma.html",
  //   cssClass: "buma",
  //   title: "BUMA",
  //   subtitle: "BLANK FILES: YOUR NEWEST POINT OF SALE",
  //   tags: ["🏅"],
  // },
  // {
  //   href: "blei.html",
  //   cssClass: "bleimag",
  //   title: "BLEI MAGAZINE",
  //   subtitle: "DOWNTOWN SÃO PAULO",
  //   tags: ["📸"],
  // },
];

// Function to generate HTML for a single project
function generateProjectHTML(project) {
  const filteredTags = project.tags.filter((tag) => ALLOWED_BADGES.has(tag));
  const currentPage = getCurrentPage();
  const isActive = project.href === currentPage;
  const activeStyle = isActive
    ? ' style="filter: grayscale(1); background-color: #d2d2d2; color: gray;"'
    : "";

  return `
    <a href="${project.href}" class="thumb ${project.cssClass}"${activeStyle}>
      <div class="title">
        <div class="thumbtitletext">
          <strong>${project.title}<br />‍</strong>${project.subtitle}
        </div>
      </div>
      ${
        filteredTags.length
          ? `
          <div class="thumbtagcontainer">
            ${filteredTags
              .map((tag) => `<div class="thumbtag">${tag}</div>`)
              .join("")}
          </div>`
          : ""
      }
    </a>
  `;
}

// Function to render all projects
function renderTheSection() {
  const thesectionContent = projects.map(generateProjectHTML).join("");
  return `
    <div class="thesection wf-section">
      ${thesectionContent}
    </div>
    <div class="footer wf-section">
      <div class="contactbye respiro">
        <div class="acabou">##</div>
        <img
          src="images/profile.gif"
          loading="lazy"
          alt=""
          class="image-4"
        />
      </div>
      <div class="contactbye about">
        <div class="me">
          <span>2025 GOLDEN SAW HOLDER</span>
        </div>
        <div class="contactblock">
          <div class="linkmesmobox">
            <span class="contact">HELLO@ISAQUE.ME</span>

            <a href="about.html" class="contact">ABOUT</a>

          </div>
        </div>
      </div>
      <div class="contactbye about"></div>
    </div>
    <div id="hover-box"></div>
  `;
}

// Auto-render when imported
document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.querySelector(".thumbnails-placeholder");
  if (placeholder) placeholder.innerHTML = renderTheSection();
});
