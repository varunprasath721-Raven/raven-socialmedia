
## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Authentication
- Login: `varun` / `raven123`
- Other demo users: `arun_dev`, `kaviya_21`, `sanjay_fx` with password `raven123`
- Admin: `admin@raven.app` / `admin123`
- Create new account is available from the login screen.
- Forgot password supports local demo password reset.

## Included
- Stylish Raven logo and branded authentication screen
- Login / Sign up / Forgot password / Create new account
- Separate Admin login and admin session
- Existing stories, highlights, posts, comments, replies, emoji picker, messages, notifications and sharing UI preserved
- Authentication is a localStorage demo layer; connect Django/JWT endpoints for production authentication.

## Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
