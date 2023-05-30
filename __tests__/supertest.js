const request = require('supertest');
const { readFile } = require('fs');
const path = require('path');
const { deserialize } = require('v8');
const parser = require('../server/_parser/manual_parser')

const server = 'http://localhost:3000';

// set up testing db
// set up cookies
// put files from sample chart into body for POST/PUT


describe('Route integration', () => {
  describe('/', () => {
    describe('GET', () => {
      it('responds with 200 status and text/html content type', async () => {
        await request(server)
          .get('/')
          .expect('Content-Type', /text\/html/)
          .expect(200);
      });
    });
  });

  describe('/chart', () => {
    describe('POST', () => {
      it('responds with 200 status and application/json content type', async () => {
        const response = await request(server)
          .post('/chart')
          .set('Accept', 'application/json')
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);
      });
      it('filePathsArray, topChart, and topValues are in res.locals in body of response', async () => {
        const response = await request(server)
          .post('/chart')
          .set('Accept', 'application/json')
        console.log('post to /chart test', response.text);
      });
    });
    describe('PUT', () => {
      it('responds with 200 status and application/json content type', async () => {
        const response = await request(server)
          .put('/chart')
          .set('Accept', 'application/json')
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);
      });
      it('selected file doc is in body of response', async () => {
        const response = await request(server)
          .post('/chart')
          .set('Accept', 'application/json')
        console.log('put to /chart test', response.text);
      });
    });
    });

  describe('/path', () => {
    describe('PUT', () => {
      it('responds with 200 status and an array of objects', async () => {
        const response = await request(server)
          .get('/path')
          .set('Accept', 'application/json')
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);
      });
    });
  });
});