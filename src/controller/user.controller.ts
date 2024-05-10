import User from '@/models/user'
import { Request, Response } from 'express'
class UserController {
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
}

export default new UserController()
