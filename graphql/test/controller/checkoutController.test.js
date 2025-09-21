const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../graphql/app');
const checkoutService = require('../../../src/services/checkoutService');

describe('Checkout Controller with GraphQL', () => {
    before(async () => {
        const login = require('../fixture/request/login/loginUser.json');

        const respostaLogin = await request(app)
            .post('/graphql')
            .send(login);
        token = respostaLogin.body.data.login.token;
    });

    afterEach(() => {
        sinon.restore();
    })

    const testesDeErros = require('../fixture/request/checkout/createCheckoutWithErros.json');
    testesDeErros.forEach((teste) => {
        it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber ${teste.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.throws(new Error(teste.mensagemEsperada));

            const resposta = await request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.checkout);

            expect(resposta.status).to.equal(teste.statusCode);
            expect(resposta.body.errors[0].message).to.equal(teste.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação`, async () => {
        const testeCheckout = require('../fixture/request/checkout/createCheckout.json');
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Token inválido'));

        const resposta = await request(app)
            .post('/graphql')
            .set('Authorization', `Bearer token-invalido`)
            .send(testeCheckout[0].checkout);

        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Token inválido');
    });
});
