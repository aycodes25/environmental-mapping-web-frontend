
# EMP-FRONTEND

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Introduction

EMP WEB-FRONTEND
## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: npm is distributed with Node.js, which means that when you download Node.js, you automatically get npm installed.
- **Git**: You should have Git installed to clone the repository. You can download it from [git-scm.com](https://git-scm.com/).

## Installation

Follow these steps to set up and run the project:

### Step 1: Clone the Repository

Open your terminal and run the following command:

```bash
git clone https://github.com/Theoriontechsolutions/empfrontend-01
```

### Step 2: Navigate to the Project Directory

Change to the project directory:

```bash
cd empfrontend-01
```

### Step 3: Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

This command will read the `package.json` file and install the dependencies listed under `dependencies` and `devDependencies`.


Make sure to replace the values with your actual configuration.

## Running the Project

### Development Server

To run the project in development mode, start the app like this:

```bash
npm run dev
```

This command will start the development server and reload the server whenever you make changes to the source code.

Please ensure you are connected to the internet to properly load some
ui frameworks else the app won't work appropriately, this is pending 
setting the configurations right.

### Loading models

To test uploading models, there is an example model in the root folder
`empfrontend-01` named model.glb, you can load this to start viewing 
models.

### Production Server

### Environment Variables

Create a `.env` file in the root directory of the project and add the necessary environment variables. Here is an example:

```
VITE_BACKEND_BASE_URL=http://devapi.oriontestingserver1.com
VITE_APP_URL=http://dev.oriontestingserver1.com
```

To run the project in production mode, use the following command:

```bash
npm run build
npm run start
```

## Contributing

Describe how others can contribute to your project.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.
