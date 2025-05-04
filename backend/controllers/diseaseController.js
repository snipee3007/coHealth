const Disease = require('../models/disease_schema.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

exports.getAllDiseases = catchAsync(async (req, res, next) => {
  const Diseases = await Disease.find({}).lean();
  res.status(200).json({
    status: 'success',
    data: Diseases,
  });
});

exports.getDetailsDisease = catchAsync(async (req, res, next) => {
  const name = req.params.name;
  // console.log(name);
  const disease = await Disease.findOne({
    name: name,
  }).lean();
  res.status(200).json({
    status: 'success',
    data: disease,
  });
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

  // Log cấu trúc dữ liệu để kiểm tra
  // console.log(`Tổng số dữ liệu bệnh hợp lệ: ${allDiseases.length}`);
  if (allDiseases.length > 0) {
    // console.log(
    //   'Mẫu dữ liệu đầu tiên:',
    //   JSON.stringify(allDiseases[0], null, 2)
    // );
  }

  try {
    const inserted = await Disease.insertMany(allDiseases);

    res.status(200).json({
      status: 'success',
      results: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu bệnh:', error);

    // Chi tiết hơn về lỗi validation
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      return next(
        new AppError(`Lỗi xác thực dữ liệu: ${error.message}`, 400, {
          validationErrors,
        })
      );
    }

    return next(error);
  }
});
exports.predictDisease = async (req, res) => {
  // Lấy danh sách triệu chứng từ request
  const { symptoms } = req.body;
  // console.log(symptoms);

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Vui lòng cung cấp danh sách triệu chứng',
    });
  }

  // Chuyển mảng triệu chứng thành JSON string để truyền vào Python
  const symptomsJson = JSON.stringify(symptoms);

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
      console.error(`Lỗi khi chạy Python script (${code}): ${error}`);

      // Thử phân tích lỗi JSON nếu có
      try {
        const errorJson = JSON.parse(data);
        if (errorJson.error) {
          return res.status(400).json({
            status: 'fail',
            message: errorJson.error,
          });
        }
      } catch (e) {
        // Không phải JSON, tiếp tục xử lý
      }

      // Kiểm tra lỗi phổ biến
      if (error.includes('FileNotFoundError')) {
        return res.status(500).json({
          status: 'error',
          message: 'Không tìm thấy file model cần thiết',
          details: error,
        });
      }

      if (error.includes('Symptom') && error.includes('are not in dataset')) {
        return res.status(400).json({
          status: 'fail',
          message: 'Có triệu chứng không hợp lệ',
          details: error,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Lỗi khi dự đoán bệnh',
        error: error,
      });
    }

    try {
      // Parse kết quả JSON từ Python
      const predictions = JSON.parse(data);

      if (predictions.error) {
        return res.status(400).json({
          status: 'fail',
          message: predictions.error,
        });
      }

      // Format kết quả để hiển thị phần trăm
      const formattedPredictions = {};
      for (const [disease, probability] of Object.entries(predictions)) {
        formattedPredictions[disease] = `${(probability * 100).toFixed(2)}%`;
      }

      return res.status(200).json({
        status: 'success',
        data: {
          input_symptoms: symptoms,
          predictions: formattedPredictions,
          raw_predictions: predictions,
        },
      });
    } catch (e) {
      console.error('Lỗi khi xử lý kết quả từ Python:', e);
      console.error('Raw data from Python:', data);
      return res.status(500).json({
        status: 'error',
        message: 'Lỗi khi xử lý kết quả từ Python',
        details: e.message,
        rawData: data,
      });
    }
  });
};
