import User from '@/models/user'
import { NextFunction, Request, Response } from 'express'
import { auth } from 'express-oauth2-jwt-bearer'
import jwt from 'jsonwebtoken'

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
})

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers

  // verify authorization to get token
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.sendStatus(401)
  }

  const token = authorization.split(' ')[1]

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload
    const auth0Id = decoded.sub
    const user = await User.findOne({ auth0Id })

    if (!user) {
      res.sendStatus(401)
    }

    if (user) {
      req.auth0Id = auth0Id as string
      req.userId = user._id.toString()
    }
    next()
  } catch (error) {
    res.sendStatus(401)
  }
}
