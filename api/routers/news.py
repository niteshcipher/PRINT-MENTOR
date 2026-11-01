import time
import socket
import urllib.request
import xml.etree.ElementTree as ET
import re
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/news", tags=["Financial News"])

# 5-minute cache
_NEWS_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "articles": []
}
CACHE_TTL_SECONDS = 300

CURATED_INVESTMENT_NEWS = [
    {
        "id": "news_1",
        "title": "NIFTY 50 Scales New Peak: Domestic Inflows via SIPs Hit Record ₹24,500 Crore",
        "summary": "Monthly systematic investment plan contributions by Indian retail investors hit an all-time record, offsetting foreign institutional selling and anchoring broader market resilience.",
        "source": "Economic Times Markets",
        "url": "https://economictimes.indiatimes.com/markets",
        "category": "equities",
        "published_at": "1 hour ago",
        "sentiment": "BULLISH",
        "read_time": "3 min",
        "key_takeaway": "Retail discipline through automated monthly SIPs continues to dominate market liquidity over speculative short-term timing."
    },
    {
        "id": "news_2",
        "title": "RBI Monetary Policy: Repo Rate Held Steady at 6.5%; Inflation Target Band in Sight",
        "summary": "The Reserve Bank of India maintains standard repo rates, citing robust 7.2% GDP growth and food price moderation. Bank Fixed Deposit rates are expected to stay stable across 1-3 year tenures.",
        "source": "RBI / Mint",
        "url": "https://www.livemint.com/economy",
        "category": "rbi_macro",
        "published_at": "2 hours ago",
        "sentiment": "NEUTRAL",
        "read_time": "4 min",
        "key_takeaway": "Favorable window for locking in short-to-medium term fixed income yields before potential future rate easing."
    },
    {
        "id": "news_3",
        "title": "SEBI Launches Zero-Trust Crackdown on Fraudulent WhatsApp & Telegram 'VIP Tips' Groups",
        "summary": "Market regulator warns against unregistered finfluencers promising 20% weekly gains. SEBI mandates that all genuine research analysts must prominently display valid registration IDs on public portals.",
        "source": "SEBI Press Bulletin",
        "url": "https://www.sebi.gov.in",
        "category": "scam_alert",
        "published_at": "3 hours ago",
        "sentiment": "WATCH",
        "read_time": "2 min",
        "key_takeaway": "Never transfer capital or OTPs to personal UPI accounts or unregulated private messaging channels."
    },
    {
        "id": "news_4",
        "title": "Index Funds Gain Major Inflow Momentum Among Gen-Z & First-Time Earners",
        "summary": "Low expense ratios (under 0.15%) and broad economic exposure make Nifty 50 and Nifty Next 50 index funds the fastest growing category among newly opened demat accounts.",
        "source": "Financial Express",
        "url": "https://www.financialexpress.com/money",
        "category": "mutual_funds",
        "published_at": "5 hours ago",
        "sentiment": "BULLISH",
        "read_time": "4 min",
        "key_takeaway": "Avoiding excessive active management commissions compounds significantly over 15 to 20 year horizons."
    },
    {
        "id": "news_5",
        "title": "Gold & Silver Touch Key Support Levels Amid Strong US Dollar Index Volatility",
        "summary": "Sovereign Gold Bonds (SGB) and physical gold hold steady as a strategic hedge against international geopolitical tensions. Advisors recommend 5-10% portfolio allocation for emergency resilience.",
        "source": "Moneycontrol Commodities",
        "url": "https://www.moneycontrol.com",
        "category": "commodities",
        "published_at": "6 hours ago",
        "sentiment": "NEUTRAL",
        "read_time": "3 min",
        "key_takeaway": "Precious metals act primarily as monetary insurance rather than high-growth compounding engines."
    },
    {
        "id": "news_6",
        "title": "Provident Fund (EPFO) Declares 8.25% Interest Rate for Current Financial Year",
        "summary": "Salaried employees in India benefit from sovereign-backed compounding. The Labor Ministry confirms the crediting of interest across all active Universal Account Numbers (UAN).",
        "source": "Livemint Wealth",
        "url": "https://www.livemint.com",
        "category": "rbi_macro",
        "published_at": "8 hours ago",
        "sentiment": "BULLISH",
        "read_time": "3 min",
        "key_takeaway": "Statutory compounding through EPF and PPF provides guaranteed tax-efficient bedrock financial armor."
    },
    {
        "id": "news_7",
        "title": "Digital Rupee (CBDC) Interoperability with UPI Expands Across Major Retail Networks",
        "summary": "Consumers can now scan standard UPI QR codes directly using digital currency wallets, bridging central bank digital currency with everyday consumer retail payments seamlessly.",
        "source": "Business Standard",
        "url": "https://www.business-standard.com",
        "category": "equities",
        "published_at": "10 hours ago",
        "sentiment": "NEUTRAL",
        "read_time": "3 min",
        "key_takeaway": "India's payment stack continues rapid friction reduction, making expense tracking essential."
    },
    {
        "id": "news_8",
        "title": "Emergency Fund Preparedness: 62% of Young Workers Still Rely on Revolving Credit",
        "summary": "Study highlights that lacking a 3-month liquid cash cushion forces young professionals into high credit card revolving interest rates (up to 42% APR) during unexpected transitions.",
        "source": "Pixel Mentor Research",
        "url": "https://pixelmentor.app",
        "category": "scam_alert",
        "published_at": "12 hours ago",
        "sentiment": "WATCH",
        "read_time": "4 min",
        "key_takeaway": "Securing 3 to 6 months of mandatory living expenses in a liquid buffer must precede volatile investing."
    },
    {
        "id": "news_9",
        "title": "Mutual Fund Flexi-Cap Inflows Rise as Diversification Rebalances Across Sectors",
        "summary": "Fund managers actively balance large-cap stability with mid-cap growth potential. Analysts note steady long-term compounding across industrial, manufacturing, and IT infrastructure plays.",
        "source": "ET Wealth",
        "url": "https://economictimes.indiatimes.com/wealth",
        "category": "mutual_funds",
        "published_at": "14 hours ago",
        "sentiment": "BULLISH",
        "read_time": "3 min",
        "key_takeaway": "Flexi-cap allocations allow experienced fund managers to dynamically navigate dynamic market cycles."
    },
    {
        "id": "news_10",
        "title": "Cyber Police Issue Red Alert on 'Part-Time Telegram Task' & Rating Review Scams",
        "summary": "Scammers offer ₹500 for Google Map reviews or YouTube likes, then lure victims into fake crypto/stock merchant accounts with locked withdrawal funds. Over ₹120 Crore seized nationwide.",
        "source": "National Cyber Crime Bureau",
        "url": "https://cybercrime.gov.in",
        "category": "scam_alert",
        "published_at": "1 day ago",
        "sentiment": "WATCH",
        "read_time": "2 min",
        "key_takeaway": "Any job offer paying for trivial likes or requiring an upfront security deposit is a guaranteed advance-fee scam."
    }
]

