import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import myUserRouter from './routes/myUser.router'
import myRestaurantRouter from './routes/myRestaurant.router'
import restaurantRouter from './routes/restaurant.router'
import orderRouter from './routes/order.router'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/my/user', myUserRouter)
app.use('/api/my/restaurant', myRestaurantRouter)
app.use('/api/restaurant', restaurantRouter)
app.use('/api/order', orderRouter)

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  console.log('connect to MongoDB success!')
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

app.get('/test', (req: Request, res: Response) => {
  res.send({
    message: 'hello !!'
  })
})

app.listen(8000, () => {
  console.log('app listen on localhost:8000 🚀')
})
