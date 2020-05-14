/* eslint-disable no-unused-vars */
'use strict';

const app = require('../backend/lib/server.js').server;
const supergoose = require('@code-fellows/supergoose');
const mockRequest = supergoose(app);
const faker = require('faker');

let sampleUserName = null;

describe('user routes', () => {
  it('can access test route', () => {
    return mockRequest.get('/test')
      .then( results => {
        expect(results.body).toEqual({ message: 'pass!',});
      });
  });

  it('can create a user', () => {
    let testUser = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };
    return mockRequest.post('/user')
      .send(testUser)
      .then( data => {
        let record = data.body;
        expect(typeof record).toEqual('object');
        expect(data.statusCode).toEqual(201);
      });
  });

  it('can get multiple users', async () => {
    let testUser1 = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };
    sampleUserName = testUser1.userName;
    await mockRequest.post('/user').send(testUser1);
    return mockRequest.get('/user')
      .then(data => {
        let records = data.body;
        expect(records.length).toEqual(2);
        expect(data.status).toEqual(200);
      });
  });

  it('can get 1 record by _id', async () => {
    let testUser1 = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };
    let val1 = await mockRequest.post('/user').send(testUser1);
    return mockRequest.get(`/user/${val1.body._id}`)
      .then( result => {
        expect(typeof result.body).toEqual('object');
        expect(result.body.userName).toEqual(testUser1.userName);
      });
  });

  it('can update 1 record by _id', async () => {
    let testUser1 = {
      userName: faker.name.findName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };
    let testUser2 = {
      email: faker.internet.email(),
    };
    let val1 = await mockRequest.post('/user').send(testUser1);
    let ret1 = await mockRequest.put(`/user/${val1.body._id}`).send(testUser2);

    expect(testUser1.email === ret1.body.email).toEqual(false);
    expect(testUser2.email === ret1.body.email).toEqual(true);
    expect(testUser1.userName === ret1.body.userName).toEqual(true);
  });

  // test for sign up route
  it('save a user credential to DB upon signup and send a token back to client', () => {
    const testUser1 = {
      userName: 'test1',
      password: 'test1',
      email: faker.internet.email(),
      address: faker.address.streetAddress(),
    };

    mockRequest.post('/signup').send(testUser1)
      .then(data => {
        expect(data.status).toEqual(201);
        // expect to receive a toekn upon successful sign up
        expect(typeof data.text).toEqual('string');
      })
      .catch(e => {
        console.log(e);
      });
  });

  it('can get a user by userName', async () => {
    let x = await mockRequest.get(`/user/name/${sampleUserName}`);
    expect(x.body.userName).toEqual(sampleUserName);
  });

});

describe('client error tests', () => {
  it('will fail if user post does not contain all fields', () =>{
    return mockRequest.post('/user')
      .send()
      .then( data => {
        expect(data.statusCode).toEqual(401);
      });
  });

  it('should raise a error when try to use registered username to sign up', () => {
    // username test1 is already registered above
    const testUser1 = {
      userName: 'test1',
      password: 'test1',
      email: faker.internet.password(),
      address: faker.address.streetAddress(),
    };

    mockRequest.post('/signup').send(testUser1)
      .then(data => {
        expect(data.status).toEqual(400);
      })
      .catch(error => {
        console.log(error);
        expect(error).toEqual('This username has already been used, try other username');
      });
  });
});
