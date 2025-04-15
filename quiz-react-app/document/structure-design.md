# Structure Design of Quiz React App

This document outlines the structure and design of the Quiz React application.

## 1. Codebase Structure

The codebase is structured as a typical React application, emphasizing component-based architecture and separation of concerns. The main directories and files are organized as follows:

- **`quiz-react-app/src/`**: This directory contains the main source code of the application.
    - **`App.js`**:  The root component of the application. It sets up the React Router for navigation between different views (Quiz List and Quiz). It also defines the basic layout of the application including header and footer.
    - **`index.js`**: The entry point of the React application. It renders the `App` component into the root DOM node.
    - **`QuizList.js`**:  Component responsible for displaying a list of available quizzes. It fetches the list of quiz files from `public/data/index.json` and renders them as cards. Users can select a quiz from this list to start playing.
    - **`Quiz.js`**: Component for rendering the quiz questions and handling user interactions during a quiz. It fetches quiz data from JSON files located in the `public/data` directory based on the selected quiz. It manages quiz state, scoring, and question progression.
    - **`components/`**: (Currently empty in provided context, but intended for reusable UI components). This directory is intended to house reusable React components that can be used across different parts of the application.
    - **`context/`**: (Currently empty in provided context, but intended for React Contexts). This directory is likely intended to store React Contexts for managing application-wide state, such as theme or user preferences, if needed in the future.
    - **`css/`**: Contains CSS files for styling the application components.
        - `App.css`: Styles for the main `App` component and general layout.
        - `index.css`: Global styles for the application.
        - `Quiz.css`: Styles specific to the `Quiz` and `QuizList` components.
    - **`reportWebVitals.js`**:  Configuration for measuring and reporting web vitals for performance monitoring.

- **`quiz-react-app/public/`**: This directory contains public assets.
    - **`index.html`**: The main HTML file that serves as the template for the React application.
    - **`favicon.ico`**: The favicon for the application.
    - **`data/`**:  Contains JSON files holding quiz questions and answers.
        - `index.json`: Lists available quiz files.
        - Quiz data files (e.g., `networking_quiz.json`, `javascript_quiz.json`, etc.) - each file contains questions and answers for a specific quiz.

## 2. UI/UX Technology

The Quiz React App utilizes the following technologies for UI/UX:

- **React**:  A JavaScript library for building user interfaces. React's component-based architecture is used to create a modular and maintainable UI.
- **React Router**:  A standard library for routing in React applications. It enables navigation between different views (Quiz List and Quiz) without page reloads, providing a Single Page Application (SPA) experience.
- **CSS**:  Plain CSS is used for styling the components. CSS modules or a CSS-in-JS solution could be considered for larger applications to improve CSS maintainability and avoid naming conflicts, but for this project, standard CSS files are sufficient.

## 3. Data Fetching from JSON Files

The application fetches quiz data from JSON files located in the `public/data/` directory. The data fetching process is as follows:

1. **Quiz List**:
   - In `QuizList.js`, the `useEffect` hook is used to fetch the list of available quiz files from `/data/index.json` when the component mounts.
   - The `fetch` API is used to make a GET request to this endpoint.
   - Upon successful response, the JSON data (which is expected to be an array of filenames) is parsed and stored in the `quizFiles` state. This state is then used to render the list of quiz cards.

2. **Quiz Data**:
   - In `Quiz.js`, when a user selects a quiz from the `QuizList`, the `selectedQuiz` filename is passed via `location.state` using React Router.
   - The `Quiz` component's `useEffect` hook then fetches the quiz data. It constructs the API endpoint dynamically using the `selectedQuiz` filename: `/data/${selectedQuiz}`.
   - Again, the `fetch` API is used to retrieve the JSON data for the specific quiz.
   - The fetched JSON data, containing questions and answers, is then stored in the `questions` state, which drives the quiz rendering.

**In summary:** The application uses React for UI rendering, React Router for navigation, and plain CSS for styling. Quiz data is stored in JSON files in the `public/data/` directory and fetched using the `fetch` API in both `QuizList` and `Quiz` components. This approach keeps the data separate from the application code and allows for easy addition or modification of quizzes by updating the JSON files.