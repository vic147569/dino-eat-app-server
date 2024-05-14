import Restaurant from '@/models/restaurant'
import { Request, Response } from 'express'

type Query = {
  city?: RegExp
  cuisines?: { $all: RegExp[] }
  $or?: ({ restaurantName: RegExp } | { cuisines: { $in: RegExp[] } })[]
}

class RestaurantController {
  async searchRestaurants(req: Request, res: Response) {
    try {
      const city = req.params.city
      const searchQuery = (req.query.searchQuery as string) || ''
      const selectedCuisines = (req.query.selectedCuisines as string) || ''
      const sortOption = (req.query.sortOption as string) || 'lastUpdated'
      const page = parseInt(req.query.page as string) || 1

      const query: Query = {}

      query['city'] = new RegExp(city, 'i')
      const cityCheck = await Restaurant.countDocuments(query)

      if (cityCheck === 0) {
        res.status(404).json({
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pages: 1
          }
        })
      }

      if (selectedCuisines) {
        const cuisinesArray = selectedCuisines
          .split(',')
          .map((cuisine) => new RegExp(cuisine, 'i'))
        query['cuisines'] = { $all: cuisinesArray }
      }

      if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, 'i')
        query['$or'] = [
          { restaurantName: searchRegex },
          { cuisines: { $in: [searchRegex] } }
        ]
      }

      const pageSize = 10
      const offset = (page - 1) * pageSize

      const restaurants = await Restaurant.find(query)
        .sort({ [sortOption]: 1 })
        .skip(offset)
        .limit(pageSize)
        .lean()

      const total = await Restaurant.countDocuments(query)

      const response = {
        data: restaurants,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / pageSize)
        }
      }
      res.json(response)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
}

export default new RestaurantController()
