# Networking Quiz App

A full-stack quiz experience for networking lectures. The React front end now talks to a lightweight Express + MongoDB API so quizzes can be stored, retrieved, and uploaded without touching the filesystem.

## Features

- Modern, friendly quiz UI with scoring, review mode, and progress tracking.
- Quiz list is loaded from MongoDB through the Express API instead of local JSON files.
- Dedicated upload screen for adding new quizzes; drop a `.json` file and it is pushed to MongoDB using the required payload format:
  ```json
  [
    {
      "file_name": "lecture-7-docker.json",
      "list_of_questions": [{ "question": "...", "answers": [], "correct_answer": 0 }]
    }
  ]
  ```
- Backend exposes `GET /api/quizzes` and `POST /api/quizzes` for fetching and inserting/updating quiz documents.

## Project Structure

```
quiz-generating-app/
├── back-end/          # Express + MongoDB API
└── quiz-react-app/    # React client
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local Atlas cluster or self-hosted)

## Backend Setup (`back-end/`)

1. Install dependencies:
   ```bash
   cd back-end
   npm install
   ```
2. Copy `env.example` to `.env` and fill in the values:
   ```
   MONGODB_URI=mongodb://localhost:27017/quizdb
   PORT=4000
   CLIENT_ORIGIN=http://localhost:3000
   ```
3. Start the API:
   ```bash
   # for production-style run
   npm start

   # or with auto-reload during development
   npm run dev
   ```

`GET /api/quizzes` returns `{ "quizzes": [...] }`.  
`POST /api/quizzes` accepts the array payload shown above and upserts each quiz by `file_name`.

## Frontend Setup (`quiz-react-app/`)

1. Install dependencies:
   ```bash
   cd quiz-react-app
   npm install
   ```
2. Create `.env` in this folder and set the API base URL (defaults to `http://localhost:4000` if omitted):
   ```
   REACT_APP_API_BASE_URL=http://localhost:4000
   ```
3. Start the React app:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`. Use the **Upload Quiz** page to push new JSON files to the backend. The **Quiz List** page fetches quizzes from MongoDB and lets users play them instantly.

## Contributing

Issues and pull requests are welcome!

