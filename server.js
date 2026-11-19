import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const PORT = process.env.PORT || 3001
const FILE = path.join(process.env.DATA_DIR || './data', 'poll.json')
const OPTS = ['tranquila', 'ritmo', 'pausa']

// Almacenamiento simple en archivo JSON: { votes: { voterId: opción } }
let db = { votes: {} }
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { /* primera ejecución */ }
const save = () => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db)) }
const result = voterId => {
  const counts = Object.fromEntries(OPTS.map(o => [o, 0]))
  Object.values(db.votes).forEach(o => { if (o in counts) counts[o]++ })
  return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0), myVote: db.votes[voterId] || null }
}

const app = express()
app.set('trust proxy', 1)
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }))
app.use(express.json({ limit: '1kb' }))

// Límite simple: 40 peticiones por minuto por IP
const hits = new Map()
setInterval(() => hits.clear(), 60_000).unref()
app.use('/api', (req, res, next) => {
  const n = (hits.get(req.ip) || 0) + 1; hits.set(req.ip, n)
  n > 40 ? res.status(429).json({ error: 'Demasiadas peticiones' }) : next()
})

const validId = v => typeof v === 'string' && /^[\w-]{8,64}$/.test(v)
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.get('/api/poll', (req, res) => res.json(result(validId(req.query.voterId) ? req.query.voterId : null)))
app.post('/api/poll', (req, res) => {
  const { voterId, option } = req.body || {}
  if (!validId(voterId) || !OPTS.includes(option)) return res.status(400).json({ error: 'Voto inválido' })
  db.votes[voterId] = option // un voto por dispositivo; si vota otra vez, cambia el suyo
  save(); res.json(result(voterId))
})

app.listen(PORT, () => console.log(`API de R-set en http://localhost:${PORT}`))
