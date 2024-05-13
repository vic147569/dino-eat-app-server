import Restaurant from '@/models/restaurant'
import { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

class RestaurantController {
  async get(req: Request, res: Response) {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId })
      if (!restaurant) {
        res.status(404).json({ message: 'Cannot find restaurant' })
      }
      res.json(restaurant)
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ message: 'Failed to gget restaurant' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const existingRestaurant = await Restaurant.findOne({ user: req.userId })

      if (existingRestaurant) {
        return res
          .status(409)
          .json({ message: 'User restaurant already exist' })
      }

      // upload image to cloudinary
      const image = req.file as Express.Multer.File
      const base64Image = Buffer.from(image.buffer).toString('base64')
      const dataURI = `data:${image.mimetype};base64,${base64Image}`
      const uploadResponse = await cloudinary.uploader.upload(dataURI)

      // save restaurant to database
      const restaurant = new Restaurant(req.body)
      restaurant.imageUrl = uploadResponse.url
      restaurant.user = new mongoose.Types.ObjectId(req.userId)
      restaurant.lastUpdated = new Date()
      await restaurant.save()

      res.status(201).send(restaurant)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Failed to create restaurant' })
    }
  }
}

export default new RestaurantController()
