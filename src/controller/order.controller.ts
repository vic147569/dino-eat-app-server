import Stripe from 'stripe'
import { Request, Response } from 'express'
import Restaurant, { MenuItemType } from '@/models/restaurant'
import Order from '@/models/order'

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string)
const FRONTEND_URL = process.env.FRONTEND_URL as string
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string
    name: string
    quantity: string
  }[]
  deliveryDetails: {
    email: string
    name: string
    addressLine1: string
    city: string
  }
  restaurantId: string
}

class OrderController {
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const checkoutSessionRequest: CheckoutSessionRequest = req.body

      // find restaurant
      const restaurant = await Restaurant.findById(
        checkoutSessionRequest.restaurantId
      )

      // no restaurant ?
      if (!restaurant) {
        throw new Error('Failed to find restaurant')
      }

      // create order
      const newOrder = new Order({
        restaurant: restaurant,
        user: req.userId,
        status: 'placed',
        deliveryDetails: checkoutSessionRequest.deliveryDetails,
        cartItems: checkoutSessionRequest.cartItems,
        createdAt: new Date()
      })

      // create lineItems for stripe
      const lineItems = createLineItems(
        checkoutSessionRequest,
        restaurant.menuItems
      )

      // create session for stripe
      const session = await createSession(
        lineItems,
        newOrder._id.toString(),
        restaurant.deliveryPrice,
        restaurant._id.toString()
      )

      // create session fail?
      if (!session.url) {
        return res.status(500).json({ message: 'Error creating session' })
      }

      // if create order success, save order to database
      await newOrder.save()

      res.json({ url: session.url })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Something went wrong' })
    }
  }

  // Stripe make a post request to update order status
  async stripeWebhookHandler(req: Request, res: Response) {
    // declare a event
    let event
    try {
      const sig = req.headers['stripe-signature']
      // create a event
      event = STRIPE.webhooks.constructEvent(
        req.body,
        sig as string,
        STRIPE_ENDPOINT_SECRET
      )
    } catch (error) {
      console.log(error)
      return res.status(400).send(error)
    }

    // after order completed, update amount and status from "placed" to "paid"
    if (event.type === 'checkout.session.completed') {
      // find order from database
      const order = await Order.findById(event.data.object.metadata?.orderId)
      // no order ?
      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }
      // update paid amount and status
      order.totalAmout = event.data.object.amount_total
      order.status = 'paid'

      // update order
      await order.save()
    }
    res.status(200).send()
  }

  // get order
  async getMyOrders(req: Request, res: Response) {
    try {
      const orders = await Order.find({ user: req.userId })
        .populate('restaurant')
        .populate('user')

      res.json(orders)
    } catch (error) {
      console.log(error)
      res.status(500).json('Something went wrong')
    }
  }
}

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  // 1. foreach cartitem, get the menuItem object from the restaurantController
  // 2. foreach cartitem, convert it to a stripe line item
  // 3. retur line item array
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    // 1. restaurant provide cuisine in cartItems?
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    )

    // restaurant do not provide item in cartItems
    if (!menuItem) {
      throw new Error(`Menu item not found ${cartItem.menuItemId}`)
    }

    // 2. create lineItem
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'usd',
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name
        }
      },
      quantity: parseInt(cartItem.quantity)
    }

    return line_item
  })
  return lineItems
}

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: 'Delivery',
          type: 'fixed_amount',
          fixed_amount: {
            amount: deliveryPrice,
            currency: 'usd'
          }
        }
      }
    ],
    mode: 'payment',
    metadata: {
      orderId,
      restaurantId
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`
  })

  return sessionData
}

export default new OrderController()
