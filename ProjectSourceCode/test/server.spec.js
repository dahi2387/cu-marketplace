// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************
// Test cases for Register
describe('Testing Register API', () => {
  // Positive test case
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({email: 'johndoe@colorado.edu', password: 'pwd'})
      .end((err, res) => {
        expect(res).to.have.status('200');
        done();
      });
  });

  // Negative test case
  it('Negative : /register. Checking invalid registration', done => {
    chai
      .request(server)
      .post('/register')
      .send({email: 'janedoe@gmail.com', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        //expect(res.body.message).to.equals('Invalid email domain. Please use a colorado.edu email.');
        done();
      });
  });
});
// ********************************************************************************

// *********************** TODO: WRITE 2 MORE UNIT TESTCASES **************************
//Test cases for Login
describe('Testing Login API', () => {
  // Positive test case
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 'abc@colorado.edu', password: '456'})
      .end((err, res) => {
        expect(res).to.have.status('200');
        //expect(res.body.message).to.equals('Welcome!');
        done();
      });
  });

  // Negative test case
  /*it('Negative : /login. Checking invalid login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 'xyz@gmail.com', password: '321'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        //expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });*/
});
// ********************************************************************************