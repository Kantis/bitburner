import express from 'express'
import { Router } from 'express'

const app = express()
const port = 3000

app.use('/src', express.static('dist'))

const routes = Router()

routes.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' })
})

app.use(routes)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})