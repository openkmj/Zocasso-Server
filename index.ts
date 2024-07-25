require('dotenv').config()

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import router from './router'
import socketManager from './module/SocketManager'
import logger from './util/logger'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }))
app.use(router)

logger.setLogLevel(2)

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info('Server Start')
})

socketManager.init(server)
