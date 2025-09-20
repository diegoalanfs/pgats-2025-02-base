const request = require('supertest');
const chai = require('chai');
const { expect } = chai;

const http = 'http://localhost:3000';

describe('Checkout External', () => {
    before(async () => {
        const postLogin = require('../fixture/login/postLogin.json');
        const respostaLogin = await request(http)
            .post('/api/users/login')
            .send(postLogin);
        token = respostaLogin.body.token;
    });

    const testesComSucesso = require('../fixture/checkout/postCheckout.json');
    const respostasEsperadas = require('../fixture/response/respCheckoutExternal.json');
    testesComSucesso.forEach((teste, idx) => {
        const respEsperada = respostasEsperadas[idx];
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${respEsperada.statusCode}`, async () => {
            const resposta = await request(http)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.postCheckout);

            expect(resposta.status).to.equal(respEsperada.statusCode);
            delete respEsperada.postCheckout.cardData;
            expect(resposta.body).to.deep.equal(respEsperada.postCheckout);
        });
    });

    const testesDeErros = require('../fixture/checkout/postCheckoutWithErrors.json');
    testesDeErros.forEach((teste) => {
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${teste.statusCode}`, async () => {
            const resposta = await request(http)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.postCheckout);

            expect(resposta.status).to.equal(teste.statusCode);
            expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação devo receber 401`, async () => {
        const resposta = await request(http)
            .post('/api/checkout')
            .set('Authorization', `Bearer token-invalido`)
            .send(testesComSucesso[0].postCheckout);

        expect(resposta.status).to.equal(401);
        expect(resposta.body).to.have.property('error', 'Token inválido');
    });
});
