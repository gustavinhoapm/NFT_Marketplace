import { aboutRoute } from './routes/about-route'
import { cartRoute } from './routes/cart-route'
import { checkoutRoute } from './routes/checkout-route'
import { confirmationRoute } from './routes/confirmation-route'
import { homeRoute } from './routes/home-route'
import { loginRoute } from './routes/login-route'
import { nftRoute } from './routes/nft-route'
import { ordersRoute } from './routes/orders-route'
import { profileRoute } from './routes/profile-route'
import { registerRoute } from './routes/register-route'
import { rootRoute } from './routes/root-route'
import { soonRoute } from './routes/soon-route'
import { walletsRoute } from './routes/wallets-route'

export const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  soonRoute,
  loginRoute,
  registerRoute,
  nftRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  ordersRoute,
  profileRoute,
  walletsRoute,
])
