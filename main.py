from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')

app = FastAPI()

# React app ke sath connection allow karne ke liye (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
model = joblib.load('fake_job_detector_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    cleaned = [lemmatizer.lemmatize(w) for w in words if w not in stop_words and len(w) > 2]
    return ' '.join(cleaned)

class JobInput(BaseModel):
    text: str
    has_logo: bool = False

@app.post("/predict")
def predict_fraud(data: JobInput):
    cleaned = clean_text(data.text)
    vectorized = vectorizer.transform([cleaned])
    
    prediction = int(model.predict(vectorized)[0])
    probability = float(model.predict_proba(vectorized)[0][1] * 100)
    
    # Risk factor rule checks
    risk_factors = []
    if not data.has_logo:
        risk_factors.append("No official logo verified")
    if re.search(r'wire transfer|starter kit|registration fee', data.text, re.IGNORECASE):
        risk_factors.append("Upfront fee or wire transfer mentioned")
        
    return {
        "prediction": prediction,
        "fraud_probability": round(probability, 2),
        "status": "FRAUDULENT" if prediction == 1 or probability > 50 else "LEGITIMATE",
        "risk_factors": risk_factors
    }