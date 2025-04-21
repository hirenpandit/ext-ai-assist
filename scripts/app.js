import { loadData, saveData } from "./indexDb.js";

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


async function scanPage(_url) {
	const questionBox = document.getElementById("question")
	const scanButton = document.getElementById("scan-btn")

	chrome.runtime.sendMessage(
		{ type: "SCAN_PAGE", url: _url },
		(response) => {
			if (response.success) {
				hideError()
				console.log("successfully scanned  webpage, id", response.data.id)
				//store id to storage
				const storedObj = chrome.storage.local.get()
				chrome.storage.local.set({ ...storedObj, "rag_session_id": response.data.id })

				//enable/disable HTML elements
				questionBox.disabled = false
				submitButton.disabled = false
				scanButton.disabled = true

				//load data from indexDB
				loadDataForId(response.data.id)
			} else {
				showError("Something went wrong!")
			}
		}
	)
}


submitButton.addEventListener("click", async () => {
	const answerList = document.getElementById("answer-list");

	let answerText = "Loading..."
	answerbox.style.display = 'flex'


	//setting intial state after button click
	const question = document.getElementById("question")
	question.disabled = true
	submitButton.disabled = true

	const questionItem = document.createElement('div')
	questionItem.classList.add("question-item")
	questionItem.textContent = question.value

	const answerItem = document.createElement('div')
	answerItem.textContent = answerText
	answerItem.classList.add("answer-item")

	//append questionItem and answerItem
	answerList.appendChild(questionItem)
	answerList.appendChild(answerItem)

	//getting answer from question
	const data = await chrome.storage.local.get("rag_session_id")
	const questionText = question.value
	chrome.runtime.sendMessage(
		{ type: "GET_ANSWER", id: data.rag_session_id, question: questionText },
		(response) => {
			if (response.success) {
				hideError()
				answerText = response.data.answer
				answerItem.textContent = answerText
				question.disabled = false
				submitButton.disabled = false

				//adding data to indexDB
				saveData({ "id": data.rag_session_id, "question": questionText, "answer": answerText })
			} else {
				showError("Something went wrong!")
				answerText = "Error!"
				answerItem.textContent = answerText
				question.disabled = false
				submitButton.disabled = false
			}
		}
	)
	question.value = ""
})

function showError(message) {
	const errorBox = document.getElementById("error-box");
	errorBox.textContent = message;
	errorBox.classList.add("visible");
}

function hideError() {
	const errorBox = document.getElementById("error-box");
	errorBox.classList.remove("visible");
}

function loadDataForId(id) {
	console.log("loading data from indexedDB for id", id)
	const answerList = document.getElementById("answer-list");
	let hasHistory = false
	loadData(id)
		.then(item => {
			console.log(">>>item", item)
			item[0].data.forEach(i => {
				const questionItem = document.createElement('div')
				questionItem.classList.add("question-item")
				questionItem.textContent = i.question

				const answerItem = document.createElement('div')
				answerItem.textContent = i.answer
				answerItem.classList.add("answer-item")

				//append questionItem and answerItem
				answerList.appendChild(questionItem)
				answerList.appendChild(answerItem)
				hasHistory = true
				if (hasHistory) {
					answerbox.style.display = "flex"
				}
			})

		})
		.catch(err => console.log("error loading data", err))
}

