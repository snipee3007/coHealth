import os
import sys
import json
import pandas as pd
import joblib
import numpy as np
from sklearn import __version__ as sklearn_version
import traceback  # Thêm traceback để in chi tiết lỗi

print(f"Python version: {sys.version}", file=sys.stderr)
print(f"pandas version: {pd.__version__}", file=sys.stderr)
print(f"numpy version: {np.__version__}", file=sys.stderr)
print(f"joblib version: {joblib.__version__}", file=sys.stderr)
print(f"sklearn version: {sklearn_version}", file=sys.stderr)

try:
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Current directory: {current_dir}", file=sys.stderr)
    
    # List files in directory
    print("Files in directory:", file=sys.stderr)
    for file in os.listdir(current_dir):
        print(f" - {file}", file=sys.stderr)
        
    # Kiểm tra kích thước các file
    for file_name in ['optimized_GaussianNB.joblib', 'label_encoder.joblib', 'X_features.joblib']:
        file_path = os.path.join(current_dir, file_name)
        if os.path.exists(file_path):
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            print(f"File {file_name} size: {size_mb:.2f} MB", file=sys.stderr)
        else:
            print(f"File {file_name} not found", file=sys.stderr)

    # Hiển thị thông tin bộ nhớ
    try:
        import psutil
        print("Memory info:", file=sys.stderr)
        print(f"Available: {psutil.virtual_memory().available / (1024 * 1024):.2f} MB", file=sys.stderr)
        print(f"Used: {psutil.virtual_memory().used / (1024 * 1024):.2f} MB", file=sys.stderr)
        print(f"Total: {psutil.virtual_memory().total / (1024 * 1024):.2f} MB", file=sys.stderr)
        print(f"Percent used: {psutil.virtual_memory().percent}%", file=sys.stderr)
    except ImportError:
        print("psutil not installed, skipping memory check", file=sys.stderr)
    
    # Paths to model files
    model_path = os.path.join(current_dir, 'optimized_GaussianNB.joblib')
    label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
    features_path = os.path.join(current_dir, 'X_features.joblib')
    
    # Check if files exist
    print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
    print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
    print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)
    
    try:
        print("Attempting to load model...", file=sys.stderr)
        model = joblib.load(model_path)
        print(f"Model loaded successfully. Type: {type(model)}", file=sys.stderr)
        
        # Kiểm tra xem model có phải là None không
        if model is None:
            raise ValueError("Model loaded but is None!")
        
        # Kiểm tra xem model có method predict_proba không
        if not hasattr(model, 'predict_proba'):
            raise ValueError(f"Model does not have predict_proba method! Model type: {type(model)}")
            
    except Exception as e:
        import traceback
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        print("Traceback:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        # Signal error but continue to try loading other components
        print(json.dumps({"status": "error", "message": f"Error loading model: {str(e)}"}))
        sys.exit(1)
    
    print("Loading label encoder...", file=sys.stderr)
    try:
        label_encoder = joblib.load(label_encoder_path)
        print(f"Label encoder loaded successfully. Type: {type(label_encoder)}", file=sys.stderr)
    except Exception as e:
        print(f"Error loading label encoder: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"status": "error", "message": f"Error loading label encoder: {str(e)}"}))
        sys.exit(1)
    
    print("Loading features...", file=sys.stderr)
    try:
        feature_columns = joblib.load(features_path)
        print(f"Features loaded successfully. Type: {type(feature_columns)}", file=sys.stderr)
        print(f"Feature columns length: {len(feature_columns)}", file=sys.stderr)
    except Exception as e:
        print(f"Error loading features: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"status": "error", "message": f"Error loading features: {str(e)}"}))
        sys.exit(1)
    
    # Signal that model loading was successful
    print(json.dumps({"status": "success", "message": "Model loaded successfully"}))
    
except Exception as e:
    print(f"Error loading model: {str(e)}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)  # In chi tiết lỗi để debug
    print(json.dumps({"status": "error", "message": str(e)}))
    sys.exit(1)