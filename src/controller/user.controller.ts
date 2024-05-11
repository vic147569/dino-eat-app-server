import User from '@/models/user'
import { Request, Response } from 'express'
class UserController {
  async get(req: Request, res: Response) {
    try {
      const currentUser = await User.findOne({ _id: req.userId })

      if (!currentUser) {
        res.status(404).json({ message: 'User not found' })
      }

      res.json(currentUser)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Something went wrong' })
    }
  }

  async create(req: Request, res: Response) {
    // 1. check user exist ?
    // 2.create user if not exxist
    // 3. return user obj to client
    try {
      const { auth0Id } = req.body
      const existingUser = await User.findOne({ auth0Id })

      // user exist
      if (existingUser) {
        return res.status(200).send()
      }

      // user not exist -> create a user
      const newUser = new User(req.body)
      await newUser.save()

      res.status(201).json(newUser.toObject())
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Create user fail' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { name, addressLine1, country, city } = req.body
      const user = await User.findById(req.userId)
      if (!user) {
        res.status(404).json({ message: 'User not found' })
      }

      if (user) {
        user.name = name
        user.addressLine1 = addressLine1
        user.country = country
        user.city = city
        await user.save()
        res.send(user)
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Fail to create user' })
    }
  }
}

export default new UserController()
