// // modelLoader.js
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// let modelInstance = null;
// let isModelLoading = false;
// let modelLoadError = null;
// let modelLoadPromise = null;

// /**
//  * Model loader singleton that loads the ML model once and keeps it in memory
//  */
// class ModelLoader {
//   constructor() {
//     if (modelInstance) {
//       return modelInstance;
//     }

//     this.pythonProcess = null;
//     this.isReady = false;
//     this.modelLoadError = null;

//     // Initialize model loading
//     this.initializeModel();

//     modelInstance = this;
//     return this;
//   }

//   /**
//    * Kiểm tra trạng thái của mô hình
//    * @returns {Object} Trạng thái của mô hình
//    */
//   getStatus() {
//     return {
//       isReady: this.isReady,
//       isLoading: isModelLoading,
//       error: this.modelLoadError ? this.modelLoadError.message : null,
//     };
//   }

//   /**
//    * Initialize the model by starting a persistent Python process
//    */
//   initializeModel() {
//     if (isModelLoading) {
//       return modelLoadPromise;
//     }

//     isModelLoading = true;
//     console.log('Starting model initialization...');

//     modelLoadPromise = new Promise((resolve, reject) => {
//       try {
//         // Find the Python script path
//         const possiblePaths = [
//           path.join(__dirname, 'utils', 'models', 'predict_diseases.py'),
//           path.join(__dirname, '..', 'utils', 'models', 'predict_diseases.py'),
//           path.join(
//             process.cwd(),
//             'backend',
//             'utils',
//             'models',
//             'predict_diseases.py'
//           ),
//           path.join(process.cwd(), 'utils', 'models', 'predict_diseases.py'),
//         ];

//         let pythonScriptPath = null;
//         for (const testPath of possiblePaths) {
//           console.log('Testing path:', testPath);
//           if (fs.existsSync(testPath)) {
//             pythonScriptPath = testPath;
//             console.log('Found Python script at:', pythonScriptPath);
//             break;
//           }
//         }

//         if (!pythonScriptPath) {
//           const error = new Error(
//             'Python script not found in any of the tested paths'
//           );
//           console.error(error);
//           this.modelLoadError = error;
//           isModelLoading = false;
//           reject(error);
//           return;
//         }

//         // Create a simple Python loader script
//         const loaderScriptPath = path.join(
//           path.dirname(pythonScriptPath),
//           'model_loader.py'
//         );
//         const loaderScript = `
// import os
// import sys
// import json
// import pandas as pd
// import joblib
// import numpy as np
// from sklearn import __version__ as sklearn_version

// print(f"Python version: {sys.version}", file=sys.stderr)
// print(f"pandas version: {pd.__version__}", file=sys.stderr)
// print(f"numpy version: {np.__version__}", file=sys.stderr)
// print(f"joblib version: {joblib.__version__}", file=sys.stderr)
// print(f"sklearn version: {sklearn_version}", file=sys.stderr)

// try:
//     # Get the directory of this script
//     current_dir = os.path.dirname(os.path.abspath(__file__))
//     print(f"Current directory: {current_dir}", file=sys.stderr)

//     # List files in directory
//     print("Files in directory:", file=sys.stderr)
//     for file in os.listdir(current_dir):
//         print(f" - {file}", file=sys.stderr)

//     # Paths to model files
//     model_path = os.path.join(current_dir, 'optimized_GaussianNB.joblib')
//     label_encoder_path = os.path.join(current_dir, 'label_encoder.joblib')
//     features_path = os.path.join(current_dir, 'X_features.joblib')

//     # Check if files exist
//     print(f"Model path exists: {os.path.exists(model_path)}", file=sys.stderr)
//     print(f"Label encoder path exists: {os.path.exists(label_encoder_path)}", file=sys.stderr)
//     print(f"Features path exists: {os.path.exists(features_path)}", file=sys.stderr)

//     # Attempt to load the model
//     print("Loading model...", file=sys.stderr)
//     model = joblib.load(model_path)
//     print("Model loaded successfully", file=sys.stderr)

