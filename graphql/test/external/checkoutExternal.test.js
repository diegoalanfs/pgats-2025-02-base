const request = require('supertest');
const chai = require('chai');
const { expect } = chai;

const http = 'http://localhost:4000/graphql';

describe('Checkout External with GraphQL', () => {
    before(async () => {
        const loginUser = require('../fixture/request/login/loginUser.json');
        const respostaLogin = await request(http)
            .post('')
            .send(loginUser);
        token = respostaLogin.body.data.login.token;
    });

    const testesComSucesso = require('../fixture/request/checkout/createCheckout.json');
    const respostasEsperadas = require('../fixture/response/respCheckout.json');
    testesComSucesso.forEach((teste, idx) => {
        const respEsperada = respostasEsperadas[idx];
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${respEsperada.statusCode}`, async () => {
            const resposta = await request(http)
                .post('')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.checkout);

            expect(resposta.status).to.equal(respEsperada.statusCode);
            expect(resposta.body.data.checkout.valorFinal).to.deep.equal(respEsperada.valorFinal);
        });
    });

    const testesDeErros = require('../fixture/request/checkout/createCheckoutWithErros.json');
    testesDeErros.forEach((teste) => {
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber uma mensagem`, async () => {
            const respostaCheckout = await request(http)
                .post('')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.checkout);

            expect(respostaCheckout.status).to.equal(teste.statusCode);
            expect(respostaCheckout.body.errors[0].message).to.equal(teste.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação devo receber 401`, async () => {
         const respostaCheckout = await request(http)
             .post('')
             .set('Authorization', `Bearer token-invalido`)
             .send(testesComSucesso[0].checkout);
 
         expect(respostaCheckout.status).to.equal(200);
         expect(respostaCheckout.body.errors[0].message).to.equal('Token inválido');
     });
});
