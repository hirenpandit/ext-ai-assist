document.addEventListener('DOMContentLoaded', () => {
	const button = document.getElementById('scan-btn');
	button.addEventListener('click', async () => {
		// Get the active tab in the current window
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (tab && tab.url) {
			scanPage(tab.url)
		} else {
			alert("Couldn't get the current tab URL.");
		}

	});
});

const submitButton = document.getElementById("submit-btn")
const answerbox = document.getElementById("answer-box")

let rag_session_id = ""


async function scanPage(_url) {
	const questionBox = document.getElementById("question")
	const scanButton = document.getElementById("scan-btn")

	questionBox.disabled = false
	submitButton.disabled = false
	scanButton.disabled = true

	chrome.runtime.sendMessage(
		{ type: "SCAN_PAGE", url: _url },
		(response) => {
			console.log(">>response", response)
			if (response.success) {
				console.log("successfully scanned  webpage, id", response.data.id)
				rag_session_id = response.data.id
			} else {
				console.log("failed to scann webpage")
			}
		}
	)
}


submitButton.addEventListener("click", async () => {
	answerbox.style.display = 'block'
	const answer = document.createElement('div')
	answer.className = 'answer-iterm'


	const question = document.getElementById("question")

	let answerText = ""
	//getting answer from question
	chrome.runtime.sendMessage(
		{ type: "GET_ANSWER", id: rag_session_id, question: question.value },
		(response) => {
			if (response.success) {
				answerText = response.data.answer
				answer.textContent = answerText
				console.log("answer received >>", response.data.answer)
			} else {
				console.log("Failed to get answer")
			}
		}
	)
	document.getElementById("answer-list").appendChild(answer)
})

