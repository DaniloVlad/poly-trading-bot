export type PolymarketEntityType = "Event" | "Market" | "Series";

export type PolymarketEvent = {
  id: string;
  title: string;
  description: string;
  resolutionSource: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: string;
  volume: string;
  openInterest: string;
  createdAt: string;
  updatedAt: string;
  competitive: number;
  volume24hr: string;
  volume1wk: string;
  volume1mo: string;
  volume1yr: string;
  enableOrderBook: boolean;
  liquidityClob: string;
  negRisk: boolean;
  negRiskMarketID: string;
  commentCount: number;
  markets: PolymarketMarket[];
  series: { id: number }[];
};

export type PolymarketMarket = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string; // Array of outcome strings as string '["Yes", "No"]',
  outcomePrices: string; // Array of outcome prices as strings
  volume: string;
  active: boolean;
  closed: boolean;
  clobTokenIds: string[]; // Array of CLOB token IDs as strings
  createdAt: string;
  spread: number;
  oneDayPriceChange: number;
  oneWeekPriceChange: number;
  oneMonthPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
};

type PolymarketTag = {
  id: string;
  label: string;
  slug: string;
  forceShow: boolean;
  publishedAt: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  forceHide: boolean;
  isCarousel: boolean;
};

type PolymarketCategory = {
  id: string;
  label: string;
  parentCategory: string | null;
  slug: string;
  publishedAt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};
