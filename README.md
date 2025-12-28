# Networking Quiz App

A full-stack quiz experience for networking lectures. The React front end now talks to a lightweight Express + MongoDB API so quizzes can be stored, retrieved, and uploaded without touching the filesystem.

## Features

- Modern, friendly quiz UI with scoring, review mode, and progress tracking.
- Quiz list is loaded from MongoDB through the Express API instead of local JSON files.
- Dedicated upload screen for adding new quizzes; drop a `.json` file and it is pushed to MongoDB.
- **Question Bank**: Browse topics, click questions to reveal answers and patterns—perfect for short-answer study.
- Backend exposes REST APIs for both quizzes and question banks.

## Quiz JSON File Format

When uploading a quiz, your JSON file should contain an **array of question objects**. Each question object must have:

- `question` (string): The question text
- `answers` (array of strings): List of possible answers
- `correct_answer` (number): Zero-based index of the correct answer

### Example Quiz File (`lecture-9-http.json`)

```json
[
  {
    "question": "What does HTTP stand for?",
    "answers": [
      "Hyperlink Transfer and Text Protocol",
      "Hyper Text Transfer Protocol",
      "Home Text Transfer Protocol",
      "Hyper Text Transmission Protocol"
    ],
    "correct_answer": 1
  },
  {
    "question": "Which HTTP method is used to instruct a server to send the target resource, such as a web page?",
    "answers": ["POST", "HEAD", "GET", "PUT"],
    "correct_answer": 2
  },
  {
    "question": "An HTTP response with a status code of 404 belongs to which class of errors?",
    "answers": [
      "Informational (1xx)",
      "Successful (2xx)",
      "Redirection (3xx)",
      "Client errors (4xx)"
    ],
    "correct_answer": 3
  }
]
```

> **Note:** The `correct_answer` uses zero-based indexing. In the first example above, `correct_answer: 1` means "Hyper Text Transfer Protocol" (the second answer) is correct.

## Question Bank JSON File Format

Question banks are designed for short-answer questions where users click to reveal the answer. Each question object must have:

- `question` (string): The question text
- `answer` (string): The full answer text
- `pattern` (string, optional): Category or pattern type for the question
- `pdf` (string, optional): Source reference

### Example Question Bank File (`sna_short_answer.json`)

```json
{
  "metadata": {
    "total_questions": 3,
    "includes_user_questions": true,
    "note": "Short answer questions for networking"
  },
  "questions": [
    {
      "pdf": "User_Provided",
      "question": "How does a sender determine the destination MAC address for a packet destined for another network?",
      "answer": "When sending to a host on another IP network, the sender does not resolve the remote host's MAC directly. Instead, it sends the packet to its configured default gateway (router). The sender uses ARP to resolve the gateway's IP address to a MAC address.",
      "pattern": "Technical Process Explanation"
    },
    {
      "question": "Describe the concept of DHCP.",
      "answer": "DHCP (Dynamic Host Configuration Protocol) is a network protocol that automatically assigns IP configuration parameters to clients, such as IP address, subnet mask, default gateway, DNS servers, and lease time.",
      "pattern": "Definition & Differentiation"
    }
  ]
}
```

> **Note:** You can also upload a direct array of questions without the metadata wrapper.

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

**Quiz API:**

- `GET /api/quizzes` — returns `{ "quizzes": [...] }`
- `POST /api/quizzes` — upserts quizzes by `file_name`

**Question Bank API:**

- `GET /api/question-banks` — returns `{ "questionBanks": [...] }`
- `GET /api/question-banks/:fileName` — returns a single question bank
- `POST /api/question-banks` — upserts question banks by `file_name`
- `DELETE /api/question-banks/:fileName` — deletes a question bank

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
4. Open `http://localhost:3000`.
   - **Quiz List**: Browse and take multiple-choice quizzes
   - **Upload Quiz**: Push new quiz JSON files to the backend
   - **Question Bank**: Browse topics and click questions to reveal answers
   - **Upload Question Bank**: Add short-answer question sets

## Contributing

Issues and pull requests are welcome!
