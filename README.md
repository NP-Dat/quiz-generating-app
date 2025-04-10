# Networking Quiz App

A React-based application for testing your networking knowledge. This app fetches quiz questions from a `data.json` file and provides a user-friendly interface to answer the questions.

## Features

*   Modern and cute UI/UX
*   Fetches quiz data from JSON files in the `public/data` directory.
*   **Allows users to select a quiz from a list of available JSON files.**
*   Displays questions and answer options.
*   Tracks score and shows results at the end.
*   Provides feedback on selected answers during the quiz.
*   Includes a progress bar to indicate quiz progress.
*   **Allows users to review their answers after completing a quiz, showing correct answers and user selections.**
*   **Displays the name of the currently selected quiz on the quiz page.**
*   **Presents the list of quizzes as visually appealing cards instead of a table.**

## Technologies Used

*   React
*   CSS

## Getting Started

### Prerequisites

*   Node.js and npm installed on your machine.

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Navigate to the project directory:

    ```bash
    cd quiz-react-app
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

### Running the App

1.  Start the development server:

    ```bash
    npm start
    ```

2.  Open your browser and navigate to `http://localhost:3000` to view the app.

## Data Source

The quiz questions are stored in `public/data`. The app reads all `.json` files in this directory to populate the quiz list.  `npm start` will read all of it and automatically update the `index.json`

To add or modify quizzes:

1.  Create new `.json` files or modify existing ones in the `public/data` folder.
2.  Ensure your JSON files follow the format below.
3.  Restart the development server if it's already running to see the updated quiz list.

![image](https://github.com/user-attachments/assets/85a12f1c-9a20-46bf-ba8b-4e4df0b1fbe8)
in Google AI Studio, use Gemini 2.0 flash thinking (optional: temperature 0.7) to prompt like the img above, copy and paste data into `public/data/data.json` or just create a new file `.json` and put it in `public/data`

json format:
```json
{
    "question": "What version of the Internet Protocol is IPv4?",
    "answers": [
      "1st version",
      "2nd version",
      "3rd version",
      "4th version"
    ],
    "correct_answer": 3
  }
```


## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

[Choose a license and add it here] 

