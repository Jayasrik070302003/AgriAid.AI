-- Database Creation
CREATE DATABASE IF NOT EXISTS crop_disease_db;
USE crop_disease_db;

-- 1. Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('farmer', 'admin') DEFAULT 'farmer',
    district VARCHAR(50),
    state VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. Crops Table
CREATE TABLE crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_name VARCHAR(50) UNIQUE NOT NULL,
    common_diseases TEXT,
    growing_season VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Soil Data Table
CREATE TABLE soil_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    soil_type ENUM('black', 'red', 'alluvial', 'laterite') NOT NULL,
    nitrogen DECIMAL(5, 2),
    phosphorus DECIMAL(5, 2),
    potassium DECIMAL(5, 2),
    ph_level DECIMAL(3, 1),
    organic_matter DECIMAL(5, 2),
    recorded_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- 4. Predictions Table
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    crop_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_filename VARCHAR(100),
    disease_detected VARCHAR(100) NOT NULL,
    confidence DECIMAL(5, 2),
    soil_data_id INT,
    weather_condition VARCHAR(100),
    temperature DECIMAL(5, 2),
    rainfall DECIMAL(7, 2),
    location_district VARCHAR(50),
    location_state VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (soil_data_id) REFERENCES soil_data(id),
    INDEX idx_user_id (user_id),
    INDEX idx_disease (disease_detected),
    INDEX idx_created_at (created_at)
);

-- 5. Fertilizer Table
CREATE TABLE fertilizers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fertilizer_name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('chemical', 'organic', 'bio') DEFAULT 'chemical',
    nitrogen_content DECIMAL(5, 2),
    phosphorus_content DECIMAL(5, 2),
    potassium_content DECIMAL(5, 2),
    cost_per_unit DECIMAL(10, 2),
    availability VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fertilizer Recommendations Table
CREATE TABLE fertilizer_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prediction_id INT NOT NULL,
    fertilizer_id INT NOT NULL,
    quantity_per_acre DECIMAL(8, 2),
    unit ENUM('kg', 'liters', 'bags') DEFAULT 'kg',
    application_method VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INT,
    rationale TEXT,
    weather_adjusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    FOREIGN KEY (fertilizer_id) REFERENCES fertilizers(id),
    INDEX idx_prediction_id (prediction_id)
);

-- 7. Weather Data Table
CREATE TABLE weather_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    temperature DECIMAL(5, 2),
    rainfall DECIMAL(7, 2),
    humidity DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    recorded_date DATE,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_district_date (district, recorded_date)
);

-- 8. Admin Logs Table
CREATE TABLE admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(100),
    target_table VARCHAR(50),
    target_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
);

-- 9. Model Performance Metrics Table
CREATE TABLE model_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_type VARCHAR(50),
    accuracy DECIMAL(5, 4),
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    test_date DATE,
    dataset_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model_type (model_type)
);

-- 10. Impact Simulations
CREATE TABLE IF NOT EXISTS impact_simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    crop VARCHAR(100),
    soil_type VARCHAR(50),
    area FLOAT,
    duration_months INT,
    intensity VARCHAR(20),
    organic_yield FLOAT,
    chemical_yield FLOAT,
    organic_profit FLOAT,
    chemical_profit FLOAT,
    organic_soil_health FLOAT,
    chemical_soil_health FLOAT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Future Growth Simulations
CREATE TABLE IF NOT EXISTS future_growth_simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    crop_name VARCHAR(100),
    image_path VARCHAR(255),
    disease_detected VARCHAR(100),
    initial_health_score FLOAT,
    soil_type VARCHAR(50),
    sowing_date DATE,
    state VARCHAR(100),
    district VARCHAR(100),
    simulation_results JSON,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Disease Spread Predictions
CREATE TABLE IF NOT EXISTS disease_spread_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    crop_name VARCHAR(100),
    disease_name VARCHAR(100),
    location VARCHAR(100),
    farm_size FLOAT,
    risk_7_days FLOAT,
    risk_14_days FLOAT,
    mutation_risk_score FLOAT,
    heatmap_data JSON,
    input_params JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Data Insertion
INSERT INTO crops (crop_name, common_diseases, growing_season) VALUES
('Rice', 'Leaf Blight, Blast, Brown Spot', 'June-November'),
('Tomato', 'Early Blight, Late Blight, Mosaic', 'Year-round'),
('Cotton', 'Leaf Curl, Rust, Wilt', 'June-December'),
('Wheat', 'Rust, Powdery Mildew, Septoria', 'October-April');

INSERT INTO fertilizers (fertilizer_name, type, nitrogen_content, phosphorus_content, potassium_content, cost_per_unit) VALUES
('Urea', 'chemical', 46.0, 0.0, 0.0, 5.50),
('DAP', 'chemical', 18.0, 46.0, 0.0, 12.00),
('Potash', 'chemical', 0.0, 0.0, 60.0, 15.00),
('Organic Compost', 'organic', 2.0, 1.5, 1.0, 3.00);
