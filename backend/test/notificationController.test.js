const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
// Thay chai bằng assertion của Jest
// const { expect } = require('chai');
const sinon = require('sinon');
const notificationController = require('../controllers/notificationController');
const Notification = require('../models/notificationSchema');
const User = require('../models/users_schema');

describe('Notification Controller', () => {
  let req, res, next, findOneAndUpdateStub, findByIdAndUpdateStub;

  beforeEach(() => {
    // Thiết lập mock objects cho request, response và next
    req = {
      user: {
        _id: new ObjectId('60d21b4667d0d8992e610c85'),
      },
      params: {
        id: new ObjectId('60d21b4667d0d8992e610c86').toString(),
      },
      news: {
        _id: new ObjectId('60d21b4667d0d8992e610c87'),
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    next = sinon.spy();

    // Tạo stubs cho các phương thức của Notification model
    findOneAndUpdateStub = sinon.stub(Notification, 'findOneAndUpdate');
    findByIdAndUpdateStub = sinon.stub(Notification, 'findByIdAndUpdate');
  });

  afterEach(() => {
    // Khôi phục stubs sau mỗi test
    sinon.restore();
  });

  describe('updateReadNotification', () => {
    it('should update notification with newsID when req.news and req.user are provided', async () => {
      // Arrange
      findOneAndUpdateStub.resolves({});

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert - Sử dụng Jest với sinon
      // Test calledOnce với expect(bool).toBe(true)
      expect(findOneAndUpdateStub.calledOnce).toBe(true);
      // Test call arguments với toEqual
      expect(findOneAndUpdateStub.firstCall.args[0]).toEqual({
        newsID: req.news._id,
      });
      expect(findOneAndUpdateStub.firstCall.args[1]).toEqual({
        $set: {
          'to.$[element].haveRead': true,
        },
      });
      expect(findOneAndUpdateStub.firstCall.args[2]).toEqual({
        arrayFilters: [{ 'element.targetID': req.user._id }],
      });
      expect(next.calledOnce).toBe(true);
    });

    it('should update notification by ID when req.user is provided but req.news is not', async () => {
      // Arrange
      delete req.news;
      findByIdAndUpdateStub.resolves({});

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert - Sử dụng Jest với sinon
      expect(findByIdAndUpdateStub.calledOnce).toBe(true);
      expect(findByIdAndUpdateStub.firstCall.args[0]).toBe(req.params.id);
      expect(findByIdAndUpdateStub.firstCall.args[1]).toEqual({
        $set: {
          'to.$[element].haveRead': true,
        },
      });
      expect(findByIdAndUpdateStub.firstCall.args[2]).toEqual({
        arrayFilters: [{ 'element.targetID': req.user._id }],
      });
      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledOnce).toBe(true);
      expect(res.json.firstCall.args[0]).toEqual({
        status: 'success',
        message: 'Update read notification successful!',
      });
    });

    it('should call next middleware when neither req.news nor req.user is provided', async () => {
      // Arrange
      delete req.news;
      delete req.user;

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert - Sử dụng Jest với sinon
      expect(findOneAndUpdateStub.called).toBe(false);
      expect(findByIdAndUpdateStub.called).toBe(false);
      expect(next.calledOnce).toBe(true);
    });
  });
});
