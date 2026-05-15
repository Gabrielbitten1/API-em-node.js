import request from 'supertest'
import express from 'express'


const app = express()
app.use(express.json())

let users = []

app.post('/users', (req, res) => {
  users.push(req.body)
  res.status(201).json(users)
})

app.get('/users', (req, res) => {
  res.status(200).json(users)
})


beforeEach(() => {
  users.length = 0
})


describe('POST /users', () => {
  test('caminho feliz: cria um usuário e retorna status 201', async () => {
    const newUser = { name: 'Alice', email: 'alice@example.com' }

    const res = await request(app).post('/users').send(newUser)

    expect(res.status).toBe(201)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject(newUser)
  })

  test('acumula múltiplos usuários na lista', async () => {
    await request(app).post('/users').send({ name: 'Alice' })
    const res = await request(app).post('/users').send({ name: 'Bob' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveLength(2)
  })

  test('caso extremo: body vazio ainda é aceito (sem validação no servidor)', async () => {
    const res = await request(app).post('/users').send({})

    expect(res.status).toBe(201)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toEqual({})
  })

  test('caso extremo: body com campos extras é armazenado sem filtro', async () => {
    const user = { name: 'Carol', age: 30, role: 'admin', unexpected: true }

    const res = await request(app).post('/users').send(user)

    expect(res.status).toBe(201)
    expect(res.body[0]).toMatchObject(user)
  })

  test('caso extremo: Content-Type ausente retorna 400', async () => {
    const res = await request(app)
      .post('/users')
      .set('Content-Type', 'text/plain')
      .send('not json')

  
    expect(res.status).toBe(400)
  })
})


describe('GET /users', () => {
  test('caminho feliz: retorna lista de usuários com status 200', async () => {
    await request(app).post('/users').send({ name: 'Alice' })
    await request(app).post('/users').send({ name: 'Bob' })

    const res = await request(app).get('/users')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  test('caso extremo: retorna array vazio quando não há usuários', async () => {
    const res = await request(app).get('/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('retorna JSON com Content-Type correto', async () => {
    const res = await request(app).get('/users')

    expect(res.headers['content-type']).toMatch(/application\/json/)
  })
})