const request = require('supertest');
const chai = require('chai');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

const http = 'http://localhost:4000/graphql';

describe('User External with GraphQL ', () => {
    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 200`, async () => {
            const successfulRegister = require('../fixture/request/register/registerUser.json');
            successfulRegister.variables.name = faker.name.firstName();
            successfulRegister.variables.email = faker.internet.email();

            const resp = await request(http)
                .post('')
                .send(successfulRegister);

            expect(resp.status).to.equal(200);
            expect(resp.body.data.register).to.have.property('name', successfulRegister.variables.name);
            expect(resp.body.data.register).to.have.property('email', successfulRegister.variables.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado`, async () => {
            const existingRegister = require('../fixture/request/register/registerUserWithErros.json');

            const resp = await request(http)
                .post('')
                .send(existingRegister);

            expect(resp.status).to.equal(200);
            expect(resp.body.errors[0].message).to.equal('Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const loginInvalid = require('../fixture/request/login/loginUserInvalid.json');
        loginInvalid.forEach((test) => {
            it(`Quando eu realizar um ${test.nomeDoTeste}`, async () => {

                const resp = await request(http)
                    .post('')
                    .send(test.login);

                expect(resp.status).to.equal(test.statusCode);
                expect(resp.body.errors[0].message).to.equal(test.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const login = require('../fixture/request/login/loginUser.json');

            const resp = await request(http)
                .post('')
                .send(login);

            expect(resp.status).to.equal(200);
            expect(resp.body.data.login).to.have.property('token');
        });
    })
});
