const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../rest/app');
const checkoutService = require('../../../src/services/checkoutService');

describe('Checkout Controller with API Rest', () => {
    before(async () => {
        const postLogin = require('../fixture/login/postLogin.json');

        const respostaLogin = await request(app)
            .post('/api/users/login')
            .send(postLogin);
        token = respostaLogin.body.token;
    });

    afterEach(() => {
        sinon.restore();
    })

    const successfulTests = require('../fixture/checkout/postCheckout.json');
    const expectedResponses = require('../fixture/response/respPostCheckout.json');
    successfulTests.forEach((test, idx) => {
        const expectedResp = expectedResponses[idx];
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${expectedResp.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.returns(test.postCheckout);

            const resp = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(test.postCheckout);

            expect(resp.status).to.equal(expectedResp.statusCode);
            expect(resp.body).to.deep.equal(expectedResp.postCheckout);
        });
    });

    const erroTests = require('../fixture/checkout/postCheckoutWithErrors.json');
    erroTests.forEach((test) => {
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${test.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.throws(new Error(test.mensagemEsperada));

            const resp = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(test.postCheckout);

            expect(resp.status).to.equal(test.statusCode);
            expect(resp.body).to.have.property('error', test.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação devo receber 401`, async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Token inválido'));

        const resp = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer token-invalido`)
            .send(successfulTests[0].postCheckout);

        expect(resp.status).to.equal(401);
        expect(resp.body).to.have.property('error', 'Token inválido');
    });
});
