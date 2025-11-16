function esc(v){return (v||"").replace(/;/g,"|").replace(/\n/g," ").trim()}

function scrapeUdemyQuestion() {
    let question = esc(document.querySelector("#question-prompt")?.innerText || "");
    let answers = [...document.querySelectorAll('.answer-result-pane--answer-body--cDGY6 #answer-text')].map(x=>esc(x.innerText));
    let correct = esc(document.querySelector('.answer-result-pane--answer-correct--PLOEU #answer-text')?.innerText || "");
    let explOverall = esc(
        document.querySelector("#overall-explanation")?.innerText ||
        document.querySelector("#question-explanation")?.innerText ||
        ""
    );
    let expls = [...document.querySelectorAll('.answer-result-pane--answer-feedback--bHmbH')].map(x=>esc(x.innerText.replace("Wyjaśnienie","")));
    while(expls.length<4) expls.push("");
    return {question, answers, explanations: expls, correct, overallExplanation: explOverall};
}

async function answerQuestionIfNeeded() {
    const firstAnswerToggle = document.querySelector('span.ud-fake-toggle-input.ud-fake-toggle-radio');
    if(firstAnswerToggle){
        firstAnswerToggle.click();
    }

    let nextBtn = null;
    for(let i=0;i<50;i++){ // max 50 prób po 200ms = 10s
        const checkBtn = document.querySelector('button[data-purpose="check-answer"]');
        if(checkBtn){
            checkBtn.click();
        }
        nextBtn = document.querySelector('button[data-purpose="go-to-next-question"]');
        if(nextBtn) break;
        await new Promise(r=>setTimeout(r,200));
    }

    return nextBtn;
}

async function scrapeAllQuestions() {
    while(true) {
        console.log("Scraping question...");
        let q = scrapeUdemyQuestion();

        chrome.storage.local.get({rows:[]}, data=>{
            let row = [
                q.question,
                q.answers[0], q.explanations[0],
                q.answers[1], q.explanations[1],
                q.answers[2], q.explanations[2],
                q.answers[3], q.explanations[3],
                q.correct,
                q.overallExplanation
            ].join(";");
            data.rows.push(row);
            chrome.storage.local.set({rows:data.rows});
        });

        let nextBtn = document.querySelector('button[data-purpose="go-to-next-question"]');

        if(!nextBtn){
            nextBtn = await answerQuestionIfNeeded();
        }

        if(!nextBtn){
            console.log("Next button did not appear after answering. Ending scrape.");
            return;
        }

        let isLast = nextBtn.innerText.includes("Zakończ test");

        console.log("Clicking Next / Finish...");
        nextBtn.click();
        await new Promise(res=>setTimeout(res,300));

        if(isLast){
            console.log("Last question reached. Ending scrape.");
            return;
        }
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
    if(msg.action==="scrapeAllAsync"){
        scrapeAllQuestions().then(()=>sendResponse({finished:true}));
        return true; // async
    }

    if(msg.action==="scrape"){
        let row = scrapeUdemyQuestion();
        let csvRow = [
            row.question,
            row.answers[0], row.explanations[0],
            row.answers[1], row.explanations[1],
            row.answers[2], row.explanations[2],
            row.answers[3], row.explanations[3],
            row.correct,
            row.overallExplanation
        ].join(";");
        sendResponse({row: csvRow});
    }
});