//     print("Loading label encoder...", file=sys.stderr)
//     label_encoder = joblib.load(label_encoder_path)
//     print("Label encoder loaded successfully", file=sys.stderr)

//     print("Loading features...", file=sys.stderr)
//     feature_columns = joblib.load(features_path)
//     print("Features loaded successfully", file=sys.stderr)

//     # Signal that model loading was successful
//     print(json.dumps({"status": "success", "message": "Model loaded successfully"}))

// except Exception as e:
//     print(f"Error loading model: {str(e)}", file=sys.stderr)
//     print(json.dumps({"status": "error", "message": str(e)}))
//     sys.exit(1)
//         `;

//         // Write the loader script
//         fs.writeFileSync(loaderScriptPath, loaderScript);
//         console.log('Created model loader script at:', loaderScriptPath);

//         // Determine Python command
//         const pythonCommand =
//           process.env.NODE_ENV === 'production' ? 'python3' : 'python';

//         // Execute the loader script
//         console.log(`Running ${pythonCommand} ${loaderScriptPath}`);
//         const loaderProcess = spawn(pythonCommand, [loaderScriptPath], {
//           timeout: 60000, // 60 seconds timeout for loading
//           maxBuffer: 1024 * 1024 * 10, // 10MB buffer
//         });

//         let output = '';
//         let errorOutput = '';

//         loaderProcess.stdout.on('data', (data) => {
//           const dataStr = data.toString();
//           console.log('Model loader stdout:', dataStr);
//           output += dataStr;
//         });

//         loaderProcess.stderr.on('data', (data) => {
//           const dataStr = data.toString();
//           console.log('Model loader stderr:', dataStr);
//           errorOutput += dataStr;
//         });

//         loaderProcess.on('error', (err) => {
//           console.error('Failed to start model loader process:', err);
//           this.modelLoadError = err;
//           isModelLoading = false;
//           reject(err);
//         });

//         loaderProcess.on('close', (code) => {
//           console.log(`Model loader process exited with code ${code}`);

//           if (code !== 0) {
//             const error = new Error(
//               `Model loader failed with code ${code}: ${errorOutput}`
//             );
//             console.error(error);
//             this.modelLoadError = error;
//             isModelLoading = false;
//             reject(error);
//             return;
//           }

//           try {
//             // Parse JSON response from the loader
//             const jsonMatch = output.match(/\{.*\}/s);
//             if (jsonMatch) {
//               const result = JSON.parse(jsonMatch[0]);

//               if (result.status === 'success') {
//                 console.log('Model loaded successfully');
//                 this.isReady = true;
//                 isModelLoading = false;
//                 resolve(this);
//               } else {
//                 const error = new Error(
//                   result.message || 'Unknown error during model loading'
//                 );
//                 console.error(error);
//                 this.modelLoadError = error;
//                 isModelLoading = false;
//                 reject(error);
//               }
//             } else {
//               const error = new Error('Invalid response from model loader');
//               console.error(error);
//               this.modelLoadError = error;
//               isModelLoading = false;
//               reject(error);
//             }
//           } catch (err) {
//             console.error('Error parsing model loader response:', err);
//             this.modelLoadError = err;
//             isModelLoading = false;
//             reject(err);
//           }
//         });
//       } catch (err) {
//         console.error('Error during model initialization:', err);
//         this.modelLoadError = err;
//         isModelLoading = false;
//         reject(err);
//       }
//     });

//     return modelLoadPromise;
//   }

//   /**
//    * Predict diseases based on symptoms
//    * @param {Array} symptoms - Array of symptom strings
//    * @returns {Promise} - Promise that resolves with prediction results
//    */
//   async predictDisease(symptoms) {
//     // Wait for model to be ready
//     if (!this.isReady) {
//       if (this.modelLoadError) {
//         throw new Error(`Model is not ready: ${this.modelLoadError.message}`);
//       }

//       try {
//         await modelLoadPromise;
//       } catch (err) {
//         throw new Error(`Failed to load model: ${err.message}`);
//       }
//     }

