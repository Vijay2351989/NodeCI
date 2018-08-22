const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

class CustomPage {
  static async build() {
    let browser;
    //if (['production' , 'ci'].includes(process.env.NODE_ENV)) {
      browser = await puppeteer.launch({headless:true , args : ['--no-sandbox']});
    //}
    //else {
    //  browser = await puppeteer.launch({headless:false});
    //}

    const page = await browser.newPage();
     const customPage = new CustomPage(page)

     return new Proxy(customPage , {
       get : (target, property) => {
         return target[property]  || browser[property] || page[property];
       }
     })
  }

  constructor(page){
   this.page = page;
  }

  async login() {
    const user = await userFactory();
    const {session,sig} = sessionFactory(user);
    await this.page.setCookie({name : 'session' , value : session});
    await this.page.setCookie({name : 'session.sig' , value : sig});
    //if (['production' , 'ci'].includes(process.env.NODE_ENV)) {
    await this.page.goto('http://localhost:3000/blogs');
//  }
  //else {
  //  await this.page.goto('localhost:3010/blogs');
//  }
    await this.page.waitFor('a[href="/auth/logout"]');

  }

  async getContentOf(selector) {
     return  await this.page.$eval(selector , el => el.innerHTML);
  }


  get(path) {
    return this.page.evaluate((_path) => {
        return fetch(_path , {
        method : 'GET',
        credentials : 'same-origin',
        headers : {
          'Content-Type' : 'application/json'
        }
      } ).then(res => res.json());
    }, path);
  }

  post(path,data){
    return this.page.evaluate((_path,_data) => {
        return fetch(_path , {
        method : 'POST',
        credentials : 'same-origin',
        headers : {
          'Content-Type' : 'application/json'
        },
        body :  JSON.stringify(_data)
      }).then(res => res.json());
    },path,data);
  }

}

module.exports = CustomPage;
