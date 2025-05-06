
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
        
    # THÊM ĐOẠN MÃ KIỂM TRA QUYỀN FILE TẠI ĐÂY
    print("Checking file permissions:", file=sys.stderr)
    for file in ['decisionTreeNew.joblib', 'label_encoder.joblib', 'X_features.joblib']:
        file_path = os.path.join(current_dir, file)
        if os.path.exists(file_path):
            # Hiển thị quyền ở dạng số (ví dụ: 644 = rw-r--r--)
            file_perms = os.stat(file_path).st_mode & 0o777
            print(f" - {file}: {oct(file_perms)[2:]} (user: {os.access(file_path, os.R_OK)}, process can read: {os.access(file_path, os.R_OK)})", file=sys.stderr)
            
            # Thử mở file để đọc trực tiếp (không dùng joblib)
            try:
                with open(file_path, 'rb') as f:
                    # Chỉ đọc 100 byte đầu tiên để kiểm tra
                    f.read(100)
                print(f"   ✓ File can be opened and read", file=sys.stderr)
            except Exception as e:
                print(f"   ✗ Error opening file: {str(e)}", file=sys.stderr)
        else:
            print(f" - {file}: NOT FOUND", file=sys.stderr)
    
    # Kiểm tra user và group của process
    import getpass
    print(f"Process running as user: {getpass.getuser()}", file=sys.stderr)
    print(f"Process UID: {os.getuid()}, GID: {os.getgid()}", file=sys.stderr)
    
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
        