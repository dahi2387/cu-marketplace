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
// Example Positive Testcase :
// API: /add_user
// Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// Expect: res.status == 200 and res.body.message == 'Success'
// Result: This test case should pass and return a status 200 along with a "Success" message.
// Explanation: The testcase will call the /add_user API with the following input
// and expects the API to return a status of 200 along with the "Success" message.

/*describe('Testing Register API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({email: 'johndoe@colorado.edu', password: 'pwd'})
      .end((err, res) => {
        expect(res).to.have.status('success');
        expect(res.body.message).to.equals('Welcome!');
        done();
      });
  });
  //Negative test case
  it('Negative : /register. Checking invalid registration', done => {
    chai
      .request(server)
      .post('/register')
      .send({email: 'janedoe@gmail.com', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});

//Test cases for Login
describe('Testing Login API', () => {
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 'abc@colorado.edu', password: '456'})
      .end((err, res) => {
        expect(res).to.have.status('success');
        expect(res.body.message).to.equals('Welcome!');
        done();
      });
  });
  //Negative test case
  it('Negative : /login. Checking invalid login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 'xyz@gmail.com', password: '321'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});*/
// ********************************************************************************