const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../../../graphql/app');
const userService = require('../../../src/services/userService');
const { faker } = require('@faker-js/faker');

describe('User Controller with GraphQL', () => {
    afterEach(() => {
        sinon.restore();
    })

    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 200`, async () => {
            const registroComSucesso = require('../fixture/request/register/registerUser.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            registroComSucesso.variables.name = faker.name.firstName();
            registroComSucesso.variables.email = faker.internet.email();
            userServiceMock.returns({ name: registroComSucesso.variables.name, email: registroComSucesso.variables.email});

            const resposta = await request(app)
                .post('/graphql')
                .send(registroComSucesso);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.register).to.have.property('name', registroComSucesso.variables.name);
            expect(resposta.body.data.register).to.have.property('email', registroComSucesso.variables.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado`, async () => {
            const registroJaExistente = require('../fixture/request/register/registerUserWithErros.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(null);

            const resposta = await request(app)
                .post('/graphql')
                .send(registroJaExistente);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0].message).to.equal('Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const postLoginInvalid = require('../fixture/request/login/loginUserInvalid.json');
        postLoginInvalid.forEach((teste) => {
            it(`Quando eu realizar um ${teste.nomeDoTeste}`, async () => {
                const userServiceMock = sinon.stub(userService, 'authenticate');
                userServiceMock.returns(null);

                const resposta = await request(app)
                    .post('/graphql')
                    .send(teste.login);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body.errors[0].message).to.equal(teste.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const login = require('../fixture/request/login/loginUser.json');
            const token = { token: 'token-valido' };
            const userServiceMock = sinon.stub(userService, 'authenticate');
            userServiceMock.returns(token);

            const resposta = await request(app)
                .post('/graphql')
                .send(login);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.login).to.deep.equal(token);
        });
    })
});
