# import the frameworks and library
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import os

app = FastAPI()

# --- ADD CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (perfect for dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load the trained model
try:
    rf_model = joblib.load('seo_classifier_model.pkl')
    scaler = joblib.load('seo_scaler.pkl')
    print("✅ Model and Scaler loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# feature trained in machine
class SeoData(BaseModel):
    performance_score: float
    accessibility_score: float
    best_practices_score: float
    lcp_lab: float
    cls_lab: float
    inp_lab: float
    fcp_lab: float
    ttfb_lab: float
    form_factor: str # 'mobile' or 'desktop'

# to call the predict based on the information ge from optimizer 
@app.post("/predict")
def predict_seo(data: SeoData):
    try:
        # 2. Preprocess Data
        # Binary Encoding for form_factor
        form_factor_binary = 1 if data.form_factor == 'mobile' else 0
        
        # Create DataFrame
        input_data = {
            'performance_score': [data.performance_score],
            'accessibility_score': [data.accessibility_score],
            'best_practices_score': [data.best_practices_score],
            'lcp_lab': [data.lcp_lab],
            'cls_lab': [data.cls_lab],
            'inp_lab': [data.inp_lab],
            'fcp_lab': [data.fcp_lab],
            'ttfb_lab': [data.ttfb_lab]
        }
        df = pd.DataFrame(input_data)
        
        # Scale numerical features
        cols_to_scale = list(input_data.keys())
        df[cols_to_scale] = scaler.transform(df[cols_to_scale])
        
        # Add binary column
        df['form_factor_binary'] = form_factor_binary
        
        # 3. Predict
        prediction = rf_model.predict(df)[0]
        
        # Get probabilities (confidence)
        probabilities = rf_model.predict_proba(df)[0]
        confidence = max(probabilities) * 100
#return the result
        return {
            "category": prediction, # "Good", "Average", "Poor"
            "confidence": round(confidence, 2),
            "features": input_data # Echo back for UI
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


# the port to run the app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)