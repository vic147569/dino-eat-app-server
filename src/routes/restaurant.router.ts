import restaurantController from '@/controller/restaurant.controller'
import express from 'express'
import { param } from 'express-validator'

const restaurantRouter = express.Router()

restaurantRouter.get(
  '/:restaurantId',
  param('restaurantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Restaurant ID parameter must be a valid string'),
  restaurantController.getRestaurant
)

restaurantRouter.get(
  '/search/:city',
  param('city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('City parameter must be a valid string'),
  restaurantController.searchRestaurants
)

export default restaurantRouter
