import { Router } from 'express'
import room from './room'
const router = Router()

router.use('/room', room)

/**
 * health check
 */
router.get('/', (req, res) => {
  res.status(200).send('OK')
})

export default router
