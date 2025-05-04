import os
import sys
import json
import pandas as pd
import joblib
import numpy as np

try:
    # Lấy đường dẫn của thư mục chứa script này
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Current directory: {current_dir}", file=sys.stderr)
    print("Files in directory:", file=sys.stderr)
    for file in os.listdir(current_dir):
        print(f" - {file}", file=sys.stderr)

    # Đường dẫn đến các file model
    model_path = os.path.join(current_dir, 'decisionTreeNew.joblib')
    label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
    features_path = os.path.join(current_dir, 'X_features.joblib')

    # Kiểm tra sự tồn tại của các file
    print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
    print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
    print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)

    # Tải model và các thành phần liên quan
    model = joblib.load(model_path)
    print("Model loaded successfully", file=sys.stderr)
    
    label_encoder = joblib.load(label_encoder_path)
    print("Label encoder loaded successfully", file=sys.stderr)
    
    feature_columns = joblib.load(features_path)
    print("Features loaded successfully", file=sys.stderr)

    # Function to predict disease probabilities
    def predict_disease(symptoms):
        # Create an empty DataFrame with the same columns as X
        input_data = pd.DataFrame(columns=feature_columns)
        
        # Khởi tạo tất cả giá trị bằng 0
        input_data.loc[0] = 0
        
        # Kiểm tra triệu chứng không có trong dataset
        invalid_symptoms = []
        
        # Set the symptoms provided by the user
        for symptom in symptoms:
            if symptom in input_data.columns:
                input_data.loc[0, symptom] = 1
            else:
                invalid_symptoms.append(symptom)
        
        # Nếu có triệu chứng không hợp lệ, trả về lỗi
        if invalid_symptoms:
            error_msg = f"Các triệu chứng không có trong dataset: {', '.join(invalid_symptoms)}"
            return {"error": error_msg}
        
        # Predict probabilities
        probabilities = model.predict_proba(input_data)[0]
        
        # Map probabilities to disease names
        disease_probabilities = {label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
        
        # Get the top 3 diseases with the highest probabilities
        top_3_diseases = dict(sorted(disease_probabilities.items(), key=lambda item: item[1], reverse=True)[:3])
        
        return top_3_diseases

    # Parse input from command line argument (expects a JSON string of symptoms)
    if __name__ == "__main__":
        if len(sys.argv) > 1:
            # Get the symptoms from command line argument
            symptoms_json = sys.argv[1]
            symptoms = json.loads(symptoms_json)
            
            # Predict diseases
            result = predict_disease(symptoms)
            
            # Kiểm tra nếu có lỗi
            if "error" in result:
                print(json.dumps({"error": result["error"]}))
                sys.exit(1)
            
            # Convert numpy types to Python native types for JSON serialization
            final_result = {}
            for key, value in result.items():
                final_result[key] = float(value)
            
            # Print result as JSON (will be captured by Node.js)
            print(json.dumps(final_result))
        else:
            print(json.dumps({"error": "No symptoms provided"}))
            sys.exit(1)
except Exception as e:
    error_message = f"Error in Python script: {str(e)}"
    print(error_message, file=sys.stderr)
    print(json.dumps({"error": error_message}))
    sys.exit(1)