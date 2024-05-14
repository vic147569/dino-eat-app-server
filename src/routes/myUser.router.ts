import express from 'express'
import myUserController from '../controller/myUser.controller'
import { jwtCheck, jwtParse } from '@/middleware/auth'
import { validateMyUserRequest } from '@/middleware/validation'

const myUserRouter = express.Router()

myUserRouter.get('/', jwtCheck, jwtParse, myUserController.get)
myUserRouter.post('/', jwtCheck, myUserController.create)
myUserRouter.put(
  '/',
  jwtCheck,
  jwtParse,
  validateMyUserRequest,
  myUserController.update
)

export default myUserRouter
