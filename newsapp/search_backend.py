#!/usr/bin/env python3
"""
NewsBadger Web Search Backend API
Uses Claude's WebSearch tool to power the app's search functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# This would be replaced with actual WebSearch tool usage in production
# For now, this is a template that shows the structure

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

        # NOTE: In production with Claude Code, you would use:
        # web_search_results = WebSearch(query=query)

        # For demonstration, here's the structure of what would be returned:
        # This should be replaced with actual WebSearch tool call

        print(f"[WebSearch] Searching for: {query}")

        # Placeholder response structure
        # In actual implementation, this would come from WebSearch tool
        results = {
            'query': query,
            'articles': [
                {
                    'id': f'web_{i}',
                    'title': f'Search result {i} for {query}',
                    'summary': f'This is a summary of article {i} about {query}',
                    'content': f'Full content for article {i}...',
                    'url': f'https://example.com/article-{i}',
                    'source': 'Web Search',
                    'topic': 'general',
                    'publishedAt': datetime.now().isoformat(),
                    'readTime': 5,
                    'image': f'https://via.placeholder.com/600x250/6366f1/ffffff?text=Article+{i}'
                }
                for i in range(1, min(max_results + 1, 11))
            ],
            'total_results': min(max_results, 10)
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

        # NOTE: In production, use WebSearch tool here
        # web_results = WebSearch(query=query)

        # Placeholder response
        results = {
            'query': query,
            'articles': [],  # Would be populated by WebSearch
            'total_results': 0
        }

        return jsonify(results)

    except Exception as e:
        print(f"[ERROR] Explore failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'NewsBadger WebSearch API is running',
        'features': ['web_search', 'explore_topics']
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"""
╔═══════════════════════════════════════════════════════════╗
║          NewsBadger WebSearch Backend API                 ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: {port}                                             ║
║  Endpoints:                                                ║
║    - POST /api/search     (Search web for news)           ║
║    - POST /api/explore    (Explore related articles)      ║
║    - GET  /api/health     (Health check)                  ║
║                                                            ║
║  Update app.js API_BASE_URL to:                           ║
║    http://localhost:{port}                                ║
╚═══════════════════════════════════════════════════════════╝
    """)

    app.run(host='0.0.0.0', port=port, debug=True)
