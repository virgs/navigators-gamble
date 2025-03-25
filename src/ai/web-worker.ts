postMessage({ ready: true })

self.onmessage = (event: MessageEvent<any>) => {
    const request = event.data
    try {
        self.postMessage('response')
    } catch (exception) {
        console.log(`WW ${request} got exception`)
        console.error(exception)
        self.postMessage(exception)
    }
}
