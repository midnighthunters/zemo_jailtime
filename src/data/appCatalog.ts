import type { AppCategory } from '@/src/types/court';

// A pickable real-world app or site shown in the "Add App or Website" popup.
export type CatalogApp = {
  id: string;
  name: string;
  color: string;
  villainName: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
};

export type CatalogCategory = {
  category: AppCategory;
  label: string;
  color: string;
  apps: CatalogApp[];
};

// Curated catalog grouped by category. Picking an entry creates a suspect.
export const APP_CATALOG: CatalogCategory[] = [
  {
    category: 'shortVideo',
    label: 'Short Video',
    color: '#F04B8A',
    apps: [
      { id: 'tiktok', name: 'TikTok', color: '#000000', villainName: 'Scroll Phantom', dangerLevel: 5 },
      { id: 'reels', name: 'Instagram Reels', color: '#E1306C', villainName: 'Reels Raccoon', dangerLevel: 5 },
      { id: 'shorts', name: 'YouTube Shorts', color: '#FF0000', villainName: 'Loop Goblin', dangerLevel: 5 },
      { id: 'snap-spotlight', name: 'Snapchat Spotlight', color: '#FFFC00', villainName: 'Ghost Tempter', dangerLevel: 4 },
    ],
  },
  {
    category: 'social',
    label: 'Social & Chat',
    color: '#2D7FF9',
    apps: [
      { id: 'instagram', name: 'Instagram', color: '#C13584', villainName: 'Vanity Viper', dangerLevel: 5 },
      { id: 'x', name: 'X (Twitter)', color: '#1DA1F2', villainName: 'Outrage Owl', dangerLevel: 4 },
      { id: 'facebook', name: 'Facebook', color: '#1877F2', villainName: 'Feed Fiend', dangerLevel: 4 },
      { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', villainName: 'Ping Pirate', dangerLevel: 3 },
      { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', villainName: 'Streak Stalker', dangerLevel: 4 },
      { id: 'reddit', name: 'Reddit', color: '#FF4500', villainName: 'Thread Troll', dangerLevel: 4 },
    ],
  },
  {
    category: 'video',
    label: 'Video & Streaming',
    color: '#E53935',
    apps: [
      { id: 'youtube', name: 'YouTube', color: '#FF0000', villainName: 'Rabbit-Hole Rook', dangerLevel: 4 },
      { id: 'netflix', name: 'Netflix', color: '#E50914', villainName: 'Binge Bandit', dangerLevel: 3 },
      { id: 'twitch', name: 'Twitch', color: '#9146FF', villainName: 'Stream Siren', dangerLevel: 3 },
      { id: 'primevideo', name: 'Prime Video', color: '#00A8E1', villainName: 'Autoplay Imp', dangerLevel: 3 },
    ],
  },
  {
    category: 'game',
    label: 'Games',
    color: '#6B4EFF',
    apps: [
      { id: 'clash', name: 'Clash of Clans', color: '#F7A600', villainName: 'Loot Goblin', dangerLevel: 3 },
      { id: 'pubg', name: 'PUBG Mobile', color: '#F2A900', villainName: 'Drop Demon', dangerLevel: 4 },
      { id: 'candycrush', name: 'Candy Crush', color: '#E84B9C', villainName: 'Sugar Sprite', dangerLevel: 3 },
      { id: 'roblox', name: 'Roblox', color: '#E2231A', villainName: 'Block Bandit', dangerLevel: 3 },
    ],
  },
  {
    category: 'shopping',
    label: 'Shopping',
    color: '#FF9F1C',
    apps: [
      { id: 'amazon', name: 'Amazon', color: '#FF9900', villainName: 'Cart Crook', dangerLevel: 3 },
      { id: 'shein', name: 'SHEIN', color: '#000000', villainName: 'Bargain Banshee', dangerLevel: 3 },
      { id: 'aliexpress', name: 'AliExpress', color: '#E62E04', villainName: 'Deal Demon', dangerLevel: 3 },
    ],
  },
  {
    category: 'news',
    label: 'News',
    color: '#455A64',
    apps: [
      { id: 'applenews', name: 'News', color: '#FD415E', villainName: 'Doom Hyena', dangerLevel: 4 },
      { id: 'googlenews', name: 'Google News', color: '#4285F4', villainName: 'Headline Hawk', dangerLevel: 3 },
    ],
  },
  {
    category: 'dating',
    label: 'Dating',
    color: '#E64980',
    apps: [
      { id: 'tinder', name: 'Tinder', color: '#FE3C72', villainName: 'Swipe Dragon', dangerLevel: 3 },
      { id: 'bumble', name: 'Bumble', color: '#FFC629', villainName: 'Buzz Beast', dangerLevel: 3 },
      { id: 'hinge', name: 'Hinge', color: '#502E84', villainName: 'Match Mimic', dangerLevel: 3 },
    ],
  },
];
