import puppeteer from "puppeteer";
const APIKEY = process.env.APIKEY || '2captcha_apikey'; // set you 2captcha apikey
import { Solver } from "2captcha-ts";
const solver = new Solver(APIKEY);
let inn = 'INN_for_check'; // set INN for check

const sleep = ms => new Promise(res => setTimeout(res, ms));

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1080, height: 1024 });

  // Open terget page
  await page.goto("https://kgd.gov.kz/ru/app/culs-taxarrear-search-web");

  // Type valid INN in input
  await page.type("#iinBin", inn);

  //Wait the selector with captcha
  await page.waitForSelector(".g-recaptcha");

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page.evaluate(() => {
    return document.querySelector(".g-recaptcha").getAttribute("data-sitekey");
  });

  // Get actual page url
  const pageurl = await page.url();

  // Submitting the captcha for solution to the service
  const res = await solver.recaptcha({
    pageurl: pageurl,
    googlekey: sitekey,
  });

  // Show captcha anwser
  console.log(res);

  // Getting a captcha response including a captcha answer
  const captchaToken = res.data;

  // Use captcha Token
  const setAnswer = await page.evaluate((captchaToken) => {
    // It is not necessary to make this block visible, it is done here for clarity.
    document.querySelector("#g-recaptcha-response").style.display = "block";
    document.querySelector("#g-recaptcha-response").value = captchaToken;
  }, captchaToken);


  // Press the button to check the result.
  await page.click('#btnGetResult');

  // Sleep
  await sleep(2000);

  await page.waitForSelector('#result')
  const inputPdfElement = await page.$('#jsonForPdf')
  
  // Get user Data
  const userData = await page.evaluate((element) => {
    return element.value
  }, inputPdfElement)
  
  // Show user Data
  console.log('User Data:')
  console.log(userData)

  // Close the browser
  // browser.close();
})();
