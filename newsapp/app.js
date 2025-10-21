// ===== STATE MANAGEMENT =====
const AppState = {
    currentScreen: 'loading',
    currentTab: 'feed',
    userPreferences: {
        interests: [],
        likedArticles: [],
        dislikedArticles: [],
        savedArticles: [],
        readArticles: [],
        topicScores: {},
        apiKey: '',
        autoSummarize: true,
        personalization: true,
        darkMode: false
    },
    articles: [],
    currentCardIndex: 0,
    stats: {
        articlesRead: 0,
        streak: 0,
        lastReadDate: null
    }
};

// ===== SAMPLE NEWS DATA =====
// In production, this would come from a news API
const SAMPLE_ARTICLES = [
    {
        id: 1,
        title: "AI Breakthrough: New Language Model Achieves Human-Level Reasoning",
        source: "TechNews",
        topic: "ai",
        summary: "Researchers have developed a new AI model that demonstrates unprecedented reasoning capabilities, potentially marking a significant milestone in artificial intelligence development.",
        content: "In a groundbreaking development, researchers at leading AI labs have unveiled a new language model that demonstrates human-level reasoning across various domains...",
        image: "https://via.placeholder.com/600x250/6366f1/ffffff?text=AI+Breakthrough",
        readTime: 5,
        publishedAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Climate Scientists Discover Unexpected Ocean Current Changes",
        source: "Science Daily",
        topic: "climate",
        summary: "New research reveals significant shifts in ocean currents that could impact global weather patterns and marine ecosystems in unprecedented ways.",
        content: "A team of climate scientists has documented unexpected changes in major ocean currents...",
        image: "https://via.placeholder.com/600x250/10b981/ffffff?text=Climate+Science",
        readTime: 7,
        publishedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        title: "Major Tech Companies Announce New Privacy Standards",
        source: "Tech Weekly",
        topic: "technology",
        summary: "Leading technology firms have agreed to implement stricter privacy protections and data handling practices in response to growing consumer concerns.",
        content: "In a coordinated announcement, several major technology companies revealed new privacy initiatives...",
        image: "https://via.placeholder.com/600x250/ec4899/ffffff?text=Privacy+Standards",
        readTime: 4,
        publishedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 4,
        title: "Breakthrough in Quantum Computing Brings Practical Applications Closer",
        source: "Science Today",
        topic: "science",
        summary: "Scientists have achieved a major milestone in quantum error correction, bringing practical quantum computers closer to reality.",
        content: "Researchers have made significant progress in solving one of quantum computing's biggest challenges...",
        image: "https://via.placeholder.com/600x250/f59e0b/ffffff?text=Quantum+Computing",
        readTime: 6,
        publishedAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 5,
        title: "Global Markets React to New Economic Policy Announcements",
        source: "Financial Times",
        topic: "business",
        summary: "Stock markets worldwide experienced significant movements following announcements of new economic policies by major central banks.",
        content: "Global financial markets showed strong reactions to coordinated policy announcements...",
        image: "https://via.placeholder.com/600x250/6366f1/ffffff?text=Global+Markets",
        readTime: 5,
        publishedAt: new Date(Date.now() - 345600000).toISOString()
    },
    {
        id: 6,
        title: "Revolutionary Battery Technology Promises 10x Faster Charging",
        source: "Innovation Daily",
        topic: "technology",
        summary: "Engineers have developed a new battery technology that could enable electric vehicles to charge in minutes rather than hours.",
        content: "A team of engineers has created a revolutionary battery design that significantly improves charging speed...",
        image: "https://via.placeholder.com/600x250/10b981/ffffff?text=Battery+Tech",
        readTime: 5,
        publishedAt: new Date(Date.now() - 432000000).toISOString()
    },
    {
        id: 7,
        title: "New Study Reveals Benefits of Mediterranean Diet on Brain Health",
        source: "Health Journal",
        topic: "health",
        summary: "Long-term research shows that Mediterranean diet patterns are associated with better cognitive function and reduced risk of dementia.",
        content: "A comprehensive study tracking thousands of participants over decades has confirmed...",
        image: "https://via.placeholder.com/600x250/ec4899/ffffff?text=Health+Study",
        readTime: 4,
        publishedAt: new Date(Date.now() - 518400000).toISOString()
    },
    {
        id: 8,
        title: "Space Agency Announces Plans for Lunar Base Construction",
        source: "Space News",
        topic: "science",
        summary: "International space agencies have unveiled detailed plans for establishing a permanent human presence on the Moon within the next decade.",
        content: "In a historic announcement, space agencies from multiple countries revealed comprehensive plans...",
        image: "https://via.placeholder.com/600x250/6366f1/ffffff?text=Lunar+Base",
        readTime: 6,
        publishedAt: new Date(Date.now() - 604800000).toISOString()
    },
    {
        id: 9,
        title: "AI Ethics Framework Proposed by Global Tech Leaders",
        source: "Tech Ethics",
        topic: "ai",
        summary: "Industry leaders and ethicists have collaborated to propose comprehensive guidelines for responsible AI development and deployment.",
        content: "A coalition of technology leaders, academics, and ethicists has released a detailed framework...",
        image: "https://via.placeholder.com/600x250/f59e0b/ffffff?text=AI+Ethics",
        readTime: 7,
        publishedAt: new Date(Date.now() - 691200000).toISOString()
    },
    {
        id: 10,
        title: "Renewable Energy Surpasses Fossil Fuels in Major Economy",
        source: "Energy Report",
        topic: "climate",
        summary: "For the first time, renewable energy sources have generated more electricity than fossil fuels in a major industrial nation.",
        content: "In a historic milestone for clean energy transition, renewable sources including solar and wind...",
        image: "https://via.placeholder.com/600x250/10b981/ffffff?text=Renewable+Energy",
        readTime: 5,
        publishedAt: new Date(Date.now() - 777600000).toISOString()
    }
];

