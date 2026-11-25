import type { Network } from './common'
import type { WalletType } from './order'

export interface Profile {
  id: string
  displayName: string
  username: string
  email: string
  ensName: string | null
  walletNickname: string
  avatarUrl: string | null
  updatedAt: string
}

export interface UpdateProfileRequest {
  displayName: string
  username: string
  email: string
  ensName: string
  walletNickname: string
  avatarUrl: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface Wallet {
  id: string
  /** Apelido usado no checkout ("Reserva", "Principal"). */
  label: string
  address: string
  network: Network
  type: WalletType
  ensName: string | null
  referralCode: string
  isPrimary: boolean
  createdAt: string
}

export interface CreateWalletRequest {
  label: string
  address: string
  network: Network
  type: WalletType
  ensName?: string
  referralCode: string
}

export type UpdateWalletRequest = Partial<CreateWalletRequest>
