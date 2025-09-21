const request = require('supertest');
const chai = require('chai');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

const http = 'http://localhost:4000/graphql';

describe('User External with GraphQL ', () => {
    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 200`, async () => {
            const registroComSucesso = require('../fixture/request/register/registerUser.json');
            registroComSucesso.variables.name = faker.name.firstName();
            registroComSucesso.variables.email = faker.internet.email();

            const resposta = await request(http)
                .post('')
                .send(registroComSucesso);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.register).to.have.property('name', registroComSucesso.variables.name);
            expect(resposta.body.data.register).to.have.property('email', registroComSucesso.variables.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado`, async () => {
            const registroJaExistente = require('../fixture/request/register/registerUserWithErros.json');

            const resposta = await request(http)
                .post('')
                .send(registroJaExistente);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0].message).to.equal('Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const loginInvalid = require('../fixture/request/login/loginUserInvalid.json');
        loginInvalid.forEach((teste) => {
            it(`Quando eu realizar um ${teste.nomeDoTeste}`, async () => {

                const resposta = await request(http)
                    .post('')
                    .send(teste.login);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body.errors[0].message).to.equal(teste.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const login = require('../fixture/request/login/loginUser.json');

            const resposta = await request(http)
                .post('')
                .send(login);

            expect(resposta.status).to.equal(200);
            expect(resposta.body.data.login).to.have.property('token');
        });
    })
});
