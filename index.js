// A really hacky way of listing books in helmet.overdrive.com that I have on my to-read list

const querystring = require('querystring')
const cheerio = require('cheerio')
const request = require('sync-request')
const sleep = require('sleep')

function getUrlsFromPage(jQuery) {
    let urls = jQuery('.bookalike').map((i,el) => {
        var author = jQuery(el).find('.author a').text().replace('*', '').trim()
        var title = jQuery(el).find('.title a').contents().filter(function() {
            return this.nodeType == 3
        }).text().trim()
        return 'https://helmet.overdrive.com/search?query=' + querystring.escape(author + ': ' + title)
    })
    return Array.from(urls)
}

function getAllUrls() {
    let urls = []
    let nextPath = '/review/list/20719991-hannu?shelf=to-read&per_page=100'
    let $
    while (nextPath) {
        let res = request('GET', 'https://www.goodreads.com' + nextPath)
        $ = cheerio.load(res.getBody('utf8'))
        let pageUrls = getUrlsFromPage($)
        urls = urls.concat(pageUrls)
        console.info(`found ${pageUrls.length} urls (total ${urls.length})`)
        nextPath = $('a.next_page').prop('href')
    }

    return urls
}

const urls = getAllUrls()
console.log(`\nALL ${urls.length} URLS:`)
console.log(urls.join('\n'))

console.log('\n\nBOOKS:\n')
urls.forEach(url => {
    sleep.usleep(500 * 1000) // rate limit
    let res = request('GET', url)
    let $ = cheerio.load(res.getBody('utf8'))
    if ($('#noresults').length === 0) {
        console.log(url)
    }
})
