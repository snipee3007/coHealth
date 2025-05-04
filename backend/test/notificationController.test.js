const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { expect } = require('chai');
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

      // Assert
      expect(findOneAndUpdateStub.calledOnce).to.be.true;
      expect(findOneAndUpdateStub.firstCall.args[0]).to.deep.equal({
        newsID: req.news._id,
      });
      expect(findOneAndUpdateStub.firstCall.args[1]).to.deep.equal({
        $set: {
          'to.$[element].haveRead': true,
        },
      });
      expect(findOneAndUpdateStub.firstCall.args[2]).to.deep.equal({
        arrayFilters: [{ 'element.targetID': req.user._id }],
      });
      expect(next.calledOnce).to.be.true;
    });

    it('should update notification by ID when req.user is provided but req.news is not', async () => {
      // Arrange
      delete req.news;
      findByIdAndUpdateStub.resolves({});

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert
      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(findByIdAndUpdateStub.firstCall.args[0]).to.equal(req.params.id);
      expect(findByIdAndUpdateStub.firstCall.args[1]).to.deep.equal({
        $set: {
          'to.$[element].haveRead': true,
        },
      });
      expect(findByIdAndUpdateStub.firstCall.args[2]).to.deep.equal({
        arrayFilters: [{ 'element.targetID': req.user._id }],
      });
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({
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

      // Assert
      expect(findOneAndUpdateStub.called).to.be.false;
      expect(findByIdAndUpdateStub.called).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

    it('should handle errors properly', async () => {
      // Arrange
      delete req.news;
      const error = new Error('Database error');
      findByIdAndUpdateStub.rejects(error);

      // Set up next to expect an error
      next = sinon.spy();

      // Act
      await notificationController.updateReadNotification(req, res, next);

      // Assert
      // The catchAsync wrapper should catch the error and pass it to next
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.instanceOf(Error);
    });
  });

  // Nếu cần thêm test cho các phương thức khác trong controller, có thể thêm ở đây
});
