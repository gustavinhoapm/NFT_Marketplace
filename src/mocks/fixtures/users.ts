import type { Profile, Wallet } from '@/contracts/profile'

/**
 * Usuários do mock. As senhas NÃO ficam em claro: guardamos apenas o SHA-256 de
 * `kurio::<senha>`, calculado fora do código (requisito A18).
 *
 * Credenciais (vão no README):
 *   gustavo@kurio.test / kurio1234
 *   nova@kurio.test    / ape4567
 */
export interface UserRecord {
  id: string
  username: string
  displayName: string
  email: string
  passwordHash: string
  avatarUrl: string | null
  ensName: string | null
  walletNickname: string
}

export const DEMO_CREDENTIALS = [
  { email: 'gustavo@kurio.test', password: 'kurio1234', userId: 'usr_gustavo' },
  { email: 'nova@kurio.test', password: 'ape4567', userId: 'usr_nova' },
] as const

export const SEED_USERS: UserRecord[] = [
  {
    id: 'usr_gustavo',
    username: 'gustavo',
    displayName: 'Gustavo Agostinho',
    email: 'gustavo@kurio.test',
    passwordHash:
      'f4a0289505f29da478da449774fce48c09307edc76840a528f4cb0a2972cf83e',
    avatarUrl: null,
    ensName: 'gustavo.kurio.eth',
    walletNickname: 'Principal',
  },
  {
    id: 'usr_nova',
    username: 'nova',
    displayName: 'Nova Sato',
    email: 'nova@kurio.test',
    passwordHash:
      '401180b70f3f948be90841ffda8158b74d4a33f9325837100dc56928a0196a81',
    avatarUrl: null,
    ensName: 'nova.kurio.eth',
    walletNickname: 'Reserva',
  },
]

export const SEED_WALLETS: Wallet[] = [
  {
    id: 'wal_001',
    label: 'Principal',
    address: '0xA91F4C2B8D3E7F0A5C6B9D2E4F8A1C3B5D7E9F0A',
    network: 'ethereum',
    type: 'metamask',
    ensName: 'gustavo.kurio.eth',
    referralCode: 'KURIO-GUSTAVO-01',
    isPrimary: true,
    createdAt: '2025-11-02T10:00:00.000Z',
  },
  {
    id: 'wal_002',
    label: 'Reserva',
    address: '0x7B2C4D6E8F0A1B3C5D7E9F1A2B4C6D8E0F2A4B6C',
    network: 'polygon',
    type: 'walletconnect',
    ensName: 'nova.kurio.eth',
    referralCode: 'KURIO-NOVA-02',
    isPrimary: false,
    createdAt: '2025-11-10T14:30:00.000Z',
  },
  {
    id: 'wal_003',
    label: 'Principal',
    address: '0x1C3D5E7F9A0B2C4D6E8F0A1B3C5D7E9F2A4B6C8D',
    network: 'ethereum',
    type: 'coinbase',
    ensName: 'nova.kurio.eth',
    referralCode: 'KURIO-NOVA-03',
    isPrimary: true,
    createdAt: '2025-11-10T14:35:00.000Z',
  },
]

/** Dono de cada carteira (o modelo expõe carteiras por usuário). */
export const SEED_WALLET_OWNERSHIP: Record<string, string> = {
  wal_001: 'usr_gustavo',
  wal_002: 'usr_gustavo',
  wal_003: 'usr_nova',
}

export const SEED_PROFILES: Profile[] = [
  {
    id: 'prof_gustavo',
    displayName: 'Gustavo Agostinho',
    username: 'gustavo',
    email: 'gustavo@kurio.test',
    ensName: 'gustavo.kurio.eth',
    walletNickname: 'Principal',
    avatarUrl: null,
    updatedAt: '2025-11-02T10:00:00.000Z',
  },
  {
    id: 'prof_nova',
    displayName: 'Nova Sato',
    username: 'nova',
    email: 'nova@kurio.test',
    ensName: 'nova.kurio.eth',
    walletNickname: 'Reserva',
    avatarUrl: null,
    updatedAt: '2025-11-10T14:30:00.000Z',
  },
]

export const SEED_PROFILE_OWNERSHIP: Record<string, string> = {
  prof_gustavo: 'usr_gustavo',
  prof_nova: 'usr_nova',
}
