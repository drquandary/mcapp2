#!/usr/bin/env python3
"""
NewsMode Web Search Backend API
Uses real web search to power the app's search functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import urllib.parse
import hashlib
import praw
import re
from collections import Counter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests


# ===== MODAL ANALYZER =====
class ModalAnalyzer:
    """Detects Latourian modes in Reddit posts and comments"""

    # Modal signal patterns - these detect mode presence in text
    PATTERNS = {
        'NET': [
            r'\b(viral|trending|everyone is talking|spreading|shared)\b',
            r'\b(upvotes|awards|front page|popular)\b',
            r'\b(X said|according to Twitter|going around)\b',
            r'\b(people are saying|word is|buzz)\b',
            r'\b(blowing up|taking over|everywhere)\b'
        ],
        'REF': [
            r'\b(source|citation|study shows|research|data|evidence)\b',
            r'\b(fact check|verified|confirmed|peer reviewed)\b',
            r'\[.*?\]\(http',  # markdown links
            r'\b(according to experts|scientists say|studies show)\b',
            r'\b(published|journal|paper|findings)\b',
            r'\b(documented|proven|established)\b'
        ],
        'POL': [
            r'\b(power|system|structure|institution|establishment)\b',
            r'\b(policy|government|political|congress|administration)\b',
            r'\b(we need to|should be|must change|reform)\b',
            r'\b(systemic|structural|hierarchical)\b',
            r'\b(agenda|manipulation|control)\b'
        ],
        'MOR': [
            r'\b(harm|victim|suffering|injustice|wrong|right thing)\b',
            r'\b(ethical|immoral|should|shouldn\'t|obligation)\b',
            r'\b(care about|empathy|compassion|cruelty)\b',
            r'\b(values|principles|integrity|dignity)\b',
            r'\b(responsibility|accountability)\b'
        ],
        'LAW': [
            r'\b(legal|illegal|law|court|accountability|consequences)\b',
            r'\b(prosecute|sue|justice system|regulation)\b',
            r'\b(rights|constitution|lawsuit|criminal)\b',
            r'\b(enforce|violate|comply|statute)\b'
        ]
    }

    def analyze_text(self, text):
        """Returns modal scores for a piece of text"""
        if not text:
            return {}

        scores = {}
        text_lower = text.lower()

        for mode, patterns in self.PATTERNS.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                score += len(matches)
            scores[mode] = score

        return scores

    def get_dominant_mode(self, text):
        """Returns the dominant mode for a piece of text"""
        scores = self.analyze_text(text)
        if not scores or sum(scores.values()) == 0:
            return None
        return max(scores, key=scores.get)

    def analyze_thread(self, post_data, comments_data):
        """
        Analyzes modal pathway through a Reddit thread

        Args:
            post_data: dict with 'title' and 'body'
            comments_data: list of dicts with 'body' and 'created' timestamp

        Returns:
            dict with modal analysis
        """
        # Analyze post
        post_text = f"{post_data['title']} {post_data.get('body', '')}"
        post_modes = self.analyze_text(post_text)
        post_dominant = self.get_dominant_mode(post_text)

        # Analyze comments in chronological order
        comment_sequence = []
        sorted_comments = sorted(comments_data, key=lambda c: c['created'])[:15]

        for comment in sorted_comments:
            dominant = self.get_dominant_mode(comment['body'])
            if dominant:
                comment_sequence.append(dominant)

        # Calculate pathway (most common 3-mode sequence)
        pathway = self._extract_pathway(comment_sequence)

        # Calculate complexity (unique modes used)
        all_modes = [post_dominant] + comment_sequence if post_dominant else comment_sequence
        complexity = len(set(all_modes))

        # Count mode frequencies
        mode_counts = Counter(all_modes)
        overall_dominant = mode_counts.most_common(1)[0][0] if mode_counts else None

        return {
            'post_modes': post_modes,
            'post_dominant': post_dominant,
            'dominant_mode': overall_dominant,
            'pathway': pathway,
            'complexity': complexity,
            'sequence': comment_sequence[:5],  # first 5 transitions
            'mode_distribution': dict(mode_counts)
        }

    def _extract_pathway(self, sequence):
        """Extracts most common modal transition pattern"""
        if len(sequence) < 3:
            if len(sequence) == 2:
                return f"{sequence[0]} → {sequence[1]}"
            elif len(sequence) == 1:
                return sequence[0]
            return None

        # Find most common 3-mode sequence
        transitions = []
        for i in range(len(sequence) - 2):
            triple = f"{sequence[i]} → {sequence[i+1]} → {sequence[i+2]}"
            transitions.append(triple)

        if transitions:
            most_common = Counter(transitions).most_common(1)[0]
            return most_common[0]

        # Fallback to first 3 modes
        return f"{sequence[0]} → {sequence[1]} → {sequence[2]}"

    def calculate_modal_score(self, text):
        """Returns normalized modal scores (0-1 range)"""
        scores = self.analyze_text(text)
        total = sum(scores.values())
        if total == 0:
            return scores
        return {mode: score/total for mode, score in scores.items()}


def search_google_news(query, max_results=10):
    """
    Search Google News and scrape results
    """
    articles = []

    try:
        # URL encode the query
        encoded_query = urllib.parse.quote(query)
        url = f"https://news.google.com/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        print(f"[WebSearch] Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all article elements in Google News
        article_elements = soup.find_all('article')

        for idx, article in enumerate(article_elements[:max_results]):
            try:
                # Find the first link with substantial text (the title)
                links = article.find_all('a')
                title = None
                link = None

                for a in links:
                    text = a.get_text(strip=True)
                    if text and len(text) > 10:  # Title should be substantial
                        title = text
                        link = a.get('href', '')
                        break

                if not title or not link:
                    continue

                # Convert relative URL to absolute
                if link.startswith('./'):
                    link = 'https://news.google.com' + link[1:]

                # Extract source (try to find it after the title link)
                source = 'Google News'
                all_text = article.get_text()
                # Look for common news sources
                for possible_source in ['CNN', 'BBC', 'Reuters', 'AP', 'Bloomberg', 'WSJ', 'NYT']:
                    if possible_source in all_text:
                        source = possible_source
                        break

                # Extract time
                time_elem = article.find('time')
                published_at = datetime.now().isoformat()
                if time_elem and time_elem.get('datetime'):
                    published_at = time_elem.get('datetime')

                # Generate unique ID from URL
                article_id = 'web_' + hashlib.md5(link.encode()).hexdigest()[:12]

                # Analyze modal signature
                analyzer = ModalAnalyzer()
                modal_scores = analyzer.analyze_text(title)
                dominant_mode = analyzer.get_dominant_mode(title)

                article_obj = {
                    'id': article_id,
                    'title': title,
                    'summary': f'News article about {query}',
                    'content': title,  # Google News doesn't provide content in search results
                    'url': link,
                    'source': source,
                    'topic': 'general',
                    'publishedAt': published_at,
                    'readTime': 3,
                    'image': f'https://via.placeholder.com/600x250/6366f1/ffffff?text=News'
                }

                # Add modal signature if detected
                if dominant_mode:
                    article_obj['modal_signature'] = {
                        'dominant': dominant_mode,
                        'post_dominant': dominant_mode,
                        'pathway': dominant_mode,
                        'complexity': len([s for s in modal_scores.values() if s > 0]),
                        'sequence': [dominant_mode],
                        'distribution': {dominant_mode: modal_scores.get(dominant_mode, 0)}
                    }

                articles.append(article_obj)

                print(f"  ✓ Found: {title[:60]}... [{dominant_mode or 'N/A'}]")

            except Exception as e:
                print(f"  ✗ Error parsing article: {e}")
                continue

        print(f"[WebSearch] Found {len(articles)} articles")

    except Exception as e:
        print(f"[ERROR] Failed to search Google News: {e}")

    return articles

@app.route('/api/search', methods=['POST'])
def search_news():
    """
    Search the web for news articles

    Request body:
    {
        "query": "search query string",
        "max_results": 10
    }
    """
    try:
        data = request.json
        query = data.get('query', '')
        max_results = data.get('max_results', 10)

        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400

        print(f"[WebSearch] Searching for: {query}")

        # Perform actual web search
        articles = search_google_news(query, max_results)

        results = {
            'query': query,
            'articles': articles,
            'total_results': len(articles)
        }

        return jsonify(results)

    except Exception as e:
        print(f"[ERROR] Search failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/explore', methods=['POST'])
def explore_topic():
    """
    Explore a topic and find related articles

    Request body:
    {
        "title": "article title",
        "content": "article content",
        "search_terms": ["term1", "term2"]
    }
    """
    try:
        data = request.json
        title = data.get('title', '')
        search_terms = data.get('search_terms', [])

        # Build search query from title and search terms
        query = f"{title} {' '.join(search_terms[:3])}"

        print(f"[WebSearch] Exploring topic: {query}")

        # Perform actual web search
        articles = search_google_news(query, max_results=20)

        results = {
            'query': query,
            'articles': articles,
            'total_results': len(articles)
        }

        return jsonify(results)

    except Exception as e:
        print(f"[ERROR] Explore failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/search/reddit', methods=['POST'])
def search_reddit():
    """
    Search Reddit with modal filtering

    Request JSON:
    {
        "query": "climate change",
        "modal_filter": "REF",  # optional: NET, REF, POL, MOR, LAW
        "sort_by": "relevance",  # hot, new, top, relevance
        "limit": 20
    }
    """
    data = request.json
    query = data.get('query', '')
    modal_filter = data.get('modal_filter', None)
    sort_by = data.get('sort_by', 'relevance')
    limit = data.get('limit', 20)

    if not query:
        return jsonify({'error': 'Query required'}), 400

    try:
        # Initialize Reddit API
        reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT', 'NewsMode v1.0')
        )

        # Search news-related subreddits
        subreddit_list = 'news+worldnews+politics+science+technology+business'
        subreddits = reddit.subreddit(subreddit_list)

        # Map sort_by to Reddit API parameters
        sort_map = {
            'hot': 'hot',
            'new': 'new',
            'top': 'top',
            'relevance': 'relevance'
        }
        reddit_sort = sort_map.get(sort_by, 'relevance')

        results = []
        analyzer = ModalAnalyzer()

        # Search Reddit
        search_results = subreddits.search(query, sort=reddit_sort, limit=limit*3)

        for post in search_results:
            try:
                # Get top comments
                post.comments.replace_more(limit=0)
                comments = [
                    {
                        'body': comment.body,
                        'created': comment.created_utc
                    }
                    for comment in post.comments[:20]
                ]

                # Analyze modal signature
                modal_data = analyzer.analyze_thread(
                    {
                        'title': post.title,
                        'body': post.selftext
                    },
                    comments
                )

                # Apply modal filter
                if modal_filter and modal_data['dominant_mode'] != modal_filter:
                    continue

                # Build article object matching NewsMode format
                article = {
                    'id': f'reddit_{post.id}',
                    'title': post.title,
                    'url': f"https://reddit.com{post.permalink}",
                    'source': f"r/{post.subreddit.display_name}",
                    'publishedAt': datetime.fromtimestamp(post.created_utc).isoformat(),
                    'summary': post.selftext[:200] if post.selftext else f"Discussion with {post.num_comments} comments",
                    'content': post.selftext or post.title,
                    'topic': 'Discussion',
                    'readTime': max(3, len(post.selftext.split()) // 200) if post.selftext else 3,
                    'image': None,

                    # Reddit-specific metadata
                    'reddit_score': post.score,
                    'reddit_comments': post.num_comments,

                    # Modal signature
                    'modal_signature': {
                        'dominant': modal_data['dominant_mode'],
                        'post_dominant': modal_data['post_dominant'],
                        'pathway': modal_data['pathway'],
                        'complexity': modal_data['complexity'],
                        'sequence': modal_data['sequence'],
                        'distribution': modal_data['mode_distribution']
                    }
                }

                results.append(article)

                # Stop when we have enough results
                if len(results) >= limit:
                    break

            except Exception as e:
                print(f"Error processing post {post.id}: {e}")
                continue

        return jsonify({
            'results': results,
            'count': len(results),
            'query': query,
            'modal_filter': modal_filter
        })

    except Exception as e:
        print(f"Reddit search error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze/modal', methods=['POST'])
def analyze_modal():
    """
    Analyze modal signature of article text

    Request JSON:
    {
        "text": "article content...",
        "title": "article title"
    }
    """
    data = request.json
    text = data.get('text', '')
    title = data.get('title', '')

    if not text and not title:
        return jsonify({'error': 'Text or title required'}), 400

    analyzer = ModalAnalyzer()
    full_text = f"{title} {text}"

    scores = analyzer.analyze_text(full_text)
    dominant = analyzer.get_dominant_mode(full_text)
    normalized_scores = analyzer.calculate_modal_score(full_text)

    return jsonify({
        'dominant_mode': dominant,
        'raw_scores': scores,
        'normalized_scores': normalized_scores,
        'complexity': len([s for s in scores.values() if s > 0])
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'NewsMode Modal Search API is running',
        'features': ['web_search', 'explore_topics', 'reddit_search', 'modal_analysis']
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"""
╔═══════════════════════════════════════════════════════════╗
║          NewsMode Modal Search Backend API                ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: {port}                                             ║
║  Endpoints:                                                ║
║    - POST /api/search          (Google News search)       ║
║    - POST /api/search/reddit   (Reddit modal search)      ║
║    - POST /api/explore         (Explore related)          ║
║    - POST /api/analyze/modal   (Modal analysis)           ║
║    - GET  /api/health          (Health check)             ║
║                                                            ║
║  Modal Modes: NET, REF, POL, MOR, LAW                     ║
║  Update app.js API_BASE_URL to: http://localhost:{port}   ║
╚═══════════════════════════════════════════════════════════╝
    """)

    app.run(host='0.0.0.0', port=port, debug=True)