// ===== CLAUDE API INTEGRATION =====
class ClaudeAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.anthropic.com/v1/messages';
    }

    async generateSummary(articleContent, title) {
        if (!this.apiKey) {
            // Fallback to simple summary
            return `This article discusses "${title}". ${articleContent.substring(0, 150)}...`;
        }

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 200,
                    messages: [{
                        role: 'user',
                        content: `Provide a concise 2-sentence summary of this article:\n\nTitle: ${title}\n\nContent: ${articleContent}`
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            return `This article discusses "${title}". ${articleContent.substring(0, 150)}...`;
        }
    }

    async categorizeContent(title, content) {
        if (!this.apiKey) {
            // Fallback to simple categorization
            return { topics: ['general'], sentiment: 'neutral' };
        }

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 100,
                    messages: [{
                        role: 'user',
                        content: `Analyze this article and return ONLY a JSON object with these fields:
{
  "topics": ["topic1", "topic2"],
  "sentiment": "positive/neutral/negative",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Title: ${title}
Content: ${content.substring(0, 500)}`
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const text = data.content[0].text;

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return { topics: ['general'], sentiment: 'neutral', keywords: [] };
        } catch (error) {
            console.error('Claude API categorization error:', error);
            return { topics: ['general'], sentiment: 'neutral', keywords: [] };
        }
    }

    async analyzePreferences(likedArticles, dislikedArticles) {
        if (!this.apiKey || likedArticles.length === 0) {
            return { suggestedTopics: [], insights: 'Not enough data yet.' };
        }

        try {
            const likedSummary = likedArticles.map(a => `${a.topic}: ${a.title}`).join('\n');
            const dislikedSummary = dislikedArticles.map(a => `${a.topic}: ${a.title}`).join('\n');

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 150,
                    messages: [{
                        role: 'user',
                        content: `Based on these reading patterns, identify the user's interests and suggest topics they might enjoy:

Liked articles:
${likedSummary}

Disliked articles:
${dislikedSummary}

Return a JSON object with:
{
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "insights": "brief insight about user preferences"
}`
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const text = data.content[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return { suggestedTopics: [], insights: 'Keep reading to build your profile!' };
        } catch (error) {
            console.error('Claude API preference analysis error:', error);
            return { suggestedTopics: [], insights: 'Keep reading to build your profile!' };
        }
    }
}

// ===== LOCAL STORAGE =====
class Storage {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Storage save error:', error);
        }
    }

    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }
}

// ===== PERSONALIZATION ENGINE =====
class PersonalizationEngine {
    static calculateArticleScore(article, userPreferences) {
        if (!userPreferences.personalization) {
            return Math.random(); // Random order if personalization disabled
        }

        let score = 0;

        // Topic interest score
        const topicScore = userPreferences.topicScores[article.topic] || 0;
        score += topicScore * 10;

        // Selected interests boost
        if (userPreferences.interests.includes(article.topic)) {
            score += 5;
        }

        // Recency score
        const daysOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 5 - daysOld); // Prefer recent articles

        // Avoid already read articles
        if (userPreferences.readArticles.includes(article.id)) {
            score -= 20;
        }

        // Randomness factor (prevent echo chamber)
        score += Math.random() * 2;

        return score;
    }

    static rankArticles(articles, userPreferences) {
        return articles
            .map(article => ({
                article,
                score: this.calculateArticleScore(article, userPreferences)
            }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.article);
    }

    static updateTopicScores(userPreferences, article, liked) {
        const topic = article.topic;
        const currentScore = userPreferences.topicScores[topic] || 0;

        // Increase score for liked, decrease for disliked
        const delta = liked ? 0.1 : -0.05;
        userPreferences.topicScores[topic] = Math.max(-1, Math.min(1, currentScore + delta));

        return userPreferences;
    }
}

// ===== CARD SWIPE FUNCTIONALITY =====
class CardSwiper {
    constructor(cardElement, onSwipe) {
        this.card = cardElement;
        this.onSwipe = onSwipe;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;

        this.bindEvents();
    }

    bindEvents() {
        this.card.addEventListener('mousedown', this.handleStart.bind(this));
        this.card.addEventListener('touchstart', this.handleStart.bind(this));

        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('touchmove', this.handleMove.bind(this));

        document.addEventListener('mouseup', this.handleEnd.bind(this));
        document.addEventListener('touchend', this.handleEnd.bind(this));
    }

    handleStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.card.classList.add('swiping');

        const point = e.type.includes('mouse') ? e : e.touches[0];
        this.startX = point.clientX;
        this.startY = point.clientY;
    }

    handleMove(e) {
        if (!this.isDragging) return;

        const point = e.type.includes('mouse') ? e : e.touches[0];
        this.currentX = point.clientX - this.startX;
        this.currentY = point.clientY - this.startY;

        const rotate = this.currentX / 10;

        this.card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg)`;
        this.card.style.opacity = 1 - Math.abs(this.currentX) / 300;
    }

    handleEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.card.classList.remove('swiping');

        const swipeThreshold = 100;

        if (Math.abs(this.currentX) > swipeThreshold) {
            const direction = this.currentX > 0 ? 'right' : 'left';
            this.completeSwipe(direction);
        } else {
            // Reset card position
            this.card.style.transform = '';
            this.card.style.opacity = '';
        }
    }

    completeSwipe(direction) {
        this.card.classList.add('removing', `swipe-${direction}`);

        setTimeout(() => {
            this.onSwipe(direction);
        }, 500);
    }

    swipeProgrammatically(direction) {
        this.card.classList.add('removing', `swipe-${direction}`);

        setTimeout(() => {
            this.onSwipe(direction);
        }, 500);
    }
}

// ===== UI CONTROLLER =====
class UIController {
    static showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        AppState.currentScreen = screenId;
    }

    static switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${tabName}-view`).classList.add('active');

        AppState.currentTab = tabName;

        // Load view-specific content
        if (tabName === 'explore') {
            this.renderExploreView();
        } else if (tabName === 'insights') {
            this.renderInsightsView();
        }
    }

    static createNewsCard(article) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.dataset.articleId = article.id;

        // Use enhanced summary if available
        const summary = article.aiSummary || article.summary;

        card.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="card-image" onerror="this.src='https://via.placeholder.com/600x250/6366f1/ffffff?text=News'">
            <div class="card-content">
                <div class="card-meta">
                    <span class="source-badge">${article.source}</span>
                    <span class="topic-tag">${article.topic}</span>
                    <span class="topic-tag">${article.readTime} min read</span>
                </div>
                <h2 class="card-title">${article.title}</h2>
                ${article.aiSummary ? '<div class="ai-badge">✨ AI Summary</div>' : ''}
                <p class="card-summary">${summary}</p>
                <a class="read-more-btn" data-article-id="${article.id}">Read full article →</a>
            </div>
        `;

        // Add click handler for read more
        card.querySelector('.read-more-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showArticleDetail(article);
        });

        return card;
    }

    static async renderFeed() {
        const cardStack = document.getElementById('card-stack');
        cardStack.innerHTML = '';

        // Get personalized articles
        const rankedArticles = PersonalizationEngine.rankArticles(
            AppState.articles,
            AppState.userPreferences
        );

        // Show only unread articles
        const unreadArticles = rankedArticles.filter(
            article => !AppState.userPreferences.readArticles.includes(article.id)
        );

        if (unreadArticles.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }

        document.getElementById('empty-state').style.display = 'none';

        // Render top 3 cards
        const cardsToShow = unreadArticles.slice(0, 3);

        for (let i = cardsToShow.length - 1; i >= 0; i--) {
            const article = cardsToShow[i];

            // Auto-summarize with Claude if enabled
            if (AppState.userPreferences.autoSummarize && AppState.userPreferences.apiKey && !article.aiSummary) {
                const claude = new ClaudeAPI(AppState.userPreferences.apiKey);
                article.aiSummary = await claude.generateSummary(article.content, article.title);
            }

            const card = this.createNewsCard(article);
            cardStack.appendChild(card);

            // Add swipe functionality to top card
            if (i === 0) {
                new CardSwiper(card, (direction) => {
                    this.handleCardSwipe(article, direction);
                });
            }
        }
    }

    static handleCardSwipe(article, direction) {
        const liked = direction === 'right';
        const saved = direction === 'up';

        if (liked) {
            AppState.userPreferences.likedArticles.push(article);
            PersonalizationEngine.updateTopicScores(AppState.userPreferences, article, true);
        } else if (direction === 'left') {
            AppState.userPreferences.dislikedArticles.push(article);
            PersonalizationEngine.updateTopicScores(AppState.userPreferences, article, false);
        }

        if (saved) {
            AppState.userPreferences.savedArticles.push(article);
        }

        AppState.userPreferences.readArticles.push(article.id);
        AppState.stats.articlesRead++;

        // Save to storage
        Storage.save('userPreferences', AppState.userPreferences);
        Storage.save('stats', AppState.stats);

        // Render next card
        setTimeout(() => {
            this.renderFeed();
        }, 100);
    }

    static showArticleDetail(article) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('article-content');

        content.innerHTML = `
            <img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <div style="padding: 0 0.5rem;">
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <span class="source-badge">${article.source}</span>
                    <span class="topic-tag">${article.topic}</span>
                    <span class="topic-tag">${article.readTime} min read</span>
                </div>
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">${article.title}</h1>
                ${article.aiSummary ? `<div class="ai-badge" style="margin-bottom: 1rem;">✨ AI-generated summary: ${article.aiSummary}</div>` : ''}
                <p style="line-height: 1.8; color: var(--text-secondary);">${article.content}</p>
            </div>
        `;

        modal.classList.add('active');

        // Mark as read
        if (!AppState.userPreferences.readArticles.includes(article.id)) {
            AppState.userPreferences.readArticles.push(article.id);
            AppState.stats.articlesRead++;
            Storage.save('userPreferences', AppState.userPreferences);
            Storage.save('stats', AppState.stats);
        }
    }

    static renderExploreView() {
        const topicGrid = document.getElementById('topic-grid');
        const topics = [
            { name: 'Technology', icon: '💻', topic: 'technology' },
            { name: 'Science', icon: '🔬', topic: 'science' },
            { name: 'AI', icon: '🤖', topic: 'ai' },
            { name: 'Climate', icon: '🌍', topic: 'climate' },
            { name: 'Business', icon: '📈', topic: 'business' },
            { name: 'Health', icon: '⚕️', topic: 'health' },
            { name: 'Politics', icon: '🏛️', topic: 'politics' },
            { name: 'Sports', icon: '⚽', topic: 'sports' }
        ];

        topicGrid.innerHTML = topics.map(t => {
            const count = AppState.articles.filter(a => a.topic === t.topic).length;
            return `
                <div class="topic-card" data-topic="${t.topic}">
                    <div class="topic-icon">${t.icon}</div>
                    <div class="topic-name">${t.name}</div>
                    <div class="topic-count">${count} articles</div>
                </div>
            `;
        }).join('');

        // Render trending
        const trendingList = document.getElementById('trending-list');
        const trending = AppState.articles.slice(0, 5);

        trendingList.innerHTML = trending.map((article, index) => `
            <div class="trending-item" data-article-id="${article.id}">
                <div class="trending-number">${index + 1}</div>
                <div class="trending-info">
                    <h4>${article.title}</h4>
                    <p>${article.source} · ${article.topic}</p>
                </div>
            </div>
        `).join('');

        // Add click handlers
        trendingList.querySelectorAll('.trending-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleId = parseInt(item.dataset.articleId);
                const article = AppState.articles.find(a => a.id === articleId);
                if (article) {
                    this.showArticleDetail(article);
                }
            });
        });
    }

    static renderInsightsView() {
        // Articles read
        document.getElementById('articles-read').textContent = AppState.stats.articlesRead;

        // Top interests
        const interestBars = document.getElementById('interest-bars');
        const scores = AppState.userPreferences.topicScores;
        const sortedTopics = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedTopics.length === 0) {
            interestBars.innerHTML = '<p style="color: var(--text-secondary);">Read more articles to see your interests!</p>';
        } else {
            interestBars.innerHTML = sortedTopics.map(([topic, score]) => {
                const normalizedScore = ((score + 1) / 2) * 100; // Convert -1 to 1 range to 0-100
                return `
                    <div class="interest-bar">
                        <div class="interest-bar-label">${topic}</div>
                        <div class="interest-bar-fill">
                            <div class="interest-bar-value" style="width: ${normalizedScore}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Streak
        document.getElementById('streak-value').textContent = `${AppState.stats.streak} days`;
    }
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
    // Interest chips selection
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
        const selectedChips = document.querySelectorAll('.chip.selected');
        AppState.userPreferences.interests = Array.from(selectedChips).map(
            chip => chip.dataset.topic
        );

        // Initialize topic scores
        AppState.userPreferences.interests.forEach(topic => {
            AppState.userPreferences.topicScores[topic] = 0.3; // Initial boost
        });

        Storage.save('userPreferences', AppState.userPreferences);
        Storage.save('hasOnboarded', true);

        UIController.showScreen('app-screen');
        UIController.renderFeed();
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            UIController.switchTab(btn.dataset.tab);
        });
    });

    // Action buttons
    document.getElementById('like-btn').addEventListener('click', () => {
        const topCard = document.querySelector('.news-card');
        if (topCard) {
            const swiper = new CardSwiper(topCard, () => {});
            swiper.swipeProgrammatically('right');
        }
    });

    document.getElementById('skip-btn').addEventListener('click', () => {
        const topCard = document.querySelector('.news-card');
        if (topCard) {
            const swiper = new CardSwiper(topCard, () => {});
            swiper.swipeProgrammatically('left');
        }
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        const topCard = document.querySelector('.news-card');
        if (topCard) {
            const articleId = parseInt(topCard.dataset.articleId);
            const article = AppState.articles.find(a => a.id === articleId);
            if (article && !AppState.userPreferences.savedArticles.includes(article)) {
                AppState.userPreferences.savedArticles.push(article);
                Storage.save('userPreferences', AppState.userPreferences);
                alert('Article saved!');
            }
        }
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('active');
        document.getElementById('api-key-input').value = AppState.userPreferences.apiKey || '';
        document.getElementById('auto-summarize-toggle').checked = AppState.userPreferences.autoSummarize;
        document.getElementById('personalization-toggle').checked = AppState.userPreferences.personalization;
        document.getElementById('dark-mode-toggle').checked = AppState.userPreferences.darkMode;
    });

    document.getElementById('close-settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('active');
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        AppState.userPreferences.apiKey = document.getElementById('api-key-input').value;
        AppState.userPreferences.autoSummarize = document.getElementById('auto-summarize-toggle').checked;
        AppState.userPreferences.personalization = document.getElementById('personalization-toggle').checked;
        AppState.userPreferences.darkMode = document.getElementById('dark-mode-toggle').checked;

        if (AppState.userPreferences.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        Storage.save('userPreferences', AppState.userPreferences);
        document.getElementById('settings-modal').classList.remove('active');

        // Re-render feed with new settings
        UIController.renderFeed();
    });

    // Article modal close
    document.getElementById('close-article-btn').addEventListener('click', () => {
        document.getElementById('article-modal').classList.remove('active');
    });

    // Reset preferences
    document.getElementById('reset-preferences-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all preferences? This cannot be undone.')) {
            Storage.remove('userPreferences');
            Storage.remove('stats');
            Storage.remove('hasOnboarded');
            location.reload();
        }
    });

    // Reload feed
    document.getElementById('reload-feed-btn').addEventListener('click', () => {
        // Reset read articles for demo purposes
        AppState.userPreferences.readArticles = [];
        Storage.save('userPreferences', AppState.userPreferences);
        UIController.renderFeed();
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===== INITIALIZATION =====
async function initialize() {
    // Load saved data
    const savedPreferences = Storage.load('userPreferences');
    if (savedPreferences) {
        AppState.userPreferences = { ...AppState.userPreferences, ...savedPreferences };
    }

    const savedStats = Storage.load('stats');
    if (savedStats) {
        AppState.stats = { ...AppState.stats, ...savedStats };
    }

    const hasOnboarded = Storage.load('hasOnboarded', false);

    // Load articles (in production, fetch from API)
    AppState.articles = [...SAMPLE_ARTICLES];

    // Apply dark mode if enabled
    if (AppState.userPreferences.darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Setup event listeners
    setupEventListeners();

    // Simulate loading
    setTimeout(() => {
        if (hasOnboarded) {
            UIController.showScreen('app-screen');
            UIController.renderFeed();
        } else {
            UIController.showScreen('onboarding-screen');
        }
    }, 1500);
}

// Start the app
document.addEventListener('DOMContentLoaded', initialize);
