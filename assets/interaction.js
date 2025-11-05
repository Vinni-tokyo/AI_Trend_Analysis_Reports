/**
 * Trend Report Interaction Components
 * Handles comments, likes, and donations
 */

const API_BASE = 'http://192.168.9.184:3389/api';

// Get report ID from filename
function getReportId() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

// Format timestamp
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Initialize Like Button
function initLikeButton() {
    const reportId = getReportId();
    const likeBtn = document.getElementById('like-btn');
    const likeCount = document.getElementById('like-count');

    if (!likeBtn) return;

    // Check if user already liked (localStorage)
    const likedKey = `liked_${reportId}`;
    const hasLiked = localStorage.getItem(likedKey) === 'true';

    if (hasLiked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '❤️';
    }

    // Load like count
    fetch(`${API_BASE}/likes/${reportId}`)
        .then(res => res.json())
        .then(data => {
            likeCount.textContent = data.count || 0;
        })
        .catch(err => console.error('Failed to load likes:', err));

    // Handle like click
    likeBtn.addEventListener('click', () => {
        if (hasLiked) return; // Already liked

        fetch(`${API_BASE}/likes/${reportId}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                likeCount.textContent = data.count;
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '❤️';
                localStorage.setItem(likedKey, 'true');
            })
            .catch(err => {
                alert('Failed to add like. Please try again.');
                console.error(err);
            });
    });
}

// Initialize Comments
function initComments() {
    const reportId = getReportId();
    loadComments(reportId);

    const submitBtn = document.getElementById('comment-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => submitComment(reportId));
    }
}

// Load comments
function loadComments(reportId) {
    fetch(`${API_BASE}/comments/${reportId}`)
        .then(res => res.json())
        .then(comments => {
            renderComments(comments);
        })
        .catch(err => {
            console.error('Failed to load comments:', err);
            document.getElementById('comments-list').innerHTML =
                '<p style="color: #999; text-align: center; padding: 2rem;">Comments unavailable. Start the backend server.</p>';
        });
}

// Render comments
function renderComments(comments) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    if (comments.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No comments yet. Be the first!</p>';
        return;
    }

    list.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.author)}</span>
                <span class="comment-hash" title="User: ${comment.user_hash}">#${comment.user_hash}</span>
                <span class="comment-time">${formatTime(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
        </div>
    `).join('');
}

// Submit comment
function submitComment(reportId) {
    const contentInput = document.getElementById('comment-content');
    const authorInput = document.getElementById('comment-author');
    const submitBtn = document.getElementById('comment-submit');

    const content = contentInput.value.trim();
    const author = authorInput.value.trim() || 'Anonymous';

    if (!content) {
        alert('Please enter a comment.');
        return;
    }

    if (content.length > 1000) {
        alert('Comment is too long (max 1000 characters).');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    fetch(`${API_BASE}/comments/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to post comment');
        return res.json();
    })
    .then(() => {
        contentInput.value = '';
        authorInput.value = '';
        loadComments(reportId);
        submitBtn.textContent = 'Post Comment';
        submitBtn.disabled = false;
    })
    .catch(err => {
        alert('Failed to post comment. Is the backend server running?');
        console.error(err);
        submitBtn.textContent = 'Post Comment';
        submitBtn.disabled = false;
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initLikeButton();
    initComments();
});
