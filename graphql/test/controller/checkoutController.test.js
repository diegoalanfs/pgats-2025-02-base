const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../graphql/app');
const checkoutService = require('../../../src/services/checkoutService');

describe('Checkout Controller with GraphQL', () => {
    before(async () => {
        const login = require('../fixture/request/login/loginUser.json');

        const respLogin = await request(app)
            .post('/graphql')
            .send(login);
        token = respLogin.body.data.login.token;
    });

    afterEach(() => {
        sinon.restore();
    })

    const erroTests = require('../fixture/request/checkout/createCheckoutWithErros.json');
    erroTests.forEach((test) => {
        it(`Quando eu realizar um ${test.nomeDoTeste} devo receber ${test.statusCode}`, async () => {
            const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            checkoutServiceMock.throws(new Error(test.mensagemEsperada));

            const resp = await request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(test.checkout);

            expect(resp.status).to.equal(test.statusCode);
            expect(resp.body.errors[0].message).to.equal(test.mensagemEsperada);
        });
    });

    it(`Quando eu realizar um requisição sem o token de autenticação`, async () => {
        const testCheckout = require('../fixture/request/checkout/createCheckout.json');
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Token inválido'));

        const resp = await request(app)
            .post('/graphql')
            .set('Authorization', `Bearer token-invalido`)
            .send(testCheckout[0].checkout);

        expect(resp.status).to.equal(200);
        expect(resp.body.errors[0].message).to.equal('Token inválido');
    });
});
