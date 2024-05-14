import express from 'express'
import { param } from 'express-validator'

const restaurantsRouter = express.Router()

restaurantsRouter.get(
  '/search/:city',
  param('city')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('City parameter must be a valid string')
)
