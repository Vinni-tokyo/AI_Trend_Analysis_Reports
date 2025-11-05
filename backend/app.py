#!/usr/bin/env python3
"""
Simple comment backend for trend reports
Stores comments in JSON files locally
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Comments directory
COMMENTS_DIR = Path(__file__).parent / 'comments'
COMMENTS_DIR.mkdir(exist_ok=True)


def mask_ip(ip_address):
    """Mask IP address to show only first 2 octets"""
    parts = ip_address.split('.')
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.x.x"
    return "unknown"


def get_client_ip():
    """Get client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr or 'unknown'


def get_user_hash(ip_address):
    """Generate consistent user hash from IP"""
    return hashlib.md5(ip_address.encode()).hexdigest()[:8]


@app.route('/api/comments/<report_id>', methods=['GET'])
def get_comments(report_id):
    """Get all comments for a report"""
    comment_file = COMMENTS_DIR / f"{report_id}.json"

    if not comment_file.exists():
        return jsonify([])

    with open(comment_file, 'r', encoding='utf-8') as f:
        comments = json.load(f)

    return jsonify(comments)


@app.route('/api/comments/<report_id>', methods=['POST'])
def add_comment(report_id):
    """Add a new comment"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content required'}), 400

    content = data['content'].strip()
    if not content or len(content) > 1000:
        return jsonify({'error': 'Content must be 1-1000 characters'}), 400

    # Get IP info
    ip_address = get_client_ip()
    masked_ip = mask_ip(ip_address)
    user_hash = get_user_hash(ip_address)

    # Create comment object
    comment = {
        'id': datetime.now().strftime('%Y%m%d%H%M%S') + user_hash[:4],
        'content': content,
        'author': data.get('author', 'Anonymous'),
        'user_hash': user_hash,
        'ip_address': ip_address,  # Store full IP for admin
        'masked_ip': masked_ip,    # Show masked IP in UI
        'timestamp': datetime.now().isoformat(),
        'likes': 0
    }

    # Load existing comments
    comment_file = COMMENTS_DIR / f"{report_id}.json"
    if comment_file.exists():
        with open(comment_file, 'r', encoding='utf-8') as f:
            comments = json.load(f)
    else:
        comments = []

    # Add new comment
    comments.append(comment)

    # Save
    with open(comment_file, 'w', encoding='utf-8') as f:
        json.dump(comments, f, ensure_ascii=False, indent=2)

    return jsonify(comment), 201


@app.route('/api/likes/<report_id>', methods=['GET'])
def get_likes(report_id):
    """Get like count for a report"""
    like_file = COMMENTS_DIR / f"{report_id}_likes.json"

    if not like_file.exists():
        return jsonify({'count': 0})

    with open(like_file, 'r') as f:
        data = json.load(f)

    return jsonify({'count': data.get('count', 0)})


@app.route('/api/likes/<report_id>', methods=['POST'])
def add_like(report_id):
    """Increment like count"""
    like_file = COMMENTS_DIR / f"{report_id}_likes.json"

    if like_file.exists():
        with open(like_file, 'r') as f:
            data = json.load(f)
        count = data.get('count', 0)
    else:
        count = 0

    count += 1

    with open(like_file, 'w') as f:
        json.dump({'count': count}, f)

    return jsonify({'count': count})


if __name__ == '__main__':
    print(f"Comments will be stored in: {COMMENTS_DIR}")
    app.run(host='127.0.0.1', port=5000, debug=True)
