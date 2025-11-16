The extension automatically runs through the test questions and saves the questions, answers, explanations, and the correct answer to a spreadsheet. 
It's best to use it after you've already answered the questions, as it can help avoid timeouts on slower connections. 
The extension works locally by reading only HTML. The extension should work on the English and Polish versions of Udemy.

<img width="273" height="212" alt="Zrzut ekranu 2025-11-16 024008" src="https://github.com/user-attachments/assets/e70b7f22-7132-42f8-b995-8e6e428ba465" />

Extension Installation:
- Go to your browser's extension management
- Click "Upload Unzipped/Unpacked"
- Specify the folder with the extension files

Usage:
- Open the test on Udemy in practice mode
- Click the extension icon
- Click "Scrape All Questions" to have the extension run the test and save all questions, answers, and explanations.
- Click "Export XSLS" to download the spreadsheet
- If you want to run another test, press the "Reset" button to clear previously saved questions.

- You can also add questions individually using the Add Question button and download all of them after completing the test manually.

Known Issues:
- Sometimes Udemy takes too long to load buttons, causing the extension to timeout. You can try again or adjust the timeout option in the code.
- Sometimes the extension saves the question before and after it answers the question. I'm working on a fix, until I have to manually remove duplicates from the sheet.
- Occasionally, Udemy may change the selectors on buttons, so you may need to check which ones are actually present and make changes in the code. I'm working on fixing this.
