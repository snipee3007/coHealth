
import os
import sys
import json
import pandas as pd
import joblib
import numpy as np
from sklearn import __version__ as sklearn_version

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
    
    # Paths to model files
    model_path = os.path.join(current_dir, 'decisionTreeNew.joblib')
    label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
    features_path = os.path.join(current_dir, 'X_features.joblib')
    
    # Check if files exist
    print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
    print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
    print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)
    
    # Attempt to load the model
    print("Loading model...", file=sys.stderr)
    model = joblib.load(model_path)
    print("Model loaded successfully", file=sys.stderr)
    
    print("Loading label encoder...", file=sys.stderr)
    label_encoder = joblib.load(label_encoder_path)
    print("Label encoder loaded successfully", file=sys.stderr)
    
    print("Loading features...", file=sys.stderr)
    feature_columns = joblib.load(features_path)
    print("Features loaded successfully", file=sys.stderr)
    
    # Signal that model loading was successful
    print(json.dumps({"status": "success", "message": "Model loaded successfully"}))
    
except Exception as e:
    print(f"Error loading model: {str(e)}", file=sys.stderr)
    print(json.dumps({"status": "error", "message": str(e)}))
    sys.exit(1)
        