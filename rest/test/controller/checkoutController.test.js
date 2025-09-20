const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../rest/app');
const checkoutService = require('../../../src/services/checkoutService');

describe('Checkout Controller', () => {
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

    const testesComSucesso = require('../fixture/checkout/postCheckout.json');
    const respostasEsperadas = require('../fixture/respostas/respPostCheckout.json');
    testesComSucesso.forEach((teste, idx) => {
        const respEsperada = respostasEsperadas[idx];
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${respEsperada.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.returns(teste.postCheckout);

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.postCheckout);

            expect(resposta.status).to.equal(respEsperada.statusCode);
            expect(resposta.body).to.deep.equal(respEsperada.postCheckout);
        });
    });

    const testesDeErros = require('../fixture/checkout/postCheckoutWithErrors.json');
    testesDeErros.forEach((teste) => {
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${teste.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.throws(new Error(teste.mensagemEsperada));

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.postCheckout);

            expect(resposta.status).to.equal(teste.statusCode);
            expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação devo receber 401`, async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Token inválido'));

        const resposta = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer token-invalido`)
            .send(testesComSucesso[0].postCheckout);

        expect(resposta.status).to.equal(401);
        expect(resposta.body).to.have.property('error', 'Token inválido');
    });
});