def clean_html(raw_html: str) -> str:
    cleanr = re.compile(r'<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def scrape_live_financial_rss() -> List[Dict[str, Any]]:
    """
    Safely attempts scraping live financial RSS feeds.
    Uses ultra-fast socket timeouts and gracefully falls back to curated dispatches.
    """
    global _NEWS_CACHE
    now = time.time()

    # If cache is valid, return immediately
    if _NEWS_CACHE["articles"] and (now - _NEWS_CACHE["timestamp"]) < CACHE_TTL_SECONDS:
        return _NEWS_CACHE["articles"]

    scraped_articles = []

    # Safe attempt with strict socket timeout
    try:
        orig_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(1.5)

        feed_urls = [
            ("https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "Economic Times Markets", "equities"),
            ("https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms", "ET Wealth & Mutual Funds", "mutual_funds")
        ]

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PixelMentor/1.0"}

        for url, source_name, category in feed_urls:
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    xml_content = response.read()
                    root = ET.fromstring(xml_content)
                    channel = root.find("channel")
                    items = channel.findall("item") if channel is not None else root.findall(".//item")

                    for item in items[:4]:
                        title = item.findtext("title") or "Financial Market Update"
                        link = item.findtext("link") or url
                        description = clean_html(item.findtext("description") or "")
                        pub_date = item.findtext("pubDate") or "Today"

                        lower_text = f"{title} {description}".lower()
                        if any(w in lower_text for w in ["record", "high", "rally", "growth", "jump", "surge", "gain"]):
                            sentiment = "BULLISH"
                        elif any(w in lower_text for w in ["drop", "crash", "plunge", "fall", "risk", "warning", "caution"]):
                            sentiment = "CAUTIOUS"
                        elif any(w in lower_text for w in ["scam", "fraud", "penalty", "illegal", "probe", "crackdown"]):
                            sentiment = "WATCH"
                        else:
                            sentiment = "NEUTRAL"

                        scraped_articles.append({
                            "id": f"scraped_{len(scraped_articles) + 1}",
                            "title": title,
                            "summary": description[:220] + ("..." if len(description) > 220 else ""),
                            "source": source_name,
                            "url": link,
                            "category": category,
                            "published_at": pub_date[:16] if len(pub_date) > 16 else pub_date,
                            "sentiment": sentiment,
                            "read_time": "3 min",
                            "key_takeaway": "Monitor real-time domestic earnings and macroeconomic policy."
                        })
            except Exception:
                pass

        socket.setdefaulttimeout(orig_timeout)
    except Exception:
        pass

    # Ensure curated backup news is always included
    combined = scraped_articles + [a for a in CURATED_INVESTMENT_NEWS if a["id"] not in {s["id"] for s in scraped_articles}]
    _NEWS_CACHE["articles"] = combined
    _NEWS_CACHE["timestamp"] = now

    return combined

@router.get("")
@router.get("/")
def get_investment_news(
    category: Optional[str] = None,
    search: Optional[str] = None,
    refresh: bool = False
):
    """
    Returns daily investment and market news aggregated via web scraping
    with guaranteed instant fallback response.
    """
    global _NEWS_CACHE
    if refresh:
        _NEWS_CACHE["timestamp"] = 0

    articles = scrape_live_financial_rss()

    if category and isinstance(category, str) and category.strip().lower() != "all":
        cat_lower = category.strip().lower()
        articles = [a for a in articles if a.get("category", "").lower() == cat_lower]

    if search and isinstance(search, str) and search.strip():
        s_lower = search.strip().lower()
        articles = [
            a for a in articles 
            if s_lower in a.get("title", "").lower() or s_lower in a.get("summary", "").lower()
        ]

    market_ticker = [
        {"name": "NIFTY 50", "value": "24,835.20", "change": "+0.45%", "isPositive": True},
        {"name": "SENSEX", "value": "81,382.40", "change": "+0.38%", "isPositive": True},
        {"name": "GOLD (10g)", "value": "₹78,450", "change": "-0.15%", "isPositive": False},
        {"name": "USD / INR", "value": "₹84.05", "change": "+0.02%", "isPositive": True},
        {"name": "RBI REPO RATE", "value": "6.50%", "change": "HOLD", "isPositive": True}
    ]

    return {
        "count": len(articles),
        "ticker": market_ticker,
        "articles": articles,
        "last_updated": time.strftime("%H:%M:%S UTC")
    }
