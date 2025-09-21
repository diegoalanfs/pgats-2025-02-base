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
            const successfulRegister = require('../fixture/request/register/registerUser.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            successfulRegister.variables.name = faker.name.firstName();
            successfulRegister.variables.email = faker.internet.email();
            userServiceMock.returns({ name: successfulRegister.variables.name, email: successfulRegister.variables.email});

            const resp = await request(app)
                .post('/graphql')
                .send(successfulRegister);

            expect(resp.status).to.equal(200);
            expect(resp.body.data.register).to.have.property('name', successfulRegister.variables.name);
            expect(resp.body.data.register).to.have.property('email', successfulRegister.variables.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado`, async () => {
            const existingRegister = require('../fixture/request/register/registerUserWithErros.json');
            const userServiceMock = sinon.stub(userService, 'registerUser');
            userServiceMock.returns(null);

            const resp = await request(app)
                .post('/graphql')
                .send(existingRegister);

            expect(resp.status).to.equal(200);
            expect(resp.body.errors[0].message).to.equal('Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const postLoginInvalid = require('../fixture/request/login/loginUserInvalid.json');
        postLoginInvalid.forEach((test) => {
            it(`Quando eu realizar um ${test.nomeDoTeste}`, async () => {
                const userServiceMock = sinon.stub(userService, 'authenticate');
                userServiceMock.returns(null);

                const resp = await request(app)
                    .post('/graphql')
                    .send(test.login);

                expect(resp.status).to.equal(test.statusCode);
                expect(resp.body.errors[0].message).to.equal(test.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const login = require('../fixture/request/login/loginUser.json');
            const token = { token: 'token-valido' };
            const userServiceMock = sinon.stub(userService, 'authenticate');
            userServiceMock.returns(token);

            const resp = await request(app)
                .post('/graphql')
                .send(login);

            expect(resp.status).to.equal(200);
            expect(resp.body.data.login).to.deep.equal(token);
        });
    })
});
