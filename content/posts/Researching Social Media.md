As part of my efforts to meet a challenge started by [Nikita Bier](https://www.linkedin.com/in/nikitabier)

> If you want to get rich on X, it isn't going to be through creator revenue or meme coins. Instead, think about one subject matter that you know more about than anyone else in the world. It can be anything: plumbing, menswear, Indian food, furniture, social apps, whatever. Post one unexpected insight you picked from your experience in that area. Keep it under 5 sentences. Do this every day for 6 months. If you stick to it, we will promote your account to others. By the end, you will be recognized as the world's leading expert in that subject area and you can charge whatever you want for endorsements, your time, or whatever. And no one will be able to take that way from you.
https://x.com/nikitabier/status/1963498520805007470

I responded with...
> Challenge accepted, 180 posts (one a day for 6 months) all about how to maintain software development velocity coming right up. I'll start the challenge on Monday September the 8th every morning. I only have ~400 followers, I'm seriously keen to see how this goes. ✨
https://x.com/thrawn01/status/1963770987926761879

In addition, I decided to research other successful social media posters, to see if I could glean some insights into their success, and how I might model my tweets. I set my sights on https://eatonphil.com/ who I identified as a great role model to follow.

### Vibe Coding a Twitter Scraper
First order of business was building a tweet extraction tool. This turned out to be pretty straightforward, using the AI workflow I've recently had success with.

> NOTE: I'm using Claude Code
```
> /plan-all-in-one
- I'll help you create a detailed implementation plan. Let me start
by understanding what we're building.

  Please provide:
  1. The task/ticket description
  2. Any relevant context, constraints, or specific requirements
  3. Links to related research or previous implementations

  I'll analyze this information and work with you to create a comprehensive plan.
  
> A script which extracts all the tweet/posts from x.com for a specific user,
retrieving the text from each tweet/post and placing that data into a local
parquet file which can be queried at a later time. there is this library
https://github.com/d60/twikit which claims to be able to retrieve tweets
without needing access to the official API. The documentation is here
https://twikit.readthedocs.io/en/latest/twikit.html.

<Back and Forth Conversation fleshing out the details>

-- Wrote plans/pull-tweets-plan.md
 ```
You can find the complete `pull-tweets-plan.md` [here](https://github.com/thrawn01/pull-tweets/blob/main/plans/pull-tweets-plan.md)

Now we clear the context and implement the plan
```
> /clear
> /implement plans/pull-tweets-plan.md`
```

You can find the prompts for these commands [here](https://github.com/thrawn01/claude-dotfiles/tree/main/commands)

Now we have a tool that extracts Phil's tweets from the last 6 months. The CLI simply scrapes all the tweets for the target user and outputs all available metadata including the content of each tweet into a parquet file. 

The code generated along with documentation can be found [here](https://github.com/thrawn01/pull-tweets/)

```
> uv run python pull_tweets.py @eatonphil --duration "6 months" -o eaton.parquet
 
2025-09-09 09:25:47 - INFO - HTTP Request: GET https://x.com "HTTP/1.1 200 OK"
2025-09-09 09:25:47 - INFO - HTTP Request: GET https://abs.twimg.com/responsive-web/client-web/ondemand.s.8a4c5dda.js "HTTP/1.1 200 OK"
2025-09-09 09:25:47 - INFO - HTTP Request: GET https://x.com/i/api/graphql "HTTP/1.1 401 Unauthorized"
2025-09-09 09:25:47 - INFO - HTTP Request: POST https://api.x.com/1.1/guest/activate.json "HTTP/1.1 200 OK"
2025-09-09 09:25:47 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/task.json?flow_name=login "HTTP/1.1 200 OK"
2025-09-09 09:25:48 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/sso_init.json "HTTP/1.1 200 OK"
2025-09-09 09:25:48 - INFO - HTTP Request: GET https://twitter.com/i/js_inst?c_name=ui_metrics "HTTP/1.1 200 OK"
2025-09-09 09:25:48 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/task.json "HTTP/1.1 200 OK"
2025-09-09 09:25:48 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/task.json "HTTP/1.1 200 OK"
2025-09-09 09:25:49 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/task.json "HTTP/1.1 200 OK"
2025-09-09 09:25:49 - INFO - HTTP Request: POST https://api.x.com/1.1/onboarding/task.json "HTTP/1.1 200 OK"
2025-09-09 09:25:49 - INFO - Successfully authenticated with X.com
2025-09-09 09:25:49 - INFO - Initialization completed successfully
2025-09-09 09:25:49 - INFO - Starting tweet extraction for @eatonphil
2025-09-09 09:25:49 - INFO - Duration: 6 months | Output: eaton.parquet
2025-09-09 09:25:49 - INFO - HTTP Request: GET https://x.com/i/api/graphql/ "HTTP/1.1 200 OK"
2025-09-09 09:25:49 - INFO - Found user: @eatonphil (ID: 2193516390)
2025-09-09 09:25:49 - INFO - Extracting tweets for @eatonphil from 2025-03-13T14:25:49.697065+00:00
2025-09-09 09:25:52 - INFO - HTTP Request: GET https://x.com/i/api/graphql/ "HTTP/1.1 200 OK"
-- SNIP --
```

This part actually took quite a while, as I made sure the tool doesn't abuse the Twitter GraphQL endpoints, by attempting to avoid hitting Twitter ratelimits.

Next I asked Claude to perform some analysis upon the `eaton.parquet` file the scraper produced. 

> I found the SQL queries queries interesting, I've included them in the output, skip to the end for the final analysis.

```
> Using duckdb lets research the effectiveness of the tweets in eaton.parquet,
and extract information about what tweets had more engagement than others.

⏺ I'll help you analyze the tweets data in the parquet file using DuckDB 
to understand engagement patterns and identify what makes tweets more effective.

⏺ Bash(duckdb -c "SELECT * FROM 'eaton.parquet' LIMIT 0;" 2>&1 | head -20)
⏺ Bash(duckdb -c "DESCRIBE SELECT * FROM 'eaton.parquet';" | head -50)
⏺ Bash(duckdb -c "SELECT COUNT(*) as total_tweets,
             MIN(created_at) as earliest_tweet,
             MAX(created_at) as latest_tweet,
             COUNT(DISTINCT user_screen_name) as unique_users
      FROM 'eaton.parquet';")
⏺ Bash(duckdb -c "
      SELECT
          AVG(favorite_count) as avg_likes,
          AVG(retweet_count) as avg_retweets,
          AVG(reply_count) as avg_replies,
          AVG(quote_count) as avg_quotes,
          AVG(view_count) as avg_views,
          AVG(bookmark_count) as avg_bookmarks,
          MAX(favorite_count) as max_likes,
          MAX(retweet_count) as max_retweets,
          MAX(view_count) as max_views
      FROM 'eaton.parquet';")
⏺ Bash(duckdb -c "
      -- Calculate total engagement score and find top performing tweets
      WITH engagement_scores AS (
          SELECT
              id,
              SUBSTRING(full_text, 1, 100) as tweet_preview,
              created_at,
              favorite_count as likes,
              retweet_count as retweets,
              reply_count as replies,
              quote_count as quotes,
              view_count as views,
              bookmark_count as bookmarks,
              (favorite_count + retweet_count * 2 + reply_count + 
              quote_count * 1.5 + bookmark_count * 1.5) as engagement_score
          FROM 'eaton.parquet'
          WHERE full_text IS NOT NULL
      )
      SELECT
          tweet_preview,
          likes,
          retweets,
          replies,
          views,
          ROUND(engagement_score, 2) as total_engagement
      FROM engagement_scores
      ORDER BY engagement_score DESC
      LIMIT 15;")
⏺ Bash(duckdb -c "
      -- Analyze tweet characteristics
      WITH tweet_features AS (
          SELECT
              id,
              full_text,
              LENGTH(full_text) as tweet_length,
              ARRAY_LENGTH(hashtags) as hashtag_count,
              ARRAY_LENGTH(urls) as url_count,
              CASE WHEN media IS NOT NULL THEN 1 ELSE 0 END as has_media,
              CASE WHEN in_reply_to IS NOT NULL THEN 1 ELSE 0 END as is_reply,
              favorite_count + retweet_count * 2 + reply_count + quote_count *
               1.5 as engagement_score
          FROM 'eaton.parquet'
      )
      SELECT
          CASE
              WHEN engagement_score >= 1000 THEN 'High (1000+)'
              WHEN engagement_score >= 100 THEN 'Medium (100-999)'
              ELSE 'Low (<100)'
          END as engagement_tier,
          COUNT(*) as tweet_count,
          ROUND(AVG(tweet_length), 0) as avg_length,
          ROUND(AVG(hashtag_count), 2) as avg_hashtags,
          ROUND(AVG(url_count), 2) as avg_urls,
          ROUND(AVG(has_media) * 100, 1) as pct_with_media,
          ROUND(AVG(is_reply) * 100, 1) as pct_replies
      FROM tweet_features
      GROUP BY engagement_tier
      ORDER BY
          CASE engagement_tier
              WHEN 'High (1000+)' THEN 1
              WHEN 'Medium (100-999)' THEN 2
              ELSE 3
          END;")          
⏺ Bash(duckdb -c "
      -- Analyze time patterns
      WITH hourly_stats AS (
          SELECT
              EXTRACT(HOUR FROM created_at) as tweet_hour,
              EXTRACT(DOW FROM created_at) as day_of_week,
              AVG(favorite_count + retweet_count * 2) as avg_engagement
          FROM 'eaton.parquet'
          GROUP BY tweet_hour, day_of_week
      )
      SELECT
          tweet_hour,
          ROUND(AVG(avg_engagement), 1) as avg_engagement_score,
          COUNT(*) as time_slots_used
      FROM hourly_stats
      GROUP BY tweet_hour
      HAVING COUNT(*) > 5
      ORDER BY avg_engagement_score DESC
      LIMIT 10;")
⏺ Bash(duckdb -c "
      -- Find common themes in high-performing tweets
      WITH high_performers AS (
          SELECT
              full_text,
              favorite_count,
              retweet_count,
              view_count,
              (favorite_count + retweet_count * 2) as engagement_score
          FROM 'eaton.parquet'
          WHERE full_text IS NOT NULL
            AND full_text NOT LIKE 'RT @%'
            AND (favorite_count + retweet_count * 2) >= 500
      )
      SELECT
          SUBSTRING(full_text, 1, 280) as tweet_text,
          favorite_count as likes,
          retweet_count as RTs,
          view_count as views,
          engagement_score
      FROM high_performers
      ORDER BY engagement_score DESC
      LIMIT 20;")
⏺ Bash(duckdb -c "
      -- Analyze engagement rate (engagement per view)
      WITH engagement_rates AS (
          SELECT
              id,
              SUBSTRING(full_text, 1, 100) as tweet_preview,
              favorite_count as likes,
              retweet_count as retweets,
              view_count as views,
              CASE
                  WHEN view_count > 0 THEN ROUND((favorite_count + 
                  retweet_count * 2.0) / view_count * 100, 2)
                  ELSE 0
              END as engagement_rate
          FROM 'eaton.parquet'
          WHERE view_count > 1000
            AND full_text NOT LIKE 'RT @%'
      )
      SELECT
          tweet_preview,
          likes,
          retweets,
          views,
          engagement_rate as engagement_pct
      FROM engagement_rates
      ORDER BY engagement_rate DESC
      LIMIT 15;")  
```

# Tweet Engagement Analysis Report
## Dataset Overview
 - **Total Tweets**: 552
 - **Date Range**: Apr 10, 2024 - Sep 06, 2025
 - **User**: Single user dataset (@eaton)

## Key Engagement Metrics
### Average Performance
 - **Likes**: 61.3 per tweet
 - **Retweets**: 21.3 per tweet
 - **Replies**: 2.0 per tweet
 - **Views**: Average not calculated (many nulls)
 - **Bookmarks**: 2.3 per tweet
### Maximum Engagement
 - **Most Liked**: 3,811 likes
 - **Most Retweeted**: 2,576 retweets
 - **Most Viewed**: 267,430 views
## Top Performing Content Themes
### 1. Technical Resource Sharing (Highest Engagement)
 - "My favorite technical blogs" - 3,811 likes, 400 RTs (267K views)
 - Links to curated technical content perform exceptionally well
 - Resource compilations get massive reach
### 2. Educational Content on Distributed Systems
 - Posts about learning distributed systems: 1,266 likes, 89 RTs
 - "From Python to Distributed Systems Researcher": 1,065 likes, 67 RTs
 - Educational journey posts resonate strongly
### 3. Academic Paper & Book Discussions
 - Concurrency control chapters: 500-600 likes consistently
 - Google research lab paper: 956 likes, 117 RTs
 - Deep technical content has dedicated audience
### 4. Thought Leadership Posts
 - Caching philosophy post: 1,249 likes, 103 RTs
 - Posts that challenge conventional thinking perform well
## Engagement Rate Analysis (Engagement per View)
### Top Engagement Rates
 1. **Personal milestones**: 3.42% (30th birthday post)
 2. **Location-based content**: 3.04% ("Hello Montreal")
 3. **Conference/talk previews**: 3.01%
 4. **Management insights**: 2.87%
## Optimal Posting Times
 Based on historical performance:
 1. **10 AM**: Highest average engagement (245.3)
 2. **1 PM**: Second best (232.2)
 3. **2 PM**: Third (185.1)

Evening posts (8-11 PM) show significantly lower engagement.
## Content Patterns for Success
### High Performers (1000+ engagement)
 - Average length: 127 characters
 - Primarily original content (not retweets)
 - Focus on educational resources
 - Include links to valuable content
### Medium Performers (100-999 engagement)
 - Average length: 151 characters
 - Mix of technical discussions and thoughts
 - Book/paper chapter discussions
### Key Success Factors
 1. **Resource Curation**: Sharing curated lists of technical resources
 2. **Educational Journey**: Personal learning experiences and paths
 3. **Technical Deep Dives**: Chapter-by-chapter book discussions
 4. **Contrarian Takes**: Challenging conventional wisdom
 5. **Personal Touch**: Milestone celebrations, location updates
## Recommendations for Future Tweets
### Content Strategy
 1. **Make more resource lists** - Your highest performing tweet was a technical blog list
 2. **Share how you learn** - Posts about progression in technical skills perform well
 3. **Keep discussing books and papers** - Consistent 500+ engagement
 4. **Mix personal milestones** - Birthday post had excellent engagement rate
### Timing Strategy
 - **Post between 10 AM - 2 PM** for maximum reach
 - Avoid late evening posts (after 8 PM)
### Format Optimization
 - Keep tweets concise (127-151 characters optimal)
 - Always include links when sharing resources
 - Original content outperforms retweets significantly
### Engagement Rate Focus
 - **Personal and location-based content** has highest engagement rates
 - **Conference/talk announcements** drive strong engagement
 - **Management and career insights** resonate with audience
## What I'm going to do next
 1. Share regular "favorite technical blogs/papers" posts
 2. Share learning journeys in specific technical areas (Like this blog post)
 3. Balance technical content with personal stuff
 4. Schedule tweets for the 10 AM - 2 PM window

Thanks for reading!
