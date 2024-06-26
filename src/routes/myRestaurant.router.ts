import myRestaurantController from '@/controller/myRestaurant.controller'
import { jwtCheck, jwtParse } from '@/middleware/auth'
import { validateMyRestaurantRequest } from '@/middleware/validation'
import express from 'express'
import multer from 'multer'

const myRestaurantRouter = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

myRestaurantRouter.get('/', jwtCheck, jwtParse, myRestaurantController.get)

myRestaurantRouter.post(
  '/',
  upload.single('imageFile'),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  myRestaurantController.create
)

myRestaurantRouter.put(
  '/',
  upload.single('imageFile'),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  myRestaurantController.update
)

myRestaurantRouter.get(
  '/order',
  jwtCheck,
  jwtParse,
  myRestaurantController.getMyRestaurantOrders
)

myRestaurantRouter.patch(
  '/order/:orderId/status',
  jwtCheck,
  jwtParse,
  myRestaurantController.updateOrderStatus
)

export default myRestaurantRouter
