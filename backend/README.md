# Comment Backend for Trend Reports

Simple Flask backend for handling comments, likes, and interactions.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Server will run on http://127.0.0.1:5000

## Features

- **Comments**: Stored in JSON files (`comments/`)
- **IP Logging**: Full IP addresses stored for administrator review
- **IP Masking**: UI shows only first 2 octets (e.g., 192.168.x.x)
- **User Hash**: Consistent 8-char hash for identifying users
- **Likes**: Per-report like counter

## API Endpoints

### Get Comments
```
GET /api/comments/<report_id>
```

### Add Comment
```
POST /api/comments/<report_id>
Content-Type: application/json

{
  "content": "Your comment here",
  "author": "Your Name (optional)"
}
```

### Get Likes
```
GET /api/likes/<report_id>
```

### Add Like
```
POST /api/likes/<report_id>
```

## Data Storage

Comments are stored in `comments/` directory:
- `{report_id}.json` - Comments for each report
- `{report_id}_likes.json` - Like counts

**⚠️ Privacy Notice**: `comments/` folder is gitignored as it contains user IP addresses.

Example comment structure:
```json
{
  "id": "202510311234abcd",
  "content": "Great report!",
  "author": "Anonymous",
  "user_hash": "a1b2c3d4",
  "ip_address": "192.168.1.100",
  "masked_ip": "192.168.x.x",
  "timestamp": "2025-10-31T12:34:56",
  "likes": 0
}
```

## Admin Tools

### View Comments with Full IP
```bash
# List all reports with comments
python view_comments.py list

# View comments for specific report
python view_comments.py ai-learning-analytics-20251029-ko
```

## Add Interactions to Reports

```bash
# Add to single file
python add_interactions.py ../reports/report-name.html

# Add to all reports (skips index.html)
python add_interactions.py ../reports/
```
