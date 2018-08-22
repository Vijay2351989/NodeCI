const Page = require('./page');

let page;

beforeEach(async () => {
  page = await Page.build();
  //if (['production' , 'ci'].includes(process.env.NODE_ENV)) {
  await page.goto('http://localhost:3000');
//}
//else {
  //await page.goto('localhost:3010/blogs');
//}
});

afterEach(async () => {
  await page.close();
})

describe('When logged in' , async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('when logged in, blog create page should come' , async () => {
      const text = await page.getContentOf('form label');
      expect(text).toEqual('Blog Title');
  });

  describe('When input is valid' , async () => {
    beforeEach(async () => {
      await page.type('.title input' , 'My test blog');
      await page.type('.content input' , 'My test blog content');
      await page.click('form button');
    });

    test('Submitting should take user to save blog screen' , async () => {
      const text = await page.getContentOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Saving the blogs add blogs to index page' , async () => {
      await page.click('button.green');
      await page.waitFor('.card-title');
      const title = await page.getContentOf('.card-title');
      const content = await page.getContentOf('p');
      expect(title).toEqual('My test blog');
      expect(content).toEqual('My test blog content');
    });
  });

  describe('When input is invalid' , async () => {
    beforeEach( async () => {
      await page.click('form button');
    });

    test('the form show an error message' , async () => {
       const titleError = await page.getContentOf('.title .red-text');
       const contentError = await page.getContentOf('.content .red-text');
       expect(titleError).toEqual('You must provide a value');
       expect(contentError).toEqual('You must provide a value');
    });

  });
});

describe('When not logged in ' , async () => {
  test('Cannot create new blog post ' , async () => {
    const result =  await page.post('/api/blogs',{title : 'T', content : 'C'});
    expect(result).toEqual({error:'You must log in!'});
  });

  test('Cannot fetch blog posts ' , async () => {
    const result =  await page.get('/api/blogs');
    expect(result).toEqual({error:'You must log in!'});
  });
});
