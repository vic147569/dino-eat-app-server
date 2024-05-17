import orderController from '@/controller/order.controller'
import { jwtCheck, jwtParse } from '@/middleware/auth'
import express from 'express'

const orderRouter = express.Router()

orderRouter.post(
  '/checkout/create-checkout-session',
  jwtCheck,
  jwtParse,
  orderController.createCheckoutSession
)

export default orderRouter