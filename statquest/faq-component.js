    class FAQComponent extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
    
        connectedCallback() {
            this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
            this.populateFAQs();
            this.addEventListeners();
        }
    
        getStyles() {
            return `
                <style>
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                    }

                    .container.faq {
                        flex-direction: column;
                        margin-bottom: 100px;
                    }
        
                    .faq-item {
                        width: 100%;
                        padding: 15px 25px;
                        border-radius: 6px;
                        background-color: #eeeeee;
                        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.01), 0 6px 20px 0 rgba(0, 0, 0, 0.05);
                        margin-bottom: 2px;
                        color: black;
                    }
        
                    .faq-item:hover {
                        background-color: #E6E6E6;
                    }
        
                    .faq h3 {
                        font-weight: 400;
                        font-size: 22px;
                        margin-top: 80px;
                    }
        
                    .faq h4 {
                        font-weight: 400;
                        font-size: 16px;
                        margin: 0px;
                        display: flex;
                        justify-content: space-between;
                    }
        
                    .faq p {
                        font-weight: 200;
                        font-size: 16px;
                        margin: 0px;
                        margin-top: 10px;
                        display: none;
                        transition: transform 330ms ease-in-out;
                    }
        
                    .faq-symbol {
                        float: right;
                    }
        
                    @media screen and (max-width: 680px) {
                        .container{
                            max-width: 70vw;
                        }

                    }
                </style>
            `;
        }
        
        getTemplate() {
            return `
                <section class="faq">
                    <div class="container faq">
                        <h3>FREQUENTLY ASKED QUESTIONS</h3>
                        <!-- FAQ Content will be added dynamically -->
                    </div>
                </section>
                <template id="faq-item-template">
                    <div class="faq-item">
                        <h4></h4>
                        <p></p>
                    </div>
                </template>
            `;
        }
    
        populateFAQs() {
            const faqData = [
                { question: "Who is this course for?", answer: "MEGA TABLE is a stats course for visual learners. It consolidates key concepts, formulas, and techniques into a an efficient video class, helping students quickly review and apply what they've learned." },
                { question: "What does it mean to \"apply the 10 main tests in inferential stats\"?", answer: "That means learning how to understand, run, and interpret the statistical tests you learn in class. We learn about the ten fundamental tests in inferential statistics. These tests include t-tests, chi-square tests, ANOVA, regression, and others, all of which are covered extensively in our course." },
                { question: "How does this course differ from other stats courses available online?", answer: "Our course integrates a unique blend of theoretical knowledge with practical application, facilitated by experienced educators in the field of statistics. Additionally, we offer interactive sessions, real-world case studies, and comprehensive support to ensure our students truly grasp the concepts." },
                { question: "What format are the classes in?", answer: "Classes are a mix of recorded lectures, live interactive sessions, and hands-on exercises — depending on your plan of choice. This blended approach ensures both flexibility and real-time feedback for students." },
                { question: "What are the prerequisites for this course, aside from high school math?", answer: "Literally basic high school math and knowing how to use a computer." },
                { question: "What is the 10 x 10 Summary and how is it used in this course?", answer: "THE 10 x 10 PDF is a comprehensive reference tool we use in the course. It's where it all started, actually. It consolidates key concepts, formulas, and techniques into one easily accessible location so you can quickly review and apply what you've learned." },
                { question: "Can I access the course materials after the 30-day period?", answer: "Yes, although not all modules. Students will still have lifetime access to the crash course and 10 x 10 PDF. If needed, you can always sign up for another period. We do that to make sure you always have the newst version of the classes. 🙏" },
                { question: "What happens if I fail my exam?", answer: "If you fail your exam you get free extension of your plan for another 30-days, as long as it is claimed within the same academic year. For example, if you fail the exam in October, you can reactivate your membership for 30 days starting in June, in preparation for the July resit." }
                //{ question: "FLEX PLUS: Who gets access? What do each student get access to?", answer: "Each student has their own log in to watch classes and join Live Sprints with." },
                //{ question: "FLEX PLUS: What kind of support is available to me as I go through the course?", answer: "We offer extensive support, including dedicated Q&A sessions, discussion forums, and email support with instructors. Our aim is to ensure every student feels guided throughout their learning journey." },
                //{ question: "FLEX PLUS: What happens if one of my friends drops out?", answer: "It's absolutely fine, and you'll get a refund for the person that does not join. It's up to you to split the costs with your friends." },
                //{ question: "FLEX PLUS: Can I add new students after purchasing?", answer: "We recommend 5 students, but effectively the session is yours. You can always bring more people. I can always grant access to them." }
            ];
            
            const container = this.shadowRoot.querySelector(".container.faq");
            const template = this.shadowRoot.getElementById("faq-item-template");
    
            faqData.forEach(faq => {
                const faqItem = template.content.cloneNode(true);
                faqItem.querySelector("h4").innerHTML = `${faq.question} <span class="faq-symbol">↓</span>`;
                faqItem.querySelector("p").textContent = faq.answer;
                container.appendChild(faqItem.cloneNode(true));
            });
        }
    
        addEventListeners() {
            const faqItems = this.shadowRoot.querySelectorAll(".faq-item");
            faqItems.forEach(item => {
                item.addEventListener("click", function() {
                    const pTag = item.querySelector("p");
                    
                    // Toggle answer visibility
                    if (pTag.style.display === "none" || pTag.style.display === "") {
                        pTag.style.display = "block";
                        item.style.backgroundColor = "white"; // Change background color
                    } else {
                        pTag.style.display = "none";
                        item.style.backgroundColor = "#eeeeee"; // Reset to original background color
                    }
        
                    // Toggle arrow symbol
                    const faqSymbol = item.querySelector(".faq-symbol");
                    if (faqSymbol.textContent === "↓") {
                        faqSymbol.textContent = "↑";
                    } else {
                        faqSymbol.textContent = "↓";
                    }
                });
            });
        }
        
    }
    
    customElements.define('faq-component', FAQComponent);
    
