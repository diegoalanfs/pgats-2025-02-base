const request = require('supertest');
const chai = require('chai');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

const http = 'http://localhost:3000';

describe('User External with API Rest', () => {
    describe('Validar o Registro de Usuário', () => {
        it(`Quando eu realizar um registro de um novo usuário com dados válidos devo receber 201`, async () => {
            const successfulRegister = require('../fixture/register/registerUser.json');
            successfulRegister.name = faker.name.firstName();
            successfulRegister.email = faker.internet.email();

            const resp = await request(http)
                .post('/api/users/register')
                .send(successfulRegister);

            expect(resp.status).to.equal(201);
            expect(resp.body.user).to.have.property('name', successfulRegister.name);
            expect(resp.body.user).to.have.property('email', successfulRegister.email);
        });

        it(`Quando eu realizar um registro com um e-mail já cadastrado devo receber 400`, async () => {
            const existingRegister = require('../fixture/register/registerUserWithErros.json');

            const resp = await request(http)
                .post('/api/users/register')
                .send(existingRegister);

            expect(resp.status).to.equal(400);
            expect(resp.body).to.have.property('error', 'Email já cadastrado');
        });
    })

    describe('Validar o Login de Usuário', () => {
        const postLoginInvalid = require('../fixture/login/postLoginInvalid.json');
        postLoginInvalid.forEach((test) => {
            it(`Quando eu realizar um ${test.nomeDoTeste} devo receber 401`, async () => {

                const resp = await request(http)
                    .post('/api/users/login')
                    .send(test.postLoginInvalid);

                expect(resp.status).to.equal(test.statusCode);
                expect(resp.body).to.have.property('error', test.mensagemEsperada);
            });
        });

        it(`Quando eu realizar um login com credenciais válidas devo receber 200`, async () => {
            const postLogin = require('../fixture/login/postLogin.json');

            const resp = await request(http)
                .post('/api/users/login')
                .send(postLogin);

            expect(resp.status).to.equal(200);
            expect(resp.body).to.have.property('token');
        });
    })
});
