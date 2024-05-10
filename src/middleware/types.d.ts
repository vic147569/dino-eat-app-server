declare global {
  namespace Express {
    interface Request {
      userId: string
      auth0Id: string
    }
  }
}

export {}