//     return new Promise((resolve, reject) => {
//       try {
//         // Find the Python script path
//         const possiblePaths = [
//           path.join(__dirname, 'utils', 'models', 'predict_diseases.py'),
//           path.join(__dirname, '..', 'utils', 'models', 'predict_diseases.py'),
//           path.join(
//             process.cwd(),
//             'backend',
//             'utils',
//             'models',
//             'predict_diseases.py'
//           ),
//           path.join(process.cwd(), 'utils', 'models', 'predict_diseases.py'),
//         ];

//         let pythonScriptPath = null;
//         for (const testPath of possiblePaths) {
//           if (fs.existsSync(testPath)) {
//             pythonScriptPath = testPath;
//             break;
//           }
//         }

//         if (!pythonScriptPath) {
//           reject(
//             new Error('Python script not found in any of the tested paths')
//           );
//           return;
//         }

//         // Convert symptoms to JSON string
//         const symptomsJson = JSON.stringify(symptoms);

//         // Determine Python command
//         const pythonCommand =
//           process.env.NODE_ENV === 'production' ? 'python3' : 'python';

//         // Execute prediction script
//         const pythonProcess = spawn(
//           pythonCommand,
//           [pythonScriptPath, symptomsJson],
//           {
//             timeout: 30000, // 30 seconds timeout
//             maxBuffer: 1024 * 1024 * 10, // 10MB buffer
//           }
//         );

//         let output = '';
//         let errorOutput = '';

//         pythonProcess.stdout.on('data', (data) => {
//           const dataStr = data.toString();
//           output += dataStr;
//         });

//         pythonProcess.stderr.on('data', (data) => {
//           const dataStr = data.toString();
//           errorOutput += dataStr;
//         });

//         pythonProcess.on('error', (err) => {
//           reject(new Error(`Failed to start Python process: ${err.message}`));
//         });

//         pythonProcess.on('close', (code) => {
//           if (code !== 0) {
//             // Try to extract error message from JSON if available
//             try {
//               const jsonMatch = output.match(/\{.*\}/s);
//               if (jsonMatch) {
//                 const errorJson = JSON.parse(jsonMatch[0]);
//                 if (errorJson.error) {
//                   reject(new Error(errorJson.error));
//                   return;
//                 }
//               }
//             } catch (e) {
//               // Not a JSON error, continue
//             }

//             reject(
//               new Error(
//                 `Python process exited with code ${code}: ${errorOutput}`
//               )
//             );
//             return;
//           }

//           try {
//             // Parse JSON from output
//             const jsonMatch = output.match(/\{.*\}/s);
//             if (!jsonMatch) {
//               reject(new Error('No JSON found in Python output'));
//               return;
//             }

//             const jsonStr = jsonMatch[0];
//             const predictions = JSON.parse(jsonStr);

//             if (predictions.error) {
//               reject(new Error(predictions.error));
//               return;
//             }

//             resolve(predictions);
//           } catch (err) {
//             reject(new Error(`Error parsing Python output: ${err.message}`));
//           }
//         });
//       } catch (err) {
//         reject(new Error(`Error in predictDisease: ${err.message}`));
//       }
//     });
//   }
// }

// // Khởi tạo model loader
// const modelLoader = new ModelLoader();

// // Export singleton instance
// module.exports = modelLoader;

// modelLoader.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const memoryMonitor = require('./memoryMonitor');

// Biến này sẽ giữ child process của model loader
let pythonProcess = null;
let isModelLoaded = false;
let modelMemoryUsage = null;

/**
 * Khởi tạo model machine learning
 * @returns {Promise} Promise sẽ resolve khi model được tải thành công
 */
