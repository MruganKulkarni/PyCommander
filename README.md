# PyCommander - An AI-Powered Terminal

This is a Next.js application built in Firebase Studio that simulates a terminal experience with AI-powered command generation using Google's Gemini model.

## Running the Project Locally

To run this project on your local machine, please follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- `npm` (which comes with Node.js)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Set Up Your Gemini API Key

The AI features are powered by Google's Gemini model. To use it on your local machine, you'll need an API key.

- Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- In the root directory of your project, create a new file named `.env.local`.
- Add the following line to the `.env.local` file, replacing `YOUR_API_KEY` with the key you just obtained:

```
GEMINI_API_KEY=YOUR_API_KEY
```

### 2. Install Dependencies

Open your project folder in your code editor (like VS Code) and run the following command in the terminal to install the necessary packages:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two services to be running at the same time: the Next.js application and the Genkit AI service. You will need to open two separate terminal windows or tabs.

**Terminal 1: Start the Next.js App**

```bash
npm run dev
```

This will start the main web application. By default, it will be available at `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Service**

```bash
npm run genkit:dev
```

This starts the local server that the Next.js app communicates with to process AI requests.

### 4. View Your Application

Once both servers are running, open your web browser and go to:

`http://localhost:9002`

You should now see the PyCommander terminal interface and be able to interact with it.
