// Blog functionality
let blogPosts = [];
let currentFilter = 'all';

// Load blog posts from JSON file
async function loadBlogPosts() {
    try {
        const response = await fetch('blog-posts.json');
        blogPosts = await response.json();
        // Sort posts by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayBlogPosts();
        updateIndexPageBlog();
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.getElementById('blogGrid')?.insertAdjacentHTML('beforeend',
            '<p style="text-align: center; color: var(--text-light);">Error loading blog posts. Please try again later.</p>'
        );
    }
}

// Display blog posts on blog.html
function displayBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const noPosts = document.getElementById('noPosts');

    if (!blogGrid) return;

    // Filter posts
    let filteredPosts = blogPosts;
    if (currentFilter !== 'all') {
        filteredPosts = blogPosts.filter(post =>
            post.tags?.some(tag =>
                tag.toLowerCase() === currentFilter.toLowerCase()
            )
        );
    }

    // Clear existing posts
    blogGrid.innerHTML = '';

    if (filteredPosts.length === 0) {
        if (noPosts) noPosts.style.display = 'block';
        return;
    }

    if (noPosts) noPosts.style.display = 'none';

    // Display filtered posts
    filteredPosts.forEach(post => {
        const postCard = createBlogCard(post);
        blogGrid.appendChild(postCard);
    });
}

// Create a blog card element
function createBlogCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';

    const formattedDate = formatDate(post.date);

    card.innerHTML = `
        <div class="blog-date">
            <i class="far fa-calendar"></i>
            <span>${formattedDate}</span>
        </div>
        <h3>${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <div class="blog-footer">
            <a href="blog-post.html?id=${post.id}" class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></a>
            <div class="blog-share">
                <span>Share:</span>
                <a href="#" class="share-btn linkedin" data-platform="linkedin" data-post-id="${post.id}" aria-label="Share on LinkedIn">
                    <i class="fab fa-linkedin"></i>
                </a>
                <a href="#" class="share-btn medium" data-platform="medium" data-post-id="${post.id}" aria-label="Share on Medium">
                    <i class="fab fa-medium"></i>
                </a>
                <a href="#" class="share-btn instagram" data-platform="instagram" data-post-id="${post.id}" aria-label="Share on Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
            </div>
        </div>
    `;

    // Add click handler to navigate to post
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on share buttons or read more link
        if (!e.target.closest('.blog-share') && !e.target.closest('.blog-read-more')) {
            globalThis.location.href = `blog-post.html?id=${post.id}`;
        }
    });

    return card;
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Load content from external file or use inline content
async function loadPostContent(post) {
    // If contentFile is specified, load from external file
    if (post.contentFile) {
        try {
            const response = await fetch(post.contentFile);
            if (!response.ok) {
                throw new Error(`Failed to load content file: ${post.contentFile}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading post content:', error);
            return `<p>Error loading post content. Please try again later.</p><p><a href="blog.html">Return to blog</a></p>`;
        }
    }
    // Otherwise, use inline content (backward compatibility)
    return post.content || '<p>No content available.</p>';
}

// Load and display individual blog post
async function loadBlogPost() {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        // Redirect to blog page if no ID
        globalThis.location.href = 'blog.html';
        return;
    }

    // Find the post
    const post = blogPosts.find(p => p.id === postId);

    if (!post) {
        document.querySelector('.blog-post-content').innerHTML =
            '<p>Post not found. <a href="blog.html">Return to blog</a></p>';
        return;
    }

    // Update page title
    document.getElementById('postTitle').textContent = `${post.title} - Aqila Farahmand`;
    document.getElementById('postTitleH1').textContent = post.title;
    document.getElementById('postDate').textContent = formatDate(post.date);
    document.getElementById('postAuthor').textContent = post.author || 'Aqila Farahmand';

    // Display tags
    const tagsContainer = document.getElementById('postTags');
    if (post.tags && post.tags.length > 0) {
        tagsContainer.innerHTML = post.tags.map(tag =>
            `<span class="post-tag">${tag}</span>`
        ).join('');
    }

    // Load and display content (from file or inline)
    const content = await loadPostContent(post);
    document.getElementById('postContent').innerHTML = content;

    // Update share buttons
    setupShareButtons(post);
}

// Setup share buttons for individual post
function setupShareButtons(post) {
    const shareButtons = document.querySelectorAll('.share-btn');
    const postUrl = globalThis.location.href;

    shareButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const platform = this.dataset.platform;
            sharePost(post, platform, postUrl);
        });
    });
}

// Share post functionality
function sharePost(post, platform, url) {
    const title = post.title;
    let shareLink = '';

    switch (platform) {
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'medium':
            shareLink = `https://medium.com/m/global-identity?redirectUrl=${encodeURIComponent(url)}`;
            break;
        case 'instagram': {
            const instagramText = `${title}\n\n${url}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(instagramText).then(() => {
                    alert('Blog post title and URL copied to clipboard! You can now paste it in your Instagram post.');
                });
            } else {
                prompt('Copy this to share on Instagram:', instagramText);
            }
            return;
        }
        default:
            break;
    }

    if (shareLink) {
        globalThis.open(shareLink, '_blank', 'width=600,height=400');
    }
}

// Update blog section on index.html
function updateIndexPageBlog() {
    // Only update if we're on index.html
    if (!globalThis.location.pathname.includes('index.html') && globalThis.location.pathname !== '/' && !globalThis.location.pathname.endsWith('/')) {
        return;
    }

    const blogGrid = document.querySelector('#blog .blog-grid');
    if (!blogGrid) return;

    // Clear existing placeholder posts
    blogGrid.innerHTML = '';

    // Display latest 2 posts
    const latestPosts = blogPosts.slice(0, 2);
    latestPosts.forEach(post => {
        const postCard = createBlogCard(post);
        blogGrid.appendChild(postCard);
    });

    // Setup share buttons for index page
    setupIndexPageShareButtons();
}

// Setup share buttons on index page
function setupIndexPageShareButtons() {
    const shareButtons = document.querySelectorAll('#blog .share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const postId = this.dataset.postId;
            const post = blogPosts.find(p => p.id === postId);
            if (post) {
                const postUrl = `${globalThis.location.origin}${globalThis.location.pathname.replace('index.html', '')}blog-post.html?id=${postId}`;
                sharePost(post, this.dataset.platform, postUrl);
            }
        });
    });
}

// Filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update current filter
            currentFilter = btn.dataset.filter;
            // Display filtered posts
            displayBlogPosts();
        });
    });
}

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load blog posts
    loadBlogPosts();

    // Setup filters if on blog page
    if (document.querySelector('.blog-filters')) {
        setupFilters();
    }

    // Load individual post if on blog-post.html
    if (globalThis.location.pathname.includes('blog-post.html')) {
        // Wait for posts to load
        setTimeout(() => {
            loadBlogPost();
        }, 100);
    }
});
