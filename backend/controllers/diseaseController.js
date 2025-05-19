const Disease = require('../models/disease_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const Symptom = require('../models/symptom_schema.js');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const returnData = require('../utils/returnData.js');

exports.getAllDiseases = catchAsync(async (req, res, next) => {
  const diseases = await Disease.find({}).lean();
  returnData(req, res, 200, diseases);
});

exports.getDetailsDisease = catchAsync(async (req, res, next) => {
  const name = req.params.name;
  // console.log(name);
  const disease = await Disease.findOne({
    name: name,
  }).lean();
  returnData(req, res, 200, disease);
});

exports.createDisease = catchAsync(async (req, res, next) => {
  const folderPath = path.join(__dirname, '../datas/diseases');
  const allFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith('.json'));
  // console.log('tất cả các file', allFiles);

  let allDiseases = [];

  for (const file of allFiles) {
    const filePath = path.join(folderPath, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');
    let diseases = JSON.parse(fileData);

    // Kiểm tra xem diseases có phải là một mảng không
    if (!Array.isArray(diseases)) {
      // Nếu là một đối tượng, chuyển đổi thành mảng chứa một phần tử
      // console.log(`File ${file} chứa một đối tượng, không phải mảng`);
      diseases = [diseases];
    }

    // Xác thực dữ liệu trước khi thêm vào mảng
    const validDiseases = diseases.filter((disease) => {
      // Kiểm tra xem disease có phải là đối tượng và có đầy đủ các trường cần thiết không
      if (
        !disease ||
        typeof disease !== 'object' ||
        // Kiểm tra trường disease hoặc name
        (!disease.disease && !disease.name) ||
        !disease.description
      ) {
        console.warn(
          `Bỏ qua bệnh không hợp lệ (thiếu tên hoặc mô tả):`,
          disease
        );
        return false;
      }
      return true;
    });

    // Chuyển đổi dữ liệu để phù hợp với schema
    const processedDiseases = validDiseases.map((disease) => ({
      // Sử dụng disease.name nếu có, nếu không thì sử dụng disease.disease
      name: disease.name || disease.disease,
      description: disease.description,
      // Thêm các trường bắt buộc khác theo schema, với giá trị mặc định nếu không có
      commonSymptoms: disease.commonSymptoms || ['Không có thông tin'],
      riskFactors: disease.riskFactors || ['Không có thông tin'],
    }));

    allDiseases = allDiseases.concat(processedDiseases);
  }

  if (allDiseases.length === 0) {
    return next(
      new AppError(
        'Không tìm thấy dữ liệu bệnh hợp lệ trong các file JSON',
        400
      )
    );
  }

  const inserted = await Disease.insertMany(allDiseases);
  returnData(req, res, 200, inserted);
});

exports.predictDisease = catchAsync(async (req, res, next) => {
  // Lấy danh sách triệu chứng từ request
  const { symptoms } = req.body;
  // console.log(symptoms);

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return next(
      new AppError('No symptom provided! Please provide some symptoms', 400)
    );
  }

  symptoms.forEach(async (symptom) => {
    const checkSymptom = await Symptom.findOne({
      symptom: symptom,
    });
    if (!checkSymptom) {
      return next(new AppError(`${symptom} symptom is not provided`, 400));
    }
  });

  // Chuyển mảng triệu chứng thành JSON string để truyền vào Python
  const symptomsJson = JSON.stringify(symptoms);
  console.log(symptomsJson);
  // Đường dẫn đến script Python
  const pythonScriptPath = path.join(
    __dirname,
    '..',
    'utils',
    'models',
    'predict_diseases.py'
  );

  // Gọi script Python
  const pythonProcess = spawn('python', [pythonScriptPath, symptomsJson]);

  let data = '';
  let error = '';

  // Xử lý dữ liệu từ Python script
  pythonProcess.stdout.on('data', (chunk) => {
    const chunkStr = chunk.toString();
    console.log('Python stdout:', chunkStr);
    data += chunkStr;
  });

  // Xử lý lỗi từ Python script
  pythonProcess.stderr.on('data', (chunk) => {
    const chunkStr = chunk.toString();
    console.error('Python stderr:', chunkStr);
    error += chunkStr;
  });

  // Khi Python script kết thúc
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    console.log('Python stdout data:', data);
    console.log('Python stderr error:', error);

    if (code !== 0) {
      console.error(`Error in run Python script (${code}): ${error}`);

      // Thử phân tích lỗi JSON nếu có
      try {
        const errorJson = JSON.parse(data);
        if (errorJson.error) {
          return next(new AppError(errorJson.error, 400));
        }
      } catch (e) {
        // Không phải JSON, tiếp tục xử lý
      }

      // Kiểm tra lỗi phổ biến
      if (error.includes('FileNotFoundError')) {
        return next(new AppError('Can not find the neccessary model!', 400));
      }

      if (error.includes('Symptom') && error.includes('are not in dataset')) {
        return next(new AppError('Invalid Symptoms', 400));
      }

      return next(
        new AppError(
          'There is some error in predict process! Please try again later!',
          400
        )
      );
    }

    const cleanedData = data.trim();

    // Tìm chuỗi JSON trong dữ liệu đầu ra (nếu có dữ liệu khác xen lẫn)
    let jsonStart = cleanedData.indexOf('{');
    let jsonEnd = cleanedData.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Invalid JSON format in Python output');
    }

    const jsonData = cleanedData.substring(jsonStart, jsonEnd + 1);
    const predictions = JSON.parse(jsonData);

    if (predictions.error) {
      return next(new AppError(predictions.error, 400));
    }

    return returnData(req, res, 200, {
      input_symptoms: symptoms,
      raw_predictions: predictions,
    });
  });

  next(new AppError('Unknown Error on Predict Disease', 500));
});
