# import os
# import sys
# import json
# import pandas as pd
# import joblib
# import numpy as np
# from sklearn import __version__ as sklearn_version  # Thêm import sklearn
# # import tracemalloc
# # tracemalloc.start()
# # train your tree


# print(f"Python version: {sys.version}", file=sys.stderr)
# print(f"pandas version: {pd.__version__}", file=sys.stderr)
# print(f"numpy version: {np.__version__}", file=sys.stderr)
# print(f"joblib version: {joblib.__version__}", file=sys.stderr)
# print(f"sklearn version: {sklearn_version}", file=sys.stderr)

# try:
#     # Lấy đường dẫn của thư mục chứa script này
#     current_dir = os.path.dirname(os.path.abspath(__file__))
#     print(f"Current directory: {current_dir}", file=sys.stderr)
#     print("Files in directory:", file=sys.stderr)
#     for file in os.listdir(current_dir):
#         print(f" - {file}", file=sys.stderr)

#     # Đường dẫn đến các file model
#     model_path = os.path.join(current_dir, 'decisionTreeNew.joblib')
#     label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
#     features_path = os.path.join(current_dir, 'X_features.joblib')

#     # Kiểm tra sự tồn tại của các file
#     print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
#     print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
#     print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)

#     # Tải model và các thành phần liên quan
#     model = joblib.load(model_path)
#     print("Model loaded successfully", file=sys.stderr)
    
#     label_encoder = joblib.load(label_encoder_path)
#     print("Label encoder loaded successfully", file=sys.stderr)
    
#     feature_columns = joblib.load(features_path)
#     print("Features loaded successfully", file=sys.stderr)
#     print(f"Feature columns type: {type(feature_columns)}", file=sys.stderr)
#     print(f"Feature columns length: {len(feature_columns)}", file=sys.stderr)
#     print(f"First few features: {feature_columns[:5] if isinstance(feature_columns, list) else 'Not a list'}", file=sys.stderr)

#     # Function to predict disease probabilities
#     def predict_disease(symptoms):
#         # Create an empty DataFrame with the same columns as X
#         input_data = pd.DataFrame(columns=feature_columns)
        
#         # Khởi tạo tất cả giá trị bằng 0
#         input_data.loc[0] = 0
        
#         # Kiểm tra triệu chứng không có trong dataset
#         invalid_symptoms = []
        
#         # Set the symptoms provided by the user
#         for symptom in symptoms:
#             if symptom in input_data.columns:
#                 input_data.loc[0, symptom] = 1
#             else:
#                 invalid_symptoms.append(symptom)
        
#         # Nếu có triệu chứng không hợp lệ, trả về lỗi
#         if invalid_symptoms:
#             error_msg = f"Các triệu chứng không có trong dataset: {', '.join(invalid_symptoms)}"
#             return {"error": error_msg}
        
#         # In ra để debug
#         print(f"Input data shape: {input_data.shape}", file=sys.stderr)
#         print(f"Input data columns: {len(input_data.columns)}", file=sys.stderr)
#         print(f"Input symptoms: {symptoms}", file=sys.stderr)
        
#         # Predict probabilities
#         try:
#             probabilities = model.predict_proba(input_data)[0]
#             print(f"Prediction successful, probabilities shape: {probabilities.shape}", file=sys.stderr)
#         except Exception as e:
#             print(f"Error during prediction: {str(e)}", file=sys.stderr)
#             return {"error": f"Lỗi khi dự đoán: {str(e)}"}
        
#         # Map probabilities to disease names
#         try:
#             disease_probabilities = {label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
#             print(f"Mapped to {len(disease_probabilities)} diseases", file=sys.stderr)
#         except Exception as e:
#             print(f"Error during label transformation: {str(e)}", file=sys.stderr)
#             return {"error": f"Lỗi khi chuyển đổi nhãn: {str(e)}"}
        
