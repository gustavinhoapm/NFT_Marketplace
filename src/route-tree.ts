import { homeRoute } from './routes/home-route'
import { rootRoute } from './routes/root-route'

export const routeTree = rootRoute.addChildren([homeRoute])
