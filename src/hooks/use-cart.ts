import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api'
import type { Cart } from '@/contracts/cart'
import { cartQueryKey } from './use-catalog'

export function useCart() {
  return useQuery({
    queryKey: cartQueryKey(),
    queryFn: () => api.cart.get(),
  })
}

function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(), cart)
    },
  })
}

export function useAddToCart() {
  return useCartMutation(api.cart.add)
}

export function useUpdateCartItem() {
  return useCartMutation((variables: { itemId: string; quantity: number }) =>
    api.cart.update(variables.itemId, { quantity: variables.quantity }),
  )
}

export function useRemoveCartItem() {
  return useCartMutation((itemId: string) => api.cart.remove(itemId))
}

export function useApplyCoupon() {
  return useCartMutation((code: string) => api.cart.applyCoupon(code))
}

export function useRemoveCoupon() {
  return useCartMutation(() => api.cart.removeCoupon())
}

export function useRefreshQuote() {
  return useCartMutation(() => api.cart.refresh())
}
