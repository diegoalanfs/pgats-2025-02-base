const request = require('supertest');
const chai = require('chai');
const { expect } = chai;

const http = 'http://localhost:4000/graphql';

describe('Checkout External with GraphQL', () => {
    before(async () => {
        const loginUser = require('../fixture/request/login/loginUser.json');
        const respLogin = await request(http)
            .post('')
            .send(loginUser);
        token = respLogin.body.data.login.token;
    });

    const successfulTests = require('../fixture/request/checkout/createCheckout.json');
    const expectedResponses = require('../fixture/response/respCheckout.json');
    successfulTests.forEach((test, idx) => {
        const expectedResp = expectedResponses[idx];
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${expectedResp.statusCode}`, async () => {
            const resp = await request(http)
                .post('')
                .set('Authorization', `Bearer ${token}`)
                .send(test.checkout);

            expect(resp.status).to.equal(expectedResp.statusCode);
            expect(resp.body.data.checkout.valorFinal).to.deep.equal(expectedResp.valorFinal);
        });
    });

    const erroTests = require('../fixture/request/checkout/createCheckoutWithErros.json');
    erroTests.forEach((test) => {
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber uma mensagem`, async () => {
            const respCheckout = await request(http)
                .post('')
                .set('Authorization', `Bearer ${token}`)
                .send(test.checkout);

            expect(respCheckout.status).to.equal(test.statusCode);
            expect(respCheckout.body.errors[0].message).to.equal(test.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação`, async () => {
         const respCheckout = await request(http)
             .post('')
             .set('Authorization', `Bearer token-invalido`)
             .send(successfulTests[0].checkout);
 
         expect(respCheckout.status).to.equal(200);
         expect(respCheckout.body.errors[0].message).to.equal('Token inválido');
     });
});
