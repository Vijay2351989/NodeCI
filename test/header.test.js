
const Page = require('./page.js');

let page;

beforeEach(async () =>  {
  page = await Page.build();
  //if (['production' , 'ci'].includes(process.env.NODE_ENV)) {
  await page.goto('http://localhost:3000/blogs');
//}
//else {
  //await page.goto('localhost:3010/blogs');
//}
});


afterEach(async () => {
   await page.close();
});


test('header has the correct text' , async () => {
  const text = await page.getContentOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test('test oauth flow' , async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('when logged in, log out button should show' , async () => {
   await page.login();
   const text = await page.getContentOf('a[href="/auth/logout"]');
   expect(text).toEqual('Logout');

});
