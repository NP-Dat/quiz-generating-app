# Networking Quiz App

A React-based application for testing your networking knowledge. This app fetches quiz questions from a `data.json` file and provides a user-friendly interface to answer the questions.

## Features

*   Modern and cute UI/UX
*   Fetches quiz data from a JSON file
*   Displays questions and answer options
*   Tracks score and shows results at the end
*   Provides feedback on selected answers
*   Includes a progress bar to indicate quiz progress

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

The quiz questions are stored in `public/data.json`. You can modify this file to add, edit, or remove questions.
![image](https://github.com/user-attachments/assets/85a12f1c-9a20-46bf-ba8b-4e4df0b1fbe8)
in Google AI Studio, use Gemini 2.0 flash thinking (optional: temperature 0.7) to prompt like the img above, copy and paste data into `public/data.json`

json format:
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


## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

[Choose a license and add it here] 

