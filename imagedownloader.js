
//install all these before you start
//npm install puppeteer
//npm install request
//npm install fs
//remember to change url and keyword
// run it with "node imagedownloader.js" command in VS code TERMINAL

const puppeteer = require('puppeteer')
var request = require('request')
const fs = require('fs')

// download images
var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        request(uri)
            .pipe(fs.createWriteStream(__dirname + `/${filename}`))
            .on('close', function() {
                console.log('Copy Images Done')
            })
    })
}

// waiting
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

// get all images
;(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
    })
    const page = await browser.newPage()

    //********* enter your url here //*********/   
    await page.goto('https://example.com', {
        waitUntil: 'domcontentloaded',
    }) 


    // Get the height of the rendered page
    const bodyHandle = await page.$('body')
    const { height } = await bodyHandle.boundingBox()
    await bodyHandle.dispose()

    //start https://github.com/puppeteer/puppeteer/issues/2569
    // Scroll one viewport at a time, pausing to let content load
    const viewportHeight = page.viewport().height
    let viewportIncr = 0
    while (viewportIncr + viewportHeight < height) {
        await page.evaluate(_viewportHeight => {
            window.scrollBy(0, _viewportHeight)
        }, viewportHeight)
        await wait(2000)
        viewportIncr = viewportIncr + viewportHeight;
    }

    // Scroll back to top
    await page.evaluate(_ => {
        window.scrollTo(0, 0);
    })

    // Some extra delay to let images load
    await wait(2000);

    //https://github.com/puppeteer/puppeteer/issues/2569 end

    let imageLink = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'))
        //********* Search keyword 'e.g. png' for all captured images  ******//
        return images.map(img => img.src).filter(img => img.includes('.png'))
                                      // other examples are as below
                                      // .filter(img => img.includes('https:'))
                                      // .filter(img => img.includes('jpeg'))
    })

    // save files with file type jpeg
    imageLink.forEach((img, index) =>
        download(img, index + '.jpeg', function() {
            console.log('finish')
        })
    )

    await browser.close()
})()
