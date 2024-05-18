import Restaurant from '@/models/restaurant'
import { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'
import Order from '@/models/order'

class MyRestaurantController {
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

      const imageUrl = await uploadImage(req.file as Express.Multer.File)

      // save restaurant to database
      const restaurant = new Restaurant(req.body)
      restaurant.imageUrl = imageUrl
      restaurant.user = new mongoose.Types.ObjectId(req.userId)
      restaurant.lastUpdated = new Date()
      await restaurant.save()

      res.status(201).send(restaurant)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Failed to create restaurant' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId })
      if (!restaurant) {
        return res.status(404).json({ message: 'restaurant not found' })
      }
      restaurant.restaurantName = req.body.restaurantName
      restaurant.city = req.body.city
      restaurant.country = req.body.country
      restaurant.deliveryPrice = req.body.deliveryPrice
      restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
      restaurant.cuisines = req.body.cuisines
      restaurant.menuItems = req.body.menuItems
      restaurant.lastUpdated = new Date()

      if (req.file) {
        const imageUrl = await uploadImage(req.file as Express.Multer.File)
        restaurant.imageUrl = imageUrl
      }

      await restaurant.save()
      res.status(200).send(restaurant)
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ message: 'Something went wrong' })
    }
  }

  async getMyRestaurantOrders(req: Request, res: Response) {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId })
      if (!restaurant) {
        return res.status(404).json({ message: 'restaurant not found' })
      }
      const orders = await Order.find({ restaurant: restaurant._id })
        .populate('restaurant')
        .populate('user')

      res.json(orders)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'something went wrong' })
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params
      const { status } = req.body

      // query order
      const order = await Order.findById(orderId)

      // order not found
      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      // query restaurant by order.restaurant
      const restaurant = await Restaurant.findById(order.restaurant)

      // check user is the owner of the restaurant ?
      if (restaurant?.user?._id.toString() !== req.userId) {
        return res.status(401).send()
      }

      // update order
      order.status = status
      await order.save()

      res.status(200).json(order)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Unable to update order' })
    }
  }
}

const uploadImage = async (file: Express.Multer.File) => {
  const image = file
  const base64Image = Buffer.from(image.buffer).toString('base64')
  const dataURI = `data:${image.mimetype};base64,${base64Image}`
  const uploadResponse = await cloudinary.uploader.upload(dataURI)

  return uploadResponse.url
}

export default new MyRestaurantController()
