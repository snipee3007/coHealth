// Import the necessary modules for testing
import { jest } from '@jest/globals';
import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';
import Socket from './socketController.js';
import axios from 'axios';
import _ from 'lodash';

// Mock the dependencies
jest.mock('./utils/popup.js');
jest.mock('./utils/loader.js');
jest.mock('./socketController.js');
jest.mock('axios');
jest.mock('lodash', () => ({
  debounce: jest.fn((fn) => fn),
}));

// Mock socket.io
const mockOn = jest.fn();
const mockEmit = jest.fn();
global.io = jest.fn(() => ({
  on: mockOn,
  emit: mockEmit,
}));

// Helper to setup DOM elements needed for tests
function setupDom() {
  document.body.innerHTML = `
    <div class="chatBoxInfo border-b-2"></div>
    <div class="listOfChat"></div>
    <div class="text hidden">
      <form>
        <input type="text" value="Hello world">
      </form>
    </div>
    <div class="listUser">
      <button id="room1" class="listChat" data-slug="user1">
        <div class="status online"></div>
        <span class="lastMessage">Previous message</span>
        <span class="lastMessageTime">1 hour ago</span>
      </button>
      <button id="room2" class="listChat" data-slug="user2">
        <div class="status offline"></div>
        <span class="lastMessage">Hi there</span>
        <span class="lastMessageTime">2 hours ago</span>
      </button>
    </div>
  `;
}

// Import the module to test (needs to be reloaded after mocks are set up)
let ListOfChat;
// This function simulates reloading the module under test
function reimportModule() {
  jest.isolateModules(() => {
    require('./listOfChatController.js');
    ListOfChat = require('./listOfChatController.js').default;
  });
}

