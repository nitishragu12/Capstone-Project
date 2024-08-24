# About

## Introduction

The Western Australian Centre for Road Safety Research (WACRSR) is initiating a project to automate the manual process of scanning and analyzing road safety literature. Currently, this process is labor-intensive, taking up valuable time that could be better spent on critical research tasks. To address this, the project aims to develop a system that leverages advanced large language models (LLMs) to streamline literature scanning and evaluation.

## Group Members

| Student ID | Full Name        | GitHub Username |
| ---------- | ---------------- | --------------- |
| 23856227   | Ziqi Chen        | ziqichen55555   |
| 24139368   | Krish Goti       | krishgoti2002   |
| 23740534   | Chung Hei Tse    | maxtse25        |
| 23926903   | Shijun Shao      | Halffancyy      |
| 23799876   | Hui-Ling Huang   | somni1oquist    |
| 23689789   | Nitish Raguraman | nitishragu12    |

## Project Structure
```
./
├── api/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── __init__.py
│   ├── logs/
│   ├── migrations/
│   ├── config.py
│   ├── <env>.Dockerfile
│   ├── README.md
│   └── requirements.txt
├── secrets/
│   ├── els_api_key.txt
│   ├── els_token.txt
│   └── llm_api_key.txt
├── ui/
│   ├── app/
│   ├── public/
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── <env>.Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── .gitignore
├── docker-compose.<env>.yml
└── README.md
```

## Launch Papermate Application

### 0: Install Docker Desktop
Go to [Docker](https://www.docker.com/products/docker-desktop/) website to download and install the application. Once Installed, make sure the docker engine is running.

### 1. Secrets
Contact developers to acquire the necessary three secret files: API key for Gemini, API key for Elsevier and Institutional token (optional for remote connection).
After getting the files, create a folder named `secrets/` under root folder:
```
├── secrets/
│   ├── els_api_key.txt
│   ├── els_token.txt
│   └── llm_api_key.txt
```

### 2. Create `.env.local`
Generate an `.en.local` file uder `ui/` that specify the url for api app:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
```

### 3. Run `docker compose`
Open the terminal that is under root foler, choose an environment e.g. `docker-compose.dev.yml` and enter command:
```
docker compose -f docker-compose.<env>.yml up --build
```

### 4. Access Papermate
Go to the url of Papermate `http://localhost:3000/`, the app should be up and running now.