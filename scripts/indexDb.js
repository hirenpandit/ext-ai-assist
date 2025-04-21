
/**
 * add question and answer for the rag_session_id to indexDB
**/
export async function saveData(data) {

	const transaction = await getTransaction()

	const objectStore = transaction.objectStore('rag-queries')
	const request = objectStore.get(data.id)
	request.onsuccess = (_event) => {
		const item = request.result
		if (item) {
			item.data = [...item.data, { question: data.question, answer: data.answer }]
			objectStore.put(item)
		} else {
			objectStore.add({
				rag_session_id: data.id,
				data: [{ question: data.question, answer: data.answer }]
			})
		}
	}
}


/**
 * clear data from IndexDb for the rag_session_id
 **/
export function clearData(_id) {

}

/**
 * get all data from IndexDB for the rag_session_id
 **/
export async function loadData(id) {
	const transaction = await getTransaction()
	const objectStore = transaction.objectStore('rag-queries')

	return new Promise((resolve, reject) => {

		const request = objectStore.getAll()
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}


async function openDB() {
	return new Promise((resolve, reject) => {

		const request = indexedDB.open("ai_assist_db", 1)

		request.onerror = (error) => {
			console.log("error opening db", error)
			reject(error)
		}

		request.onsuccess = (success) => {
			resolve(success.target.result)
		}


		request.onupgradeneeded = (event) => {
			const db = event.target.result

			//create an objectstore for this database
			const objectStore = db.createObjectStore('rag-queries', { keyPath: 'rag_session_id' })

			//define what type of items the objectstore will contain
			objectStore.createIndex('data', 'data', { unique: false })
		}


	})
}


async function getTransaction() {
	const db = await openDB()
	const transaction = db.transaction('rag-queries', ['readwrite'])
	transaction.oncomplete = (_event) => {
		db.close()
	}

	transaction.onerror = (_event) => {
		console.error(`transaction not opened due to error: ${transaction.error}`)
	}

	return transaction
}
