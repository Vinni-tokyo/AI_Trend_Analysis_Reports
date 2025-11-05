#!/usr/bin/env python3
"""
View comments with full IP addresses (for administrators)
"""

import json
import sys
from pathlib import Path
from datetime import datetime

COMMENTS_DIR = Path(__file__).parent / 'comments'


def format_timestamp(iso_string):
    """Format ISO timestamp to readable format"""
    dt = datetime.fromisoformat(iso_string)
    return dt.strftime('%Y-%m-%d %H:%M:%S')


def view_comments(report_id):
    """View all comments for a report with full details"""
    comment_file = COMMENTS_DIR / f"{report_id}.json"

    if not comment_file.exists():
        print(f"❌ No comments found for report: {report_id}")
        return

    with open(comment_file, 'r', encoding='utf-8') as f:
        comments = json.load(f)

    if not comments:
        print(f"📭 No comments for: {report_id}")
        return

    print(f"\n{'='*80}")
    print(f"📊 Comments for: {report_id}")
    print(f"{'='*80}\n")

    for i, comment in enumerate(comments, 1):
        print(f"Comment #{i}")
        print(f"  ID:        {comment.get('id', 'N/A')}")
        print(f"  Author:    {comment.get('author', 'Anonymous')}")
        print(f"  User Hash: {comment.get('user_hash', 'N/A')}")
        print(f"  IP:        {comment.get('ip_address', 'N/A')}")  # Full IP
        print(f"  Masked IP: {comment.get('masked_ip', 'N/A')}")
        print(f"  Time:      {format_timestamp(comment.get('timestamp', ''))}")
        print(f"  Likes:     {comment.get('likes', 0)}")
        print(f"  Content:   {comment.get('content', '')[:100]}...")
        print(f"  {'-'*76}")

    print(f"\nTotal comments: {len(comments)}\n")


def list_all_reports():
    """List all reports that have comments"""
    if not COMMENTS_DIR.exists():
        print("❌ No comments directory found")
        return

    comment_files = list(COMMENTS_DIR.glob('*.json'))
    comment_files = [f for f in comment_files if not f.name.endswith('_likes.json')]

    if not comment_files:
        print("📭 No comments found")
        return

    print(f"\n📋 Reports with comments:\n")
    for i, file in enumerate(comment_files, 1):
        report_id = file.stem
        with open(file, 'r') as f:
            comments = json.load(f)
        print(f"{i:2d}. {report_id} ({len(comments)} comments)")
    print()


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python view_comments.py list              # List all reports")
        print("  python view_comments.py <report_id>       # View comments for report")
        print("\nExamples:")
        print("  python view_comments.py list")
        print("  python view_comments.py ai-learning-analytics-20251029-ko")
        sys.exit(1)

    command = sys.argv[1]

    if command == 'list':
        list_all_reports()
    else:
        view_comments(command)


if __name__ == '__main__':
    main()
