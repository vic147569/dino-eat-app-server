import express from 'express'
import userController from '../controller/user.controller'
import { jwtCheck } from '@/middleware/auth'

const userRouter = express.Router()

userRouter.post('/', jwtCheck, userController.create)

export default userRouter
