# AI-Based Crop Disease Prediction and Fertilizer Recommendation System - Project Specification

## 1. SYSTEM ARCHITECTURE

### Architecture Overview

```mermaid
graph TD
    Client[Farmer/Admin Client (React.js + Tailwind)] -->|HTTP/REST| Backend[Node.js/Express Backend]
    Backend -->|HTTP/REST| ML_API[Flask ML API]
    Backend -->|SQL| DB[(MySQL Database)]
    ML_API -->|Read| DB
```

### Data Flow
1.  **Farmer Interaction**: Farmer uploads leaf image and enters crop/soil/location data via React UI.
2.  **Backend Processing**: Node.js backend receives request, validates input, stores image temporarily using Multer.
3.  **ML Inference**: Backend forwards image to Flask API; CNN model preprocesses and classifies disease.
4.  **Disease Output**: Flask returns disease name and confidence score to Node.js backend.
5.  **Recommendation Engine**: Backend executes rule-based fertilizer logic combining disease, crop type, soil nutrients, and weather data.
6.  **Database Storage**: Prediction and recommendation stored in MySQL with timestamp and user reference.
7.  **Response**: Complete result (disease + fertilizer recommendation) sent back to React frontend for display.
8.  **Admin Tracking**: All transactions logged in admin_logs table for dashboard analytics.

---

## 2. FRONTEND REACT COMPONENT STRUCTURE

### Component Hierarchy
```
App.js
├── AuthModule/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   └── ProtectedRoute.js
├── FarmerModule/
│   ├── Dashboard.js
│   ├── ImageUploadForm.js
│   │   ├── CropTypeSelector.js
│   │   ├── SoilDataInput.js
│   │   ├── LocationPicker.js
│   │   └── ImagePreview.js
│   ├── AnalysisResult.js
│   │   ├── DiseaseCard.js
│   │   ├── FertilizerRecommendation.js
│   │   └── UsageInstructions.js
│   └── HistoryPage.js
├── AdminModule/
│   ├── AdminDashboard.js
│   ├── ImageGallery.js
│   ├── DiseaseStatistics.js
│   ├── ModelPerformance.js
│   └── DatasetManager.js
├── SharedComponents/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── LoadingSpinner.js
│   └── ErrorBoundary.js
└── styles/
    └── tailwind.config.js
```

---

## 3. BACKEND NODE.JS/EXPRESS API STRUCTURE

### Project Structure
```
backend/
├── server.js (entry point)
├── config/
│   ├── database.js (MySQL connection)
│   ├── multer.js (image upload config)
│   └── env.js (environment variables)
├── routes/
│   ├── auth.routes.js
│   ├── farmer.routes.js
│   ├── admin.routes.js
│   └── ml.routes.js
├── controllers/
│   ├── authController.js
│   ├── farmerController.js
│   ├── adminController.js
│   └── mlController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── validationMiddleware.js
├── services/
│   ├── mlService.js (Flask API communication)
│   ├── fertiliserService.js (recommendation logic)
│   ├── weatherService.js (weather data fetch)
│   └── databaseService.js
├── uploads/ (temporary image storage)
└── package.json
```

### Core API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/farmer/analyze`
- `GET /api/farmer/history`
- `GET /api/admin/dashboard`
- `GET /api/admin/predictions`
- `POST /api/admin/dataset/upload`
- `GET /api/admin/model-performance`

---

## 4. FLASK ML API CODE OUTLINE

### Project Structure
```
ml_api/
├── app.py (Flask app)
├── models/
│   ├── cnn_model.h5 (trained weights)
│   ├── lstm_model.h5 (optional)
│   └── model_config.json
├── preprocessing/
│   ├── image_processor.py
│   └── data_augmentation.py
├── routes/
│   ├── predict.py
│   └── weather_predict.py
├── utils/
│   ├── logger.py
│   └── error_handler.py
├── requirements.txt
└── config.py
```

### Model Selection Rationale
- **CNN (MobileNetV2)**: Lightweight, optimized for edge/mobile, transfer learning on PlantVillage dataset.
- **LSTM (Optional)**: For time-series weather prediction to capture non-linear patterns.

---

## 5. MYSQL DATABASE SCHEMA
*See `database/schema.sql` for the full SQL script.*

### Tables
1.  **users**: Stores farmer and admin details.
2.  **crops**: Stores crop types and metadata.
3.  **soil_data**: Stores soil nutrient levels linked to users.
4.  **predictions**: Stores image paths, disease detected, confidence.
5.  **fertilizers**: Stores fertilizer inventory/details.
6.  **fertilizer_recommendations**: Links predictions to fertilizers.
7.  **weather_data**: Stores historical weather data.
8.  **admin_logs**: Tracks admin actions.
9.  **model_metrics**: Tracks ML model performance.

---

## 6. PROJECT MODULES
1.  **Authentication**: JWT-based, role-based (Farmer/Admin).
2.  **Image Upload**: Validation, resizing, storage.
3.  **Disease Detection**: CNN inference, confidence thresholding.
4.  **Fertilizer Logic**: Rule-based engine (Disease + Crop + Soil + Weather).
5.  **Weather Integration**: OpenWeatherMap API + LSTM.
6.  **Admin Dashboard**: Analytics, dataset management.
7.  **Data Persistence**: MySQL with transaction management.

---

## 7. EXISTING VS PROPOSED SYSTEM
- **Accuracy**: Automated (95%) vs Manual.
- **Access**: Mobile/Web (24/7) vs Experts (Business hours).
- **Cost**: Low/Free vs Expensive consultations.
- **Data**: Centralized history vs Paper records.

## 8. DEPLOYMENT
### Local
1.  Setup MySQL (XAMPP).
2.  `npm install && npm start` in backend.
3.  `pip install -r requirements.txt && python app.py` in ml_api.
4.  `npm install && npm run dev` in frontend.

### Cloud (AWS)
-   EC2 for backend/ML API.
-   RDS for MySQL.
-   S3 for images.
-   CloudFront + S3 for React frontend.