#         # Get the top 3 diseases with the highest probabilities
#         top_3_diseases = dict(sorted(disease_probabilities.items(), key=lambda item: item[1], reverse=True)[:3])
        
#         return top_3_diseases

#     # Parse input from command line argument (expects a JSON string of symptoms)
#     if __name__ == "__main__":
#         if len(sys.argv) > 1:
#             # Get the symptoms from command line argument
#             symptoms_json = sys.argv[1]
#             print(f"Received symptoms JSON: {symptoms_json}", file=sys.stderr)
            
#             try:
#                 symptoms = json.loads(symptoms_json)
#                 print(f"Parsed symptoms: {symptoms}", file=sys.stderr)
#             except json.JSONDecodeError as e:
#                 error_message = f"Invalid JSON format: {str(e)}"
#                 print(error_message, file=sys.stderr)
#                 print(json.dumps({"error": error_message}))
#                 sys.exit(1)
            
#             # Predict diseases
#             result = predict_disease(symptoms)
            
#             # Kiểm tra nếu có lỗi
#             if "error" in result:
#                 print(f"Error in prediction: {result['error']}", file=sys.stderr)
#                 print(json.dumps({"error": result["error"]}))
#                 sys.exit(1)
            
#             # Convert numpy types to Python native types for JSON serialization
#             final_result = {}
#             for key, value in result.items():
#                 final_result[key] = float(value)
            
#             # Print result as JSON (will be captured by Node.js)
#             print(f"Final result: {final_result}", file=sys.stderr)
#             print(json.dumps(final_result))
#         else:
#             print(json.dumps({"error": "No symptoms provided"}))
#             sys.exit(1)
# except Exception as e:
#     error_message = f"Error in Python script: {str(e)}"
#     print(error_message, file=sys.stderr)
#     print(json.dumps({"error": error_message}))
#     sys.exit(1)

import os
import sys
import json
import pandas as pd
import joblib
import numpy as np
from sklearn import __version__ as sklearn_version
import psutil
import gc

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
        model_path = os.path.join(current_dir, 'decisionTreeNew.joblib')
        label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
        features_path = os.path.join(current_dir, 'X_features.joblib')
        
        # Check if files exist
        print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
        print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
        print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)
        
        # Load the model
        print("Loading model...", file=sys.stderr)
        model = joblib.load(model_path)
        print("Model loaded successfully", file=sys.stderr)
        
        # Log memory sau khi load model
        log_memory_usage("AFTER MODEL LOAD")
        
        # Load label encoder
        print("Loading label encoder...", file=sys.stderr)
        label_encoder = joblib.load(label_encoder_path)
        print("Label encoder loaded successfully", file=sys.stderr)
        
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
        return False, None

def predict_disease(symptoms):
    """Predict disease based on symptoms"""
    global model, label_encoder, feature_columns
    
    # Log memory trước khi dự đoán
    log_memory_usage("BEFORE PREDICTION")
    
    # Load model if not already loaded
    if model is None or label_encoder is None or feature_columns is None:
        success, _ = load_model()
        if not success:
            return {"error": "Failed to load model"}
    
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
            
            probabilities = model.predict_proba(input_data)[0]
            print(f"Prediction successful, probabilities shape: {probabilities.shape}", file=sys.stderr)
            
            # Log memory sau khi chạy predict_proba
            log_memory_usage("AFTER PREDICT_PROBA")
        except Exception as e:
            print(f"Error during prediction: {str(e)}", file=sys.stderr)
            return {"error": f"Lỗi khi dự đoán: {str(e)}"}
        
        # Map probabilities to disease names
        try:
            disease_probabilities = {label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
            print(f"Mapped to {len(disease_probabilities)} diseases", file=sys.stderr)
        except Exception as e:
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
        error_message = f"Error in Python script: {str(e)}"
        print(error_message, file=sys.stderr)
        print(json.dumps({"error": error_message}))
        sys.exit(1)