import restaurantController from '@/controller/restaurant.controller'
import { jwtCheck, jwtParse } from '@/middleware/auth'
import { validateMyRestaurantRequest } from '@/middleware/validation'
import express from 'express'
import multer from 'multer'

const restaurantRouter = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

restaurantRouter.get('/', jwtCheck, jwtParse, restaurantController.get)

restaurantRouter.post(
  '/',
  upload.single('imageFile'),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  restaurantController.create
)

export default restaurantRouter
