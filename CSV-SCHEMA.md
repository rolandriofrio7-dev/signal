# Signal CSV Schema

## Expected Columns (Meta Ads Manager Export)

Signal auto-parses all Meta Ads Manager exports. The app categorizes columns into these 8 groups:

### 1. Conversions
- Conversions
- Adds of payment info
- Adds to cart
- Checkouts initiated
- Content views
- Donation ROAS
- Landing page views
- Leads
- Purchase ROAS
- Purchases
- Results

### 2. Messaging
- Cost per messaging conversation started
- Cost per messaging subscription
- Messaging conversations replied
- Messaging conversations started
- Messaging subscriptions
- Returning messaging contacts
- Welcome message views

### 3. Engagement
- Check-ins
- Cost per event response
- Net reminders on
- Page engagement
- Cost per join group request
- Post comments
- Cost per Page engagement
- Post engagements
- Cost per post engagement
- Post reactions
- Event responses
- Post saves
- Join group requests
- Post shares

### 4. Traffic
- Cost per landing page view
- Landing page views
- Instagram profile visits
- Clicks
- Clicks (all)
- Cost per unique click (all)
- CPC (all)
- CPC (cost per link click)
- CTR (all)
- CTR (link click-through rate)
- Link clicks
- Photo clicks
- Shop clicks
- Unique clicks (all)
- Unique CTR (all)
- Unique CTR (link click-through rate)
- Unique link clicks

### 5. Follows & Likes
- Cost per like
- Instagram follows
- Facebook likes

### 6. Awareness / Media
- 2-second continuous video plays
- Cost per ThruPlay
- 3-second video plays
- Thru Plays
- Cost per 2-second continuous video play
- Unique 2-second continuous video plays
- Cost per 3-second video play
- Video plays

### 7. Distribution
- Impressions
- Cost per 1,000 Meta Accounts reached
- Reach
- CPM (cost per 1,000 impressions)
- Frequency
- Views
- Viewers

### 8. Diagnostics & Status
- Ad relevance
- Conversion rate ranking
- Quality ranking
- Engagement rate ranking
- Messaging and calling
- Blocks
- Ad set delivery
- Attribution setting
- Delivery
- Date created
- Date last edited
- Ends
- Last significant edit
- Reporting ends
- Reporting starts
- Starts

## Campaign Info (Always Present)
- `Ad name` — Name of the ad/campaign
- `Campaign name` — Parent campaign
- `Campaign ID` — Campaign identifier
- `Ad set name` — Ad set grouping
- `Ad set ID` — Ad set identifier
- `Amount spent (USD)` — Total spend

## Auto-Parsing Strategy

Claude will:
1. **Read the CSV headers** and categorize each column into the 8 groups above
2. **Extract key metrics** from the first row:
   - Spend, Impressions, Reach, Clicks, Results/Conversions
   - CTR, CPC, CPM, ROAS, CVR
3. **Calculate derived metrics:**
   - ROAS = Results / Spend
   - CVR = Conversions / Clicks
   - Cost per Result = Spend / Results
   - Frequency = Impressions / Reach

## Output Format (from Claude)
```json
{
  "campaignName": "string",
  "columns": {
    "conversions": [...column names...],
    "messaging": [...],
    "engagement": [...],
    "traffic": [...],
    "followsLikes": [...],
    "awareness": [...],
    "distribution": [...],
    "diagnostics": [...]
  },
  "metrics": {
    "totalSpend": number,
    "totalImpressions": number,
    "totalReach": number,
    "totalClicks": number,
    "totalResults": number,
    "ctr": number (0-1),
    "cpc": number,
    "cpm": number,
    "cvr": number (0-1),
    "roas": number
  }
}
```

## Notes
- Columns can be in any order — Signal auto-detects them
- Some columns may be missing — app handles gracefully
- Values with commas or quotes are properly parsed
- Empty cells are treated as 0 for numeric fields
- All 8 category groups are supported but optional