describe('ListOfChat Controller Tests', () => {
  let originalDateNow;

  beforeEach(() => {
    setupDom();
    originalDateNow = Date.now;
    // Mock Date.now for consistent time-based tests
    Date.now = jest.fn(() => new Date('2025-05-04T12:00:00Z').getTime());

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
    document.body.innerHTML = '';
  });

  describe('Socket event handlers', () => {
    test('should handle receiveMessage event for active chat', () => {
      // Setup
      document.querySelector('.chatBoxInfo').innerHTML =
        '<div data-room="room1"></div>';

      // Get the socket.on callback for receiveMessage
      const socketCallbacks = {};
      mockOn.mockImplementation((event, callback) => {
        socketCallbacks[event] = callback;
      });

      // Re-import to register socket event handlers
      reimportModule();

      // Call the socket callback
      socketCallbacks.receiveMessage('New message from user1', 'room1');

      // Assertions
      expect(document.querySelector('.listOfChat').innerHTML).toContain(
        '<div class= "sender"> New message from user1</div>'
      );
      expect(document.querySelector('#room1 .lastMessage').textContent).toBe(
        'New message from user1'
      );
      expect(
        document.querySelector('#room1 .lastMessageTime').textContent
      ).toBe('1 minute ago');
      expect(document.querySelector('.listUser').firstChild.id).toBe('room1');
    });

    test('should handle receiveMessage event for inactive chat', () => {
      // Setup
      document.querySelector('.chatBoxInfo').innerHTML =
        '<div data-room="room2"></div>';

      // Get the socket.on callback for receiveMessage
      const socketCallbacks = {};
      mockOn.mockImplementation((event, callback) => {
        socketCallbacks[event] = callback;
      });

      // Re-import to register socket event handlers
      reimportModule();

      // Call the socket callback
      socketCallbacks.receiveMessage('New message from user1', 'room1');

      // Assertions
      expect(document.querySelector('.listOfChat').innerHTML).not.toContain(
        'New message from user1'
      );
      expect(document.querySelector('#room1 .lastMessage').textContent).toBe(
        'New message from user1'
      );
      expect(
        document.querySelector('#room1 .lastMessageTime').textContent
      ).toBe('1 minute ago');
      expect(document.querySelector('.listUser').firstChild.id).toBe('room1');
    });

    test('should handle getUsers event', () => {
      // Setup
      const socketCallbacks = {};
      mockOn.mockImplementation((event, callback) => {
        socketCallbacks[event] = callback;
      });

      // Re-import to register socket event handlers
      reimportModule();

      // Call the socket callback
      socketCallbacks.getUsers([
        { slug: 'user1', status: 'offline' },
        { slug: 'user2', status: 'online' },
      ]);

      // Assertions
      expect(
        document
          .querySelector('button[data-slug="user1"] .status')
          .classList.contains('offline')
      ).toBeTruthy();
      expect(
        document
          .querySelector('button[data-slug="user2"] .status')
          .classList.contains('online')
      ).toBeTruthy();
    });
  });

  describe('Chat interaction tests', () => {
    test('should get messages when clicking on a chat', async () => {
      // Setup mock axios response
      axios.mockResolvedValue({
        data: {
          data: {
            memberID: [
              {
                slug: 'user1',
                fullname: 'User One',
                image: 'user1.jpg',
                status: 'online',
                lastSeen: '2025-05-04T11:55:00Z',
              },
              {
                slug: 'currentUser',
                fullname: 'Current User',
                image: 'current.jpg',
                status: 'online',
                lastSeen: '2025-05-04T11:58:00Z',
              },
            ],
            message: [
              { senderID: { slug: 'user1' }, message: 'Hi there' },
              { senderID: { slug: 'currentUser' }, message: 'Hello!' },
            ],
          },
        },
      });

      // Re-import to register click handlers
      reimportModule();

      // Simulate click on a chat
      document.querySelector('#room1').click();

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assertions
      expect(mockEmit).toHaveBeenCalledWith('joinRoom', 'room1');
      expect(Loader.create).toHaveBeenCalled();
      expect(Loader.destroy).toHaveBeenCalled();
      expect(
        document.querySelector('.text').classList.contains('hidden')
      ).toBeFalsy();
      expect(document.querySelector('.chatBoxInfo').innerHTML).toContain(
        'User One'
      );
      expect(document.querySelector('.listOfChat').innerHTML).toContain(
        '<div class = "sender"> Hi there </div>'
      );
      expect(document.querySelector('.listOfChat').innerHTML).toContain(
        '<div class= "user"> Hello!</div>'
      );
    });

    test('should send message when submitting the form', () => {
      // Setup
      document.querySelector('.chatBoxInfo').innerHTML =
        '<div data-room="room1"></div>';

      // Re-import to register form submit handler
      reimportModule();

      // Set private roomCode value (this is a workaround since it's private in the actual class)
      document
        .querySelector('.chatBoxInfo')
        .firstElementChild.setAttribute('data-room', 'room1');

      // Submit the form
      document.querySelector('form').dispatchEvent(new Event('submit'));

      // Assertions
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/room/message/create',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          roomCode: 'room1',
          message: 'Hello world',
        },
      });
      expect(mockEmit).toHaveBeenCalledWith(
        'sendMessage',
        'Hello world',
        'room1'
      );
      expect(Socket.newMessage).toHaveBeenCalledWith('room1');
      expect(document.querySelector('.listOfChat').innerHTML).toContain(
        '<div class= "user"> Hello world</div>'
      );
      expect(document.querySelector('.text input').value).toBe('');
    });
  });

  describe('Time formatting tests', () => {
    test('should format times correctly', () => {
      // Re-import to access timeAgo function
      reimportModule();

      // Note: We can't directly test the private timeAgo function
      // This is an architectural limitation in the original code
      // A better approach would be to export the timeAgo function
      // For now, we'll test the behavior indirectly through the socket event handler

      const socketCallbacks = {};
      mockOn.mockImplementation((event, callback) => {
        socketCallbacks[event] = callback;
      });

      // Set current time
      Date.now = jest.fn(() => new Date('2025-05-04T12:00:00Z').getTime());

      // Test with different time differences
      socketCallbacks.receiveMessage('1 minute test', 'room1');
      expect(
        document.querySelector('#room1 .lastMessageTime').textContent
      ).toBe('1 minute ago');

      // Unfortunately, we can't easily test other time formats without refactoring the original code
    });
  });

  describe('Error handling', () => {
    test('should handle errors when sending messages', async () => {
      // Setup
      document.querySelector('.chatBoxInfo').innerHTML =
        '<div data-room="room1"></div>';

      // Mock axios to reject
      axios.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid message' },
        },
      });

      // Re-import to register form submit handler
      reimportModule();

      // Set private roomCode value
      document
        .querySelector('.chatBoxInfo')
        .firstElementChild.setAttribute('data-room', 'room1');

      // Submit the form
      document.querySelector('form').dispatchEvent(new Event('submit'));

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assertions
      expect(renderPopup).toHaveBeenCalledWith(
        400,
        'Send message',
        'Invalid message'
      );
    });
  });
});
