# import os
# import sys
# import pandas as pd
# import joblib
# import numpy as np
# from tensorflow.keras.models import load_model
# import json


# # Lấy đường dẫn của thư mục chứa script
# current_dir = os.path.dirname(os.path.abspath(__file__))
# print(f"Current directory: {current_dir}")

# # Đường dẫn đến các file model
# model_path = os.path.join(current_dir, 'best_model_NeuralNetwork_Weighted.h5')
# label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
# features_path = os.path.join(current_dir, 'X_features.joblib')

# # Kiểm tra sự tồn tại của các file
# print(f"Model path exists: {os.path.exists(model_path)}")
# print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}")
# print(f"Features path exists: {os.path.exists(features_path)}")

# # Tải model và các thành phần liên quan
# try:
#     model = load_model(model_path)
#     print("Model loaded successfully")
    
#     label_encoder = joblib.load(label_encoder_path)
#     print("Label encoder loaded successfully")
    
#     feature_columns = joblib.load(features_path)
#     print("Features loaded successfully")
# except Exception as e:
#     print(f"Error loading model components: {str(e)}")
#     sys.exit(1)

# def predict_disease(symptoms):
#     """
#     Dự đoán bệnh dựa trên các triệu chứng và trả về tất cả bệnh với tỉ lệ phần trăm
    
#     Args:
#         symptoms: Danh sách các triệu chứng đầu vào
        
#     Returns:
#         Dictionary chứa tất cả các bệnh kèm xác suất phần trăm
#     """
#     # Tạo DataFrame rỗng với các cột giống như tập huấn luyện
#     input_data = pd.DataFrame(columns=feature_columns)
    
#     # Khởi tạo tất cả giá trị bằng 0
#     input_data.loc[0] = 0
    
#     # Kiểm tra triệu chứng không có trong dataset
#     valid_symptoms = []
    
#     # Đặt giá trị cho các triệu chứng người dùng nhập vào
#     for symptom in symptoms:
#         if symptom in input_data.columns:
#             input_data.loc[0, symptom] = 1
#             valid_symptoms.append(symptom)
    
#     # Dự đoán xác suất
#     probabilities = model.predict(input_data)[0]
    
#     # Ánh xạ xác suất với tên bệnh và chuyển thành phần trăm
#     disease_probabilities = {
#         label_encoder.inverse_transform([i])[0]: round(float(prob) * 100, 2) 
#         for i, prob in enumerate(probabilities)
#     }
    
#     # Sắp xếp theo xác suất giảm dần và top 3
#     sorted_diseases = dict(sorted(disease_probabilities.items(), key=lambda item: item[1], reverse=True)[:3])
    
#     # result = {
#     #     "valid_symptoms": valid_symptoms,
#     #     "all_diseases": sorted_diseases
#     # }
    
#     return sorted_diseases

# if __name__ == "__main__":
#     try:
#         if len(sys.argv) > 1:
#             # Get the symptoms from command line argument
#             symptoms_json = sys.argv[1]
#             symptoms = json.loads(symptoms_json)
            
#             # Predict diseases
#             result = predict_disease(symptoms)
            
#             # Kiểm tra nếu có lỗi
#             if "error" in result:
#                 print(json.dumps({"error": result["error"]}))
#                 sys.exit(1)
            
#             # Convert numpy types to Python native types for JSON serialization
#             final_result = {}
#             for key, value in result.items():
#                 final_result[key] = float(value)
            
#             # Print result as JSON (will be captured by Node.js)
#             print(json.dumps(final_result))
        
#     except Exception as e:
#         print(f"Lỗi: {str(e)}")
#         sys.exit(1)

import os
import sys
import pandas as pd
import joblib
import numpy as np
from tensorflow.keras.models import load_model
import json


# Lấy đường dẫn của thư mục chứa script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Chỉ in ra console với stderr để không ảnh hưởng đến stdout JSON
print(f"Current directory: {current_dir}", file=sys.stderr)

# Đường dẫn đến các file model
model_path = os.path.join(current_dir, 'best_model_NeuralNetwork_Weighted.h5')
label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
features_path = os.path.join(current_dir, 'X_features.joblib')

# Kiểm tra sự tồn tại của các file - chuyển sang stderr
print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)

# Tải model và các thành phần liên quan
try:
    model = load_model(model_path)
    print("Model loaded successfully", file=sys.stderr)
    
    label_encoder = joblib.load(label_encoder_path)
    print("Label encoder loaded successfully", file=sys.stderr)
    
    feature_columns = joblib.load(features_path)
    print("Features loaded successfully", file=sys.stderr)
except Exception as e:
    print(f"Error loading model components: {str(e)}", file=sys.stderr)
    sys.exit(1)

def predict_disease(symptoms):
    """
    Dự đoán bệnh dựa trên các triệu chứng và trả về tất cả bệnh với tỉ lệ phần trăm
    
    Args:
        symptoms: Danh sách các triệu chứng đầu vào
        
    Returns:
        Dictionary chứa tất cả các bệnh kèm xác suất phần trăm
    """
    # Tạo DataFrame rỗng với các cột giống như tập huấn luyện
    input_data = pd.DataFrame(columns=feature_columns)
    
    # Khởi tạo tất cả giá trị bằng 0
    input_data.loc[0] = 0
    
    # Kiểm tra triệu chứng không có trong dataset
    valid_symptoms = []
    
    # Đặt giá trị cho các triệu chứng người dùng nhập vào
    for symptom in symptoms:
        if symptom in input_data.columns:
            input_data.loc[0, symptom] = 1
            valid_symptoms.append(symptom)
    
    # Dự đoán xác suất
    probabilities = model.predict(input_data)[0]
    
    # Ánh xạ xác suất với tên bệnh và chuyển thành phần trăm
    disease_probabilities = {
        label_encoder.inverse_transform([i])[0]: round(float(prob) * 100, 2) 
        for i, prob in enumerate(probabilities)
    }
    
    # Sắp xếp theo xác suất giảm dần và top 3
    sorted_diseases = dict(sorted(disease_probabilities.items(), key=lambda item: item[1], reverse=True)[:3])
    
    # result = {
    #     "valid_symptoms": valid_symptoms,
    #     "all_diseases": sorted_diseases
    # }
    
    return sorted_diseases

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            # Get the symptoms from command line argument
            symptoms_json = sys.argv[1]
            symptoms = json.loads(symptoms_json)
            
            # Predict diseases
            result = predict_disease(symptoms)
            
            # Kiểm tra nếu có lỗi
            if isinstance(result, dict) and "error" in result:
                print(json.dumps({"error": result["error"]}))
                sys.exit(1)
            
            # Convert numpy types to Python native types for JSON serialization
            final_result = {}
            for key, value in result.items():
                final_result[key] = float(value)
            
            # Print result as JSON (will be captured by Node.js)
            print(json.dumps(final_result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)