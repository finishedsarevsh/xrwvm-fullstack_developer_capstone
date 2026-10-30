# IBM Full-Stack Developer Capstone Runbook: "Cars Dealership"

This runbook documents the architecture, local setup, test evidence, and IBM Cloud Code Engine deployment steps for the **Cars Dealership** capstone project.

---

## 1. Project Overview & Architecture
- **Django Application (`server/`)**: Acts as the central web application and API proxy, handling user authentication (login, logout, registration), rendering static pages (`Home.html`, `About.html`, `Contact.html`), serving the compiled React frontend, managing `CarMake` and `CarModel` database models, and proxying requests to backend microservices.
- **Node.js / Express / MongoDB Microservice (`server/database/`)**: Manages dealership listings and customer reviews, exposing endpoints:
  - `GET /fetchDealers`
  - `GET /fetchDealers/:state`
  - `GET /fetchDealer/:id`
  - `GET /fetchReviews`
  - `GET /fetchReviews/dealer/:id`
  - `POST /insert_review`
- **Sentiment Analyzer Microservice (`server/djangoapp/microservices/`)**: Flask microservice using NLTK VADER sentiment intensity analysis:
  - `GET /analyze/<input_txt>` returning `{"sentiment": "positive"|"neutral"|"negative"}`
- **React SPA Frontend (`server/frontend/`)**: Modern UI for browsing dealerships, filtering by state, viewing dealer details & reviews with sentiment indicators, and posting new reviews.
- **CI/CD Pipeline (`.github/workflows/ci.yml`)**: Continuous integration on GitHub Actions performing Flake8 Python linting and React frontend build verification.

---

## 2. Local Setup & Execution Guide

### Step 2.1: Python Environment & Django Server
```bash
cd server
pip install -r requirements.txt
pip install nltk flask flake8
python -c "import nltk; nltk.download('vader_lexicon')"

python manage.py makemigrations djangoapp
python manage.py migrate
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings'); django.setup(); from django.contrib.auth.models import User; User.objects.create_superuser('root', 'root@example.com', 'RootPassword123!')"
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings'); django.setup(); from djangoapp.populate import initiate; initiate()"

python manage.py runserver 8000
```

### Step 2.2: Node.js & Database Microservice
```bash
cd server/database
npm install
node app.js
```
*Listens on `http://localhost:3030`.*

### Step 2.3: Flask Sentiment Analyzer Microservice
```bash
cd server/djangoapp/microservices
python app.py
```
*Listens on `http://localhost:5050`.*

### Step 2.4: React Frontend Build
```bash
cd server/frontend
npm install
npm run build
```
*Compiled assets are located in `server/frontend/build` and served automatically by Django.*

---

## 3. IBM Cloud Code Engine Deployment Runbook (Tasks 14-15, 23-28)

To deploy the application to IBM Cloud Code Engine from the IBM Skills Network Lab or local terminal:

### Step 3.1: Log in to IBM Cloud CLI
```bash
ibmcloud login --sso
# Select your account and target region (e.g., us-south or us-east)
ibmcloud target -g Default
```

### Step 3.2: Select or Create Code Engine Project
```bash
# Target or create project
ibmcloud ce project select --name dealerships-project || ibmcloud ce project create --name dealerships-project
```

### Step 3.3: Deploy Sentiment Analyzer Microservice
```bash
cd server/djangoapp/microservices
ibmcloud ce application create --name sentiment-analyzer \
  --build-source . \
  --port 5050 \
  --min-scale 1
# Note the URL output (e.g. https://sentiment-analyzer.<region>.codeengine.appdomain.cloud)
```

### Step 3.4: Deploy MongoDB & Node Database Microservice
```bash
cd server/database
ibmcloud ce application create --name database-service \
  --build-source . \
  --port 3030 \
  --min-scale 1
# Note the URL output (e.g. https://database-service.<region>.codeengine.appdomain.cloud)
```

### Step 3.5: Deploy Django Application with Frontend Build
Update `server/djangoapp/.env` with your Code Engine deployed URLs:
```ini
backend_url=https://database-service.<region>.codeengine.appdomain.cloud
sentiment_analyzer_url=https://sentiment-analyzer.<region>.codeengine.appdomain.cloud/
```
Build and deploy the application:
```bash
cd server
ibmcloud ce application create --name dealerships-app \
  --build-source . \
  --port 8000 \
  --env backend_url=https://database-service.<region>.codeengine.appdomain.cloud \
  --env sentiment_analyzer_url=https://sentiment-analyzer.<region>.codeengine.appdomain.cloud/ \
  --min-scale 1
```

Save the public URL output to `./submission/deploymentURL`:
```bash
echo "https://dealerships-app.<region>.codeengine.appdomain.cloud" > ../submission/deploymentURL
```

### Step 3.6: Capture Deployed Site Screenshots
On the deployed application URL (`https://dealerships-app.<region>.codeengine.appdomain.cloud`):
1. `screenshots/deployed_landingpage.png`: Deployed landing page (`/`).
2. `screenshots/deployed_loggedin.png`: Deployed site logged in with test user username visible.
3. `screenshots/deployed_dealer_detail.png`: Dealer detail page (`/dealer/29`) via deployment URL.
4. `screenshots/deployed_add_review.png`: Review posted and displayed on the deployed site.
