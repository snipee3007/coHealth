const express = require('express');
const commentController = require('../../controllers/commentController.js');
const authController = require('../../controllers/authController.js');

const router = express.Router();

router.route('/').post(authController.protect, commentController.createComment);
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictToAPI(['admin']),
    commentController.deleteComment
  );

module.exports = router;
