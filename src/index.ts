import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRouter from './routes/user.router'

const app = express()

app.use(express.json())
app.use(cors())
app.use('/api/my/user', userRouter)

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  console.log('connect to MongoDB success!')
})

app.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'hello !!'
  })
})

app.listen(8000, () => {
  console.log('app listen on localhost:8000 🚀')
})
