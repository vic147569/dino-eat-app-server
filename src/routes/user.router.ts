import express from 'express'
import userController from '../controller/user.controller'
import { jwtCheck, jwtParse } from '@/middleware/auth'
import { validateMyUserRequest } from '@/middleware/validation'

const userRouter = express.Router()

userRouter.get('/', jwtCheck, jwtParse, userController.get)
userRouter.post('/', jwtCheck, userController.create)
userRouter.put(
  '/',
  jwtCheck,
  jwtParse,
  validateMyUserRequest,
  userController.update
)

export default userRouter
