# Dealerships Review Platform - Car Dealerships Application

A full-stack web application designed for a national car dealership network. The application enables users to browse dealership locations across the United States, view detailed dealer information, read customer reviews with automated sentiment analysis, and submit new reviews.

## Architecture & Technology Stack
- **Backend**: Django web framework (Python) providing RESTful APIs, user authentication, and data models for car makes and models.
- **Frontend**: React SPA for dynamic user interactions, dealer listings, filtering by state, and posting customer reviews.
- **Microservices**:
  - Express & Node.js service paired with MongoDB for dealership and review data persistence.
  - Flask / NLTK Sentiment Analyzer service deployed as a containerized microservice for analyzing sentiment of customer reviews.
- **DevOps & CI/CD**: GitHub Actions workflow for linting (Flake8 and ESLint/JSHint) and deployment on IBM Cloud Code Engine.
