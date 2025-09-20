const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../rest/app');
const userService = require('../../../src/services/userService');

describe('User Controller', () => {
    afterEach(() => {
        sinon.restore();
    })

    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 201`, async () => {
            const registroComSucesso = require('../fixture/register/registerUser.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(registroComSucesso);

            const resposta = await request(app)
                .post('/api/users/register')
                .send(registroComSucesso);

            expect(resposta.status).to.equal(201);
            expect(resposta.body.user).to.have.property('name', registroComSucesso.name);
            expect(resposta.body.user).to.have.property('email', registroComSucesso.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado devo receber 400`, async () => {
            const registroJaExistente = require('../fixture/register/registerUserWithErros.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(null);

            const resposta = await request(app)
                .post('/api/users/register')
                .send(registroJaExistente);

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const postLoginInvalid = require('../fixture/login/postLoginInvalid.json');
        postLoginInvalid.forEach((teste) => {
            it(`Quando eu realizar um ${teste.nomeDoTeste} devo receber 401`, async () => {
                const userServiceMock = sinon.stub(userService, 'authenticate');
                userServiceMock.returns(null);

                const resposta = await request(app)
                    .post('/api/users/login')
                    .send(teste.postLoginInvalid);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const postLogin = require('../fixture/login/postLogin.json');
            const token = { token: 'token-valido' };
            const userServiceMock = sinon.stub(userService, 'authenticate');
            userServiceMock.returns(token);

            const resposta = await request(app)
                .post('/api/users/login')
                .send(postLogin);

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.deep.equal(token);
        });
    })
});
