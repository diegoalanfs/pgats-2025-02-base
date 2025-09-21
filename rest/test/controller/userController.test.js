const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../rest/app');
const userService = require('../../../src/services/userService');

describe('User Controller with API Rest', () => {
    afterEach(() => {
        sinon.restore();
    })

    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 201`, async () => {
            const successfulRegister = require('../fixture/register/registerUser.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(successfulRegister);

            const resp = await request(app)
                .post('/api/users/register')
                .send(successfulRegister);

            expect(resp.status).to.equal(201);
            expect(resp.body.user).to.have.property('name', successfulRegister.name);
            expect(resp.body.user).to.have.property('email', successfulRegister.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado devo receber 400`, async () => {
            const existingRegister = require('../fixture/register/registerUserWithErros.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(null);

            const resp = await request(app)
                .post('/api/users/register')
                .send(existingRegister);

            expect(resp.status).to.equal(400);
            expect(resp.body).to.have.property('error', 'Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const postLoginInvalid = require('../fixture/login/postLoginInvalid.json');
        postLoginInvalid.forEach((teste) => {
            it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber 401`, async () => {
                const userServiceMock = sinon.stub(userService, 'authenticate');
                userServiceMock.returns(null);

                const resp = await request(app)
                    .post('/api/users/login')
                    .send(teste.postLoginInvalid);

                expect(resp.status).to.equal(teste.statusCode);
                expect(resp.body).to.have.property('error', teste.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const postLogin = require('../fixture/login/postLogin.json');
            const token = { token: 'token-valido' };
            const userServiceMock = sinon.stub(userService, 'authenticate');
            userServiceMock.returns(token);

            const resp = await request(app)
                .post('/api/users/login')
                .send(postLogin);

            expect(resp.status).to.equal(200);
            expect(resp.body).to.deep.equal(token);
        });
    })
});
