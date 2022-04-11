const puppeteer = require("puppeteer");

async function handlePassCaptchaAndGetCookie() {
  let count = 0;
  try {
    let cookie = await runPassCaptchaAndGetCookie();
    console.log("cookie :", cookie);
  } catch (error) {
    console.log("error: ", error);
    count++;
    if (count < 2) {
      handlePassCaptchaAndGetCookie();
    }
  }
}
handlePassCaptchaAndGetCookie();

async function runPassCaptchaAndGetCookie() {
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   defaultViewport: { width: 1366, height: 768 },
  //   channel: "chrome",
  // });
  const browser = await puppeteer.launch({
    timeout: 60000
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.goto(
    "https://feedback.aliexpress.com/display/productEvaluation.htm?v=2&productId=4001062979627&ownerMemberId=240553914&companyId=248050589&memberType=seller&startValidDate=&i18n=true",
    { waitUntil: "networkidle0" }
  );
  console.log("page loaded");

  let sliderElement = await page.$(".slidetounlock");
  let slider = await sliderElement.boundingBox();
  let sliderHandle = await page.$(".nc_iconfont.btn_slide");

  let handle = await sliderHandle.boundingBox();
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(handle.x + slider.width, handle.y + handle.height / 2, {
    steps: 50,
  });
  await page.mouse.up();
  // pass captcha success!
  console.log("pass captcha success");

  let cookiesArr, cookiePassCaptcha;
  for (let index = 0; index < 10; index++) {
    //sleep 1s đợi chuyển trang
    await sleep(1000);
    console.log("get cookie", index);
    cookiesArr = await page.cookies();
    cookiePassCaptcha = checkHasCookiePassCaptcha(cookiesArr);
    if (cookiePassCaptcha) {
      console.log("browser close");
      await browser.close();
      return cookiePassCaptcha;
    }
  }
  return cookiePassCaptcha;
} 

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const checkHasCookiePassCaptcha = (cookiesArr) => {
  let data = null;
  for (const item of cookiesArr) {
    if (item.name === "x5sec") {
      data = item.value;
    }
  }
  return data;
};
