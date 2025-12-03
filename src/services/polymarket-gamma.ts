import {
  PolymarketEntityType,
  PolymarketEvent,
  PolymarketMarket,
} from "../types/polymarketEvent";
import { logger } from "../utils/logger";

const GAMMA_API_URL = "https://gamma-api.polymarket.com";

export async function searchMarkets(query: string) {
  try {
    logger.info(`Searching markets with query: ${query}`);
    const response = await fetch(
      `${GAMMA_API_URL}/public-search?q=${query.trim()}&order=volume24hr&ascending=false&limit_per_type=1&event_status=active&keep_closed_markets=0`
    );
    if (!response.ok) {
      throw new Error(`Error fetching markets: ${response.statusText}`);
    }
    const data = await response.json();
    console.dir(data, { depth: null });
    return data as { events: PolymarketEvent[] };
  } catch (error) {
    console.error("Error searching markets:", error);
    throw error;
  }
}

type PolymarketUrlResult =
  | { type: "event"; data: PolymarketEvent }
  | { type: "market"; data: PolymarketMarket };
export async function getFromPolymarketUrl(url: string) {
  try {
    const re = /polymarket\.com\/markets\/([^\/]+)\/([^\/]+)/;
    const match = url.match(re);
    if (!match || match.length < 3) {
      throw new Error("Invalid Polymarket URL format.");
    }
    const [, type, marketSlug] = match;
    if (type !== "event" && type !== "market") {
      throw new Error("URL must point to an event or market.");
    }
    const response = await fetch(
      `${GAMMA_API_URL}/${type}s/slug/${marketSlug}`
    );
    if (!response.ok) {
      throw new Error(`Error fetching ${type}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      type,
      data,
    } as PolymarketUrlResult;
  } catch (error) {
    console.error("Error fetching from Polymarket URL:", error);
    throw error;
  }
}

export async function getTrendingMarkets(
  { tag_slug, offset }: { tag_slug?: string; offset?: number } = { offset: 0 }
) {
  try {
    logger.info("Fetching trending markets");
    const response = await fetch(
      `${GAMMA_API_URL}/events/pagination?offset=${offset}&limit=8&active=true&archived=false&closed=false&order=volume24hr&ascending=false&${
        tag_slug ? `tag_slug=${tag_slug}&` : ""
      }`
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching trending markets: ${response.statusText}`
      );
    }
    const { data } = (await response.json()) as { data: PolymarketEvent[] };
    // console.dir(data, { depth: null });
    return data;
  } catch (error) {
    console.error("Error fetching trending markets:", error);
    throw error;
  }
}

export async function getEventById(eventId: string) {
  try {
    logger.info(`Fetching event with ID: ${eventId}`);
    const response = await fetch(`${GAMMA_API_URL}/events/${eventId}`);
    if (!response.ok) {
      throw new Error(`Error fetching event: ${response.statusText}`);
    }
    const event = (await response.json()) as PolymarketEvent;
    console.dir(event.markets, { depth: null });
    return event;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
}

export async function getMarketById(marketId: string) {
  try {
    logger.info(`Fetching market with ID: ${marketId}`);
    const response = await fetch(`${GAMMA_API_URL}/markets/${marketId}`);
    if (!response.ok) {
      throw new Error(`Error fetching market: ${response.statusText}`);
    }
    const market = (await response.json()) as PolymarketMarket;
    console.dir(market, { depth: null });
    return market;
  } catch (error) {
    console.error("Error fetching market by ID:", error);
    throw error;
  }
}

export async function getComments(
  entityId: number,
  entityType: PolymarketEntityType
) {
  try {
    logger.info(`Fetching comments for ${entityType} with ID: ${entityId}`);
    const response = await fetch(
      `${GAMMA_API_URL}/comments?parent_entity_type=${entityType}&parent_entity_id=${entityId}&limit=100&order=createdAt&ascending=false&offset=0`
    );
    if (!response.ok) {
      throw new Error(`Error fetching comments: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}
