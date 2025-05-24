# Tinu Task Manager

Tinu Task Manager is a comprehensive solution designed to help users efficiently manage their tasks and streamline their workflow. It is targeted towards individuals and teams looking for a robust and intuitive way to organize, track, and prioritize their work.

## Project Structure

The project is organized into the following main directories:

*   `Tinu-taskmanager/`: Contains the frontend application, built with React, TypeScript, and Vite.
*   `Lambda-Backend-V1/`: Houses the original AWS Lambda backend services (older version, likely superseded by V2).
*   `Lambda-Backend-V2/`: Contains the newer and improved AWS Lambda backend services (current and recommended backend).
*   `.github/`: Includes GitHub Actions workflows for continuous integration and continuous deployment (CI/CD).

## Technologies Used

The primary technologies, frameworks, and services used in this project include:

*   **Frontend:** React, TypeScript, Vite, HTML, CSS
*   **Backend:** Node.js, AWS Lambda, AWS SAM, MongoDB Atlas
*   **Other:** Git, GitHub Actions

## Getting Started

This section will guide you through setting up and running the Tinu Task Manager application.

### Prerequisites

Before you begin, ensure you have the following tools and accounts set up:

*   **Node.js and npm:** Required for both frontend and backend development. Download from [https://nodejs.org/](https://nodejs.org/).
*   **AWS CLI:** The AWS Command Line Interface, configured with an AWS account and necessary permissions to deploy Lambda, API Gateway, and DynamoDB resources. Install from [https://aws.amazon.com/cli/](https://aws.amazon.com/cli/).
*   **AWS SAM CLI:** The AWS Serverless Application Model (SAM) CLI, used for building and deploying the backend services. Install from [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
*   **Git:** For cloning the repository and version control. Install from [https://git-scm.com/](https://git-scm.com/).

### Backend Setup

The backend consists of AWS Lambda functions managed by AWS SAM.

1.  **Navigate to the backend directory:**
    The project contains two backend versions. It is recommended to use `Lambda-Backend-V2/`. Change directory accordingly:
    ```bash
    cd Lambda-Backend-V2/
    ```

2.  **Build the SAM application:**
    This command compiles your Lambda functions and prepares them for deployment.
    ```bash
    sam build
    ```

3.  **Deploy the SAM application:**
    This command will package and deploy your application to AWS. The `--guided` flag will prompt you for deployment parameters the first time.
    ```bash
    sam deploy --guided
    ```
    During the guided deployment, you might be asked to provide stack names, regions, and other parameters. Pay attention to any specific environment variables or configuration values that need to be set (e.g., DynamoDB table names if not dynamically created, Cognito User Pool IDs if applicable). This will include the `MONGODB_URI` (or similarly named environment variable) for connecting to your MongoDB Atlas cluster. These configurations are typically stored in the `samconfig.toml` file after the first guided deployment.

4.  **Note API Gateway Endpoint:**
    After successful deployment, AWS SAM will output the API Gateway endpoint URL. This URL is crucial for the frontend to communicate with the backend. Make a note of it.

### Frontend Setup

The frontend is a React application built with Vite.

1.  **Navigate to the frontend directory:**
    ```bash
    cd Tinu-taskmanager/
    ```

2.  **Install dependencies:**
    This command will download and install all the necessary packages for the frontend.
    ```bash
    npm install
    # Or if you prefer yarn and a yarn.lock file is present:
    # yarn install
    ```

3.  **Configure Backend API Endpoint:**
    The frontend needs to know the API Gateway endpoint URL of your deployed backend.
    *   Look for a configuration file. This might be `src/aws-export.ts` (often used with AWS Amplify or similar setups), an `.env` file (e.g., `VITE_API_BASE_URL=YOUR_API_ENDPOINT`), or other configuration files within `Tinu-taskmanager/src/`.
    *   Update the relevant file with the API Gateway endpoint URL you noted from the backend deployment. For example, if using an `.env` file:
        ```
        VITE_API_BASE_URL=YOUR_API_GATEWAY_ENDPOINT_URL
        ```
    *   If no such file is obvious, you might need to check the frontend code (e.g., in services or API utility files) to see how the backend URL is consumed and where it should be defined.

4.  **Run the development server:**
    ```bash
    npm run dev
    # Or if you used yarn:
    # yarn dev
    ```

5.  **Access the application:**
    Vite will typically output the local URL where the application is being served (e.g., `http://localhost:5173`). Open this URL in your web browser to use the Tinu Task Manager.

## Features

Tinu Task Manager offers a range of features to enhance productivity and task organization:

### Task Management
*   **CRUD Operations:** Create, view, update, and delete tasks seamlessly.
*   **Kanban Board:** Organize tasks using customizable columns (e.g., "To Do", "In Progress", "Completed").
*   **Drag & Drop:** Intuitively move tasks between columns or reorder them.
*   **Task Attributes:** Set task priorities, statuses, and due dates.

### User Authentication
*   **Secure Sign-up/Login:** User registration and login with robust password handling.
*   **Password Reset:** Functionality for users to securely reset their passwords.
*   **Protected Routes:** Ensures that only authenticated users can access the core application features.

### Organization & Productivity
*   **Tagging System:** Create, manage, and assign customizable tags (with colors) to tasks for better visual organization and filtering.
*   **Notes & Ideas:** A dedicated space for capturing and managing notes, thoughts, and ideas.
*   **Pomodoro Timer:** Integrated Pomodoro timer to help users focus and manage their work intervals.

### User Experience
*   **Responsive Design:** Fully responsive interface that adapts to various screen sizes (desktop, tablet, mobile).
*   **Light/Dark Mode:** Switch between light and dark themes for user comfort.

### Dashboard & Insights
*   **Visual Dashboard:** An overview of tasks, potentially including charts and progress summaries. (Future Enhancement)

### Specialized Features
*   **"Tinumind" Tasks:** A special feature or task type, possibly for brainstorming or mind-mapping related activities. (Details to be expanded based on specific functionality)

### Feedback
*   **User Feedback Mechanism:** Allows users to submit feedback, suggestions, or report issues directly within the application.

## Backend Details

### Overview
The backend for Tinu Task Manager is built using a serverless architecture on AWS. It primarily utilizes AWS Lambda for compute and Amazon API Gateway to expose RESTful APIs. Deployment and management of these resources are handled using the AWS Serverless Application Model (SAM).

### Backend Versions
The repository contains two versions of the backend:
*   `Lambda-Backend-V1/`: An earlier version of the backend services.
*   `Lambda-Backend-V2/`: The current and more comprehensive version, which includes enhanced features and an improved structure. It is the recommended version for new deployments and development.

### Lambda Functions (Lambda-Backend-V2)
The `Lambda-Backend-V2/` directory contains several key Lambda functions that provide the core logic for the application. These include:

*   **`TaskHandlerFunction`**: Manages all Create, Read, Update, and Delete (CRUD) operations for tasks.
*   **`TagHandlerFunction`**: Handles the creation, updating, deletion, and association of tags with tasks.
*   **`FeedbackFunction`**: Processes user-submitted feedback, suggestions, or issues.
*   **`StatusCountFunction`**: Provides aggregated counts or statistics related to task statuses (e.g., number of "To Do", "In Progress", "Completed" tasks).
*   **`TinumindFunction`**: Powers the specialized "Tinumind" features, managing any associated data or logic.

The specific API endpoints, request/response formats, and detailed configurations for these functions are defined in the `Lambda-Backend-V2/template.yaml` SAM template.

### Data Storage
Data for the application, including tasks, tags, user information (if applicable), and feedback, is stored in MongoDB Atlas, a cloud-hosted MongoDB service. The Lambda functions will require a MongoDB connection string (typically stored as an environment variable, e.g., MONGODB_URI) to connect to the database cluster. This connection string needs to be configured in the AWS Lambda environment variables, usually managed via the SAM template (`template.yaml`) or directly in the AWS Lambda console.

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to fix a bug, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourAmazingFeature` or `bugfix/IssueDescription`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5.  Push to the branch (`git push origin feature/YourAmazingFeature`).
6.  Open a Pull Request.

Please ensure your code follows the existing style and that any new features are appropriately documented or tested.