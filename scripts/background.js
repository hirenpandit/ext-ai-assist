chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "SCAN_PAGE") {
		//API call to initiate RAG session
		fetch("http://localhost:8080/init", {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ url: request.url })

		}).then(res => res.json())
			.then(data => sendResponse({ success: true, data }))
			.catch(err => sendResponse({ success: false, error: err.message }))

	}
	if (request.type === 'GET_ANSWER') {
		fetch("http://localhost:8080/query", {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ id: request.id, question: request.question })
		}).then(res => res.json())
			.then(data => sendResponse({ success: true, data }))
			.catch(err => sendResponse({ success: false, error: err.message }))

	}
	return true
});

