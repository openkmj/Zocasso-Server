import { NextFunction, Request, Response } from 'express'

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  // TODO: check is the token is validate format
  // @ts-ignore
  req.uid = token
  next()
}

export default checkToken