function initializeModel() {
  return new Promise((resolve, reject) => {
    // Log memory trước khi tải model
    memoryMonitor.logMemoryUsage('BEFORE MODEL LOADING');

    const pythonScriptPath = path.join(
      process.cwd(),
      'backend',
      'utils',
      'models',
      'model_loader.py'
    );

    console.log(`Attempting to load model from: ${pythonScriptPath}`);
    if (!fs.existsSync(pythonScriptPath)) {
      return reject(
        new Error(`Model loader script not found at ${pythonScriptPath}`)
      );
    }

    // Xác định lệnh Python phù hợp
    const pythonCommand =
      process.env.NODE_ENV === 'production' ? 'python3' : 'python';

    pythonProcess = spawn(pythonCommand, [pythonScriptPath]);

    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      console.log(`Model Loader stderr: ${chunkStr}`);
      error += chunkStr;
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      reject(err);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python model loader process exited with code ${code}`);

      if (code !== 0) {
        return reject(
          new Error(`Model loading failed with code ${code}: ${error}`)
        );
      }

      try {
        // Parse kết quả từ Python
        const jsonMatch = data.match(/\{.*\}/s);
        if (!jsonMatch) {
          return reject(
            new Error('Could not parse JSON response from model loader')
          );
        }

        const result = JSON.parse(jsonMatch[0]);

        if (result.status === 'success') {
          isModelLoaded = true;

          // Log memory sau khi tải model
          modelMemoryUsage = memoryMonitor.logMemoryUsage(
            'AFTER MODEL LOADING'
          );

          // In ra sự thay đổi bộ nhớ
          const beforeUsage = modelMemoryUsage.process.rss;
          console.log(
            `Memory increase after loading model: ~${beforeUsage} MB`
          );

          resolve(result);
        } else {
          reject(new Error(result.message || 'Unknown error loading model'));
        }
      } catch (e) {
        reject(new Error(`Error parsing model loader response: ${e.message}`));
      }
    });
  });
}

/**
 * Dự đoán bệnh dựa trên các triệu chứng
 * @param {Array} symptoms Mảng các triệu chứng
 * @returns {Promise} Promise sẽ resolve với kết quả dự đoán
 */
function predictDisease(symptoms) {
  return new Promise((resolve, reject) => {
    // Log memory trước khi dự đoán
    memoryMonitor.logMemoryUsage('BEFORE PREDICTION');

    if (!isModelLoaded) {
      return reject(
        new Error('Model is not loaded. Please initialize the model first.')
      );
    }

    const pythonScriptPath = path.join(
      process.cwd(),
      'backend',
      'utils',
      'models',
      'predict_diseases.py'
    );

    if (!fs.existsSync(pythonScriptPath)) {
      return reject(
        new Error(`Prediction script not found at ${pythonScriptPath}`)
      );
    }

    // Chuyển mảng triệu chứng thành JSON string
    const symptomsJson = JSON.stringify(symptoms);

    // Xác định lệnh Python phù hợp
    const pythonCommand =
      process.env.NODE_ENV === 'production' ? 'python3' : 'python';

    const pythonProcess = spawn(pythonCommand, [
      pythonScriptPath,
      symptomsJson,
    ]);

    let data = '';
    let error = '';

    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      console.log(`Prediction stderr: ${chunkStr}`);
      error += chunkStr;
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python prediction process:', err);
      reject(err);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python prediction process exited with code ${code}`);

      // Log memory sau khi dự đoán
      const predictionMemoryUsage =
        memoryMonitor.logMemoryUsage('AFTER PREDICTION');

      if (code !== 0) {
        return reject(
          new Error(`Prediction failed with code ${code}: ${error}`)
        );
      }

      try {
        // Parse kết quả từ Python
        const jsonMatch = data.match(/\{.*\}/s);
        if (!jsonMatch) {
          return reject(
            new Error('Could not parse JSON response from prediction script')
          );
        }

        const result = JSON.parse(jsonMatch[0]);

        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(new Error(`Error parsing prediction response: ${e.message}`));
      }
    });
  });
}

/**
 * Trả về thông tin về bộ nhớ sử dụng của model
 */
function getModelMemoryUsage() {
  return modelMemoryUsage;
}

module.exports = {
  initializeModel,
  predictDisease,
  getModelMemoryUsage,
};
