import os
import sys
import json
import pandas as pd
import joblib
import numpy as np
from sklearn import __version__ as sklearn_version
import psutil
import gc
import traceback  # Thêm traceback để ghi chi tiết lỗi

# Function để track memory usage trong Python
def get_memory_usage():
    """Get memory usage của Python process hiện tại"""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    # Convert bytes thành MB
    memory_mb = memory_info.rss / 1024 / 1024
    
    return {
        "rss_mb": round(memory_mb, 2),
        "percent": round(process.memory_percent(), 2)
    }

def log_memory_usage(label):
    """Log memory usage with label"""
    mem = get_memory_usage()
    print(f"===== PYTHON MEMORY [{label}] =====", file=sys.stderr)
    print(f"Memory: {mem['rss_mb']} MB ({mem['percent']}%)", file=sys.stderr)
    print("================================", file=sys.stderr)
    return mem

# Log memory usage at start
log_memory_usage("START")

print(f"Python version: {sys.version}", file=sys.stderr)
print(f"pandas version: {pd.__version__}", file=sys.stderr)
print(f"numpy version: {np.__version__}", file=sys.stderr)
print(f"joblib version: {joblib.__version__}", file=sys.stderr)
print(f"sklearn version: {sklearn_version}", file=sys.stderr)

# Global variables for model components
model = None
label_encoder = None
feature_columns = None

def load_model():
    """Load the model and associated components"""
    global model, label_encoder, feature_columns
    
    # Log memory trước khi load model
    log_memory_usage("BEFORE MODEL LOAD")
    
    try:
        # Get current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"Current directory: {current_dir}", file=sys.stderr)
        
        # Define model file paths
        model_path = os.path.join(current_dir, 'optimized_GaussianNB.joblib')
        label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
        features_path = os.path.join(current_dir, 'X_features.joblib')
        
        # Check if files exist
        print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
        print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
        print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)
        
        # Load the model
        print("Loading model...", file=sys.stderr)
        model = joblib.load(model_path)
        print(f"Model loaded successfully. Type: {type(model)}", file=sys.stderr)
        # Kiểm tra xem model có phải là None không
        if model is None:
            print("WARNING: Model loaded but is None!", file=sys.stderr)
            return False, None
        
        # Kiểm tra xem model có method predict_proba không
        if not hasattr(model, 'predict_proba'):
            print(f"WARNING: Model does not have predict_proba method! Model type: {type(model)}", file=sys.stderr)
            return False, None
        
        # Log memory sau khi load model
        log_memory_usage("AFTER MODEL LOAD")
        
        # Load label encoder
        print("Loading label encoder...", file=sys.stderr)
        label_encoder = joblib.load(label_encoder_path)
        print(f"Label encoder loaded successfully. Type: {type(label_encoder)}", file=sys.stderr)
        
        # Log memory sau khi load label encoder
        log_memory_usage("AFTER LABEL ENCODER LOAD")
        
        # Load features
        print("Loading features...", file=sys.stderr)
        feature_columns = joblib.load(features_path)
        print("Features loaded successfully", file=sys.stderr)
        print(f"Feature columns type: {type(feature_columns)}", file=sys.stderr)
        print(f"Feature columns length: {len(feature_columns)}", file=sys.stderr)
        
        # Log memory sau khi load tất cả
        mem_info = log_memory_usage("AFTER FEATURES LOAD")
        
        return True, mem_info
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)  # In traceback để debug
        return False, None

