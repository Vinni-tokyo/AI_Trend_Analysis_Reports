#!/usr/bin/env python3
"""
Add comment, like, and donation components to HTML reports
"""

import sys
import os
from pathlib import Path

# HTML/CSS for interaction components
INTERACTION_STYLES = """
/* Interaction Components Styles */
.interaction-section{max-width:1000px;margin:1.5rem auto;padding:0 1.5rem}
.interaction-card{background:#fafafa;border:1px solid #e5e5e5;padding:1.5rem;margin-bottom:1rem}
.interaction-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #ddd}
.interaction-title{font-size:1.1rem;font-weight:600;color:#333}
.like-section{display:flex;align-items:center;gap:0.75rem}
.like-btn{background:#fff;color:#666;border:1px solid #ddd;padding:0.4rem 0.8rem;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;gap:0.3rem}
.like-btn:hover{background:#f5f5f5;border-color:#ccc}
.like-btn.liked{color:#e74c3c;border-color:#e74c3c}
.like-count{font-size:0.9rem;color:#666}
.comment-form{margin-bottom:1.5rem}
.comment-input-group{margin-bottom:0.75rem}
.comment-input-group label{display:block;margin-bottom:0.3rem;font-weight:500;color:#555;font-size:0.85rem}
.comment-input-group input,.comment-input-group textarea{width:100%;padding:0.5rem;border:1px solid #ddd;font-family:inherit;font-size:0.9rem}
.comment-input-group input:focus,.comment-input-group textarea:focus{outline:none;border-color:#999}
.comment-input-group textarea{min-height:80px;resize:vertical}
.comment-submit-btn{background:#333;color:white;border:none;padding:0.5rem 1.2rem;cursor:pointer;font-size:0.9rem}
.comment-submit-btn:hover{background:#555}
.comment-submit-btn:disabled{opacity:0.5;cursor:not-allowed}
.comments-list{margin-top:1.5rem}
.comment-item{background:#fff;border-left:2px solid #ddd;padding:0.75rem;margin-bottom:0.75rem}
.comment-header{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.3rem;padding-bottom:0;border:none}
.comment-author{font-weight:600;color:#333;font-size:0.85rem}
.comment-hash{font-size:0.7rem;color:#999;font-family:monospace}
.comment-time{font-size:0.7rem;color:#999;margin-left:auto}
.comment-content{color:#555;line-height:1.5;font-size:0.9rem}
@media(max-width:600px){.interaction-header{flex-direction:column;align-items:flex-start;gap:0.5rem}}
"""

INTERACTION_HTML = """
<!-- Interaction Components -->
<div class="interaction-section">
    <!-- Like Section -->
    <div class="interaction-card">
        <div class="interaction-header">
            <h2 class="interaction-title">💬 Comments & Reactions</h2>
            <div class="like-section">
                <button id="like-btn" class="like-btn">
                    <span>🤍</span> Like
                </button>
                <span class="like-count" id="like-count">0</span>
            </div>
        </div>

        <!-- Comment Form -->
        <div class="comment-form">
            <div class="comment-input-group">
                <label for="comment-author">Name (optional)</label>
                <input type="text" id="comment-author" placeholder="Anonymous" maxlength="50">
            </div>
            <div class="comment-input-group">
                <label for="comment-content">Your Comment</label>
                <textarea id="comment-content" placeholder="Share your thoughts..." maxlength="1000"></textarea>
            </div>
            <button id="comment-submit" class="comment-submit-btn">Post Comment</button>
        </div>

        <!-- Comments List -->
        <div id="comments-list" class="comments-list">
            <p style="color: #999; text-align: center; padding: 2rem;">Loading comments...</p>
        </div>
    </div>
</div>

<!-- Interaction Script -->
<script src="../assets/interaction.js"></script>
"""


def add_interactions_to_file(html_file):
    """Add interaction components to a single HTML file"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already added
    if 'interaction-section' in content:
        print(f"  ⏭️  Already has interactions, skipping")
        return False

    # Add styles to </style> tag
    if '</style>' in content:
        content = content.replace('</style>', INTERACTION_STYLES + '</style>')
    else:
        print(f"  ⚠️  No </style> tag found")
        return False

    # Add HTML before closing </body> tag
    if '</body>' in content:
        content = content.replace('</body>', INTERACTION_HTML + '\n</body>')
    else:
        print(f"  ⚠️  No </body> tag found")
        return False

    # Write back
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✅ Added interactions")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python add_interactions.py <html_file_or_directory>")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_file():
        print(f"Processing: {target.name}")
        add_interactions_to_file(target)
    elif target.is_dir():
        html_files = list(target.glob('*.html'))
        if not html_files:
            print(f"No HTML files found in {target}")
            sys.exit(1)

        print(f"Found {len(html_files)} HTML files")
        success = 0
        for html_file in html_files:
            if html_file.name == 'index.html':
                print(f"Skipping: {html_file.name} (landing page)")
                continue
            print(f"Processing: {html_file.name}")
            if add_interactions_to_file(html_file):
                success += 1

        print(f"\n✅ Successfully added interactions to {success}/{len(html_files)-1} files")
    else:
        print(f"Error: {target} is not a valid file or directory")
        sys.exit(1)


if __name__ == '__main__':
    main()
