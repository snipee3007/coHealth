const express = require('express');
const authController = require('../controllers/authController.js');
const doctorController = require('../controllers/doctorController.js');
const template = require('../controllers/templateController.js');
const chatToDoctor = require('../controllers/chatToDoctorController.js');
const router = express.Router();

// create doctor
// router.post('doctor/create', doctorController.createDoctor);
// router.get('doctor/get', doctorController.getAllDoctors);
// router.route('/recommendDoctor/:name').get( doctorController.getRecommendDoctor);
// router.route('/getDoctor/:name').get( doctorController.getDoctor);

// chat to doctor 
// create chatRoom with doctor
router.post('/room/c', authController.protect, chatToDoctor.createChatRoom);

router.get('/room/:roomCode', authController.protect, chatToDoctor.getMessageInRoom)

router.get('/room',authController.protect, chatToDoctor.getAllChatRoomByUserID);

router.get('/room/g/:slug', authController.protect, chatToDoctor.getThisChatRoom)

router.post('/', authController.protect, chatToDoctor.createMessage);

router.get('/', 
    authController.protect, 
    chatToDoctor.getAllChatRoomByUserID, 
    template.getListOfChatTemplate);

module.exports = router;
