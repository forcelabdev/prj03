// Mock data for development/testing when API is not available
export const mockData = {
  // Auth
  login: {
    success: true,
    data: {
      token: 'mock_jwt_token_' + Math.random(),
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        totalBalance: 5000,
        bonusBalance: 500,
      },
    },
  },

  // Games
  featured: {
    success: true,
    data: [
      {
        id: '1',
        game_code: 'sweet-bonanza',
        game_name: 'Sweet Bonanza',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        cover: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        provider_code: 'pragmatic',
        is_featured: 1,
        status: 1,
        views: 12500,
      },
      {
        id: '2',
        game_code: 'gates-of-olympus',
        game_name: 'Gates of Olympus',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        cover: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        provider_code: 'pragmatic',
        is_featured: 1,
        status: 1,
        views: 10000,
      },
    ],
  },

  // Providers
  providers: {
    success: true,
    data: [
      {
        id: '1',
        code: 'pragmatic',
        name: 'Pragmatic Play',
        logo: 'https://via.placeholder.com/100',
        gameTypes: ['slots', 'live'],
        gameCount: 500,
        featured: 1,
        order: 1,
      },
      {
        id: '2',
        code: 'evolution',
        name: 'Evolution Gaming',
        logo: 'https://via.placeholder.com/100',
        gameTypes: ['live'],
        gameCount: 200,
        featured: 1,
        order: 2,
      },
    ],
  },

  // Bonuses
  bonuses: {
    success: true,
    data: [
      {
        id: '1',
        title: 'Hoşgeldin Bonusu %100 + 100 Free Spin',
        description: 'İlk yatırımınıza %100 bonus kazanın. Maksimum 5000 TL bonus.',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        amount: 5000,
        type: 'welcome',
        minDeposit: 100,
        maxBonus: 5000,
        wageringRequirement: 35,
        status: 1,
        isActive: true,
      },
      {
        id: '2',
        title: 'Haftalık Reload Bonusu %50',
        description: 'Her pazartesi yaptığınız yatırıma %50 bonus ekstra kazanın.',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        amount: 2000,
        type: 'deposit',
        minDeposit: 50,
        maxBonus: 2000,
        wageringRequirement: 25,
        status: 1,
        isActive: true,
      },
      {
        id: '3',
        title: 'Cashback Promosyonu %10',
        description: 'Kaybedeceğiniz paranın %10\'unu geri alın.',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        banner: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300',
        amount: 1000,
        type: 'cashback',
        minDeposit: 0,
        maxBonus: 1000,
        wageringRequirement: 1,
        status: 1,
        isActive: true,
      },
    ],
  },

  // Notifications
  notifications: {
    success: true,
    data: [
      {
        id: '1',
        title: 'Merhaba!',
        message: 'Sürpriz promosyonlar için Telegram kanalımıza katılın',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },

  // History
  gameHistory: {
    success: true,
    data: [
      {
        id: '1',
        gameName: 'Sweet Bonanza',
        betAmount: 100,
        winAmount: 500,
        date: new Date().toISOString(),
        status: 'win',
      },
    ],
  },

  transactionHistory: {
    success: true,
    data: [
      {
        id: '1',
        type: 'deposit',
        amount: 1000,
        method: 'Bank Transfer',
        status: 'completed',
        date: new Date().toISOString(),
      },
    ],
  },
};
