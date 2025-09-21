const request = require('supertest');
const chai = require('chai');
const { expect } = chai;

const http = 'http://localhost:3000';

describe('Checkout External with API Rest', () => {
    before(async () => {
        const postLogin = require('../fixture/login/postLogin.json');
        const respLogin = await request(http)
            .post('/api/users/login')
            .send(postLogin);
        token = respLogin.body.token;
    });

    const successfulTests = require('../fixture/checkout/postCheckout.json');
    const expectedResponses = require('../fixture/response/respCheckoutExternal.json');
    successfulTests.forEach((test, idx) => {
        const expectedResp = expectedResponses[idx];
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${expectedResp.statusCode}`, async () => {
            const resp = await request(http)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(test.postCheckout);

            expect(resp.status).to.equal(expectedResp.statusCode);
            delete expectedResp.postCheckout.cardData;
            expect(resp.body).to.deep.equal(expectedResp.postCheckout);
        });
    });

    const erroTests = require('../fixture/checkout/postCheckoutWithErrors.json');
    erroTests.forEach((test) => {
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${test.statusCode}`, async () => {
            const resp = await request(http)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(test.postCheckout);

            expect(resp.status).to.equal(test.statusCode);
            expect(resp.body).to.have.property('error', test.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação devo receber 401`, async () => {
        const resp = await request(http)
            .post('/api/checkout')
            .set('Authorization', `Bearer token-invalido`)
            .send(successfulTests[0].postCheckout);

        expect(resp.status).to.equal(401);
        expect(resp.body).to.have.property('error', 'Token inválido');
    });
});