def predict_disease(symptoms):
    """Predict disease based on symptoms"""
    global model, label_encoder, feature_columns
    
    # Log memory trước khi dự đoán
    log_memory_usage("BEFORE PREDICTION")
    
    # Load model if not already loaded
    if model is None or label_encoder is None or feature_columns is None:
        print("Model components not loaded, attempting to load now...", file=sys.stderr)
        success, _ = load_model()
        if not success:
            return {"error": "Failed to load model. Please check the server logs."}
    
    # Double-check if model is loaded properly
    if model is None:
        return {"error": "Model failed to load or is None"}
    
    # Double-check if model has predict_proba method
    if not hasattr(model, 'predict_proba'):
        return {"error": f"Model does not have predict_proba method. Model type: {type(model)}"}
    
    try:
        # Create an empty DataFrame with the same columns as the training data
        input_data = pd.DataFrame(columns=feature_columns)
        
        # Initialize all values to 0
        input_data.loc[0] = 0
        
        # Check for invalid symptoms
        invalid_symptoms = []
        
        # Set the symptoms provided by the user
        for symptom in symptoms:
            if symptom in input_data.columns:
                input_data.loc[0, symptom] = 1
            else:
                invalid_symptoms.append(symptom)
        
        # Return error if there are invalid symptoms
        if invalid_symptoms:
            error_msg = f"Các triệu chứng không có trong dataset: {', '.join(invalid_symptoms)}"
            return {"error": error_msg}
        
        # Debug info
        print(f"Input data shape: {input_data.shape}", file=sys.stderr)
        print(f"Input data columns: {len(input_data.columns)}", file=sys.stderr)
        print(f"Input symptoms: {symptoms}", file=sys.stderr)
        
        # Predict probabilities
        try:
            # Log memory trước khi chạy predict_proba
            log_memory_usage("BEFORE PREDICT_PROBA")
            
            # Print model type for debugging
            print(f"Using model of type: {type(model)}", file=sys.stderr)
            
            # Check input data for NaN values
            if input_data.isnull().values.any():
                print("WARNING: Input data contains NaN values", file=sys.stderr)
                input_data.fillna(0, inplace=True)  # Fill NaN with 0
            
            # Ensure input data has all required features
            missing_cols = set(feature_columns) - set(input_data.columns)
            if missing_cols:
                print(f"WARNING: Input data missing columns: {missing_cols}", file=sys.stderr)
                for col in missing_cols:
                    input_data[col] = 0
            
            # Ensure columns are in the same order as during training
            input_data = input_data[feature_columns]
            
            # Try to predict
            probabilities = model.predict_proba(input_data)[0]
            print(f"Prediction successful, probabilities shape: {probabilities.shape}", file=sys.stderr)
            
            # Log memory sau khi chạy predict_proba
            log_memory_usage("AFTER PREDICT_PROBA")
        except Exception as e:
            traceback.print_exc(file=sys.stderr)  # Print detailed error traceback
            print(f"Error during prediction: {str(e)}", file=sys.stderr)
            return {"error": f"Lỗi khi dự đoán: {str(e)}"}
        
        # Map probabilities to disease names
        try:
            disease_probabilities = {label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
            print(f"Mapped to {len(disease_probabilities)} diseases", file=sys.stderr)
        except Exception as e:
            traceback.print_exc(file=sys.stderr)  # Print detailed error traceback
            print(f"Error during label transformation: {str(e)}", file=sys.stderr)
            return {"error": f"Lỗi khi chuyển đổi nhãn: {str(e)}"}
        
        # Get the top 3 diseases with the highest probabilities
        top_3_diseases = dict(sorted(disease_probabilities.items(), key=lambda item: item[1], reverse=True)[:3])
        
        # Force garbage collection
        gc.collect()
        
        # Log memory sau khi hoàn thành
        log_memory_usage("AFTER PREDICTION COMPLETE")
        
        return top_3_diseases
    except Exception as e:
        traceback.print_exc(file=sys.stderr)  # Print detailed error traceback
        print(f"Error in predict_disease: {str(e)}", file=sys.stderr)
        return {"error": f"Lỗi không xác định: {str(e)}"}

if __name__ == "__main__":
    # Log memory at script start
    start_mem = log_memory_usage("SCRIPT_START")
    
    try:
        # Nếu script này là model_loader.py
        if os.path.basename(__file__) == "model_loader.py":
            success, mem_info = load_model()
            
            if success:
                # Tính toán memory sử dụng bởi model
                memory_used = mem_info["rss_mb"] - start_mem["rss_mb"]
                
                # In memory sau khi tải thành công
                print(f"Model loading complete! Memory used: {memory_used} MB", file=sys.stderr)
                print(json.dumps({
                    "status": "success", 
                    "message": "Model loaded successfully",
                    "memory": {
                        "total_mb": mem_info["rss_mb"],
                        "model_overhead_mb": memory_used
                    }
                }))
            else:
                print(json.dumps({"status": "error", "message": "Failed to load model"}))
                sys.exit(1)
        
        # Nếu script này là predict_diseases.py
        elif len(sys.argv) > 1:
            # Get the symptoms from command line argument
            symptoms_json = sys.argv[1]
            print(f"Received symptoms JSON: {symptoms_json}", file=sys.stderr)
            
            try:
                symptoms = json.loads(symptoms_json)
                print(f"Parsed symptoms: {symptoms}", file=sys.stderr)
            except json.JSONDecodeError as e:
                error_message = f"Invalid JSON format: {str(e)}"
                print(error_message, file=sys.stderr)
                print(json.dumps({"error": error_message}))
                sys.exit(1)
            
            # Đảm bảo model được load trước khi dự đoán
            if model is None:
                success, _ = load_model()
                if not success:
                    print(json.dumps({"error": "Failed to load model before prediction"}))
                    sys.exit(1)
            
            # Predict diseases
            result = predict_disease(symptoms)
            
            # Check for errors
            if "error" in result:
                print(f"Error in prediction: {result['error']}", file=sys.stderr)
                print(json.dumps({"error": result["error"]}))
                sys.exit(1)
            
            # Convert numpy types to Python native types for JSON serialization
            final_result = {}
            for key, value in result.items():
                final_result[key] = float(value)
            
            # Print memory info
            final_mem = log_memory_usage("FINAL")
            memory_used = final_mem["rss_mb"] - start_mem["rss_mb"]
            print(f"Prediction complete! Memory used: {memory_used} MB", file=sys.stderr)
            
            # Print result as JSON (will be captured by Node.js)
            print(f"Final result: {final_result}", file=sys.stderr)
            print(json.dumps(final_result))
        else:
            print(json.dumps({"error": "No symptoms provided"}))
            sys.exit(1)
    except Exception as e:
        traceback.print_exc(file=sys.stderr)  # Print detailed error traceback
        error_message = f"Error in Python script: {str(e)}"
        print(error_message, file=sys.stderr)
        print(json.dumps({"error": error_message}))
        sys.exit(1)