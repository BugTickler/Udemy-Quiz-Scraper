document.addEventListener('DOMContentLoaded', ()=>{

    const countEl = document.getElementById("count");
    const statusEl = document.getElementById("status");

    function updateCount(){
        chrome.storage.local.get({rows:[]}, data => { 
            const unique = Array.from(new Set(data.rows.map(r=>r.split(";")[0])));
            countEl.textContent = unique.length; 
        });
    }
    updateCount();

    function exportToExcel(){
        chrome.storage.local.get({rows:[]}, data=>{
            const wb = XLSX.utils.book_new();
            const ws_data = [];
            ws_data.push(["Question","Answer A","Explanation A","Answer B","Explanation B","Answer C","Explanation C","Answer D","Explanation D","Correct Answer","Overall Explanation"]);

            const uniqueRows = Array.from(new Set(data.rows));
            uniqueRows.forEach(r=>{
                ws_data.push(r.split(";"));
            });

            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Test");
            XLSX.writeFile(wb, "Udemy_test.xlsx");
        });
    }

    function addSingleQuestion(){
        statusEl.textContent = "Adding...";
        document.getElementById("scrapeBtn").disabled = true;
        chrome.tabs.query({active:true,currentWindow:true}, tabs=>{
            if(tabs.length === 0) return;
            chrome.tabs.sendMessage(tabs[0].id,{action:"scrape"}, res=>{
                if(res && res.row){
                    chrome.storage.local.get({rows:[]}, data=>{
                        data.rows.push(res.row);
                        chrome.storage.local.set({rows:data.rows}, ()=>{
                            statusEl.textContent="Added ✅";
                            updateCount();
                            setTimeout(()=>{statusEl.textContent=""; document.getElementById("scrapeBtn").disabled=false},1000);
                        });
                    });
                } else {
                    statusEl.textContent="Error ❌";
                    setTimeout(()=>{statusEl.textContent=""; document.getElementById("scrapeBtn").disabled=false},1000);
                }
            });
        });
    }

    function scrapeAllQuestions(){
        statusEl.textContent = "Scraping all questions...";
        document.getElementById("scrapeAllBtn").disabled = true;

        chrome.tabs.query({active:true,currentWindow:true}, tabs=>{
            if(tabs.length === 0) return;
            chrome.tabs.sendMessage(tabs[0].id,{action:"scrapeAllAsync"}, res=>{
                if(res && res.finished){
                    statusEl.textContent = "All questions scraped ✅";
                    document.getElementById("scrapeAllBtn").disabled = false;
                    updateCount();
                } else {
                    statusEl.textContent = "Error ❌";
                    document.getElementById("scrapeAllBtn").disabled = false;
                }
            });
        });
    }

    function resetQuestions(){
        if(!confirm("Are you sure you want to reset all questions?")) return;
        chrome.storage.local.set({rows:[]}, ()=>{
            updateCount();
            statusEl.textContent="All questions reset ✅";
            setTimeout(()=>{statusEl.textContent="";},1500);
        });
    }

    document.getElementById("scrapeBtn").onclick = addSingleQuestion;
    document.getElementById("scrapeAllBtn").onclick = scrapeAllQuestions;
    document.getElementById("exportBtn").onclick = exportToExcel;
    document.getElementById("resetBtn").onclick = resetQuestions;

});
