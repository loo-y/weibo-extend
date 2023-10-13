const Match_URL = ['weibo.com']

const mainPage = './dist/main.html'
const optionsPage = './dist/options.html'


chrome.action.onClicked.addListener(async tab => {
    console.log(`chrome action onClicked`)
    if (!tab.url) return
    const url = new URL(tab.url)
    const tabId = tab.id
    const isInMatchUrl = Match_URL.some(function (matchurl) {
        return url.origin.includes(matchurl)
    })

    if (isInMatchUrl) {
        // inject script in page first
    }
})

// hook by background service-worker
chrome.scripting.registerContentScripts([{
    id: "weibo-extend-inject",
    matches: ["http://*/*", "https://*/*"],
    js: ["inject-script.js"],
    runAt: "document_start",
    world: "MAIN",
    allFrames: true
}])