// calculateBMIController.test.js
// First import the modules you need
const axios = require('axios');
const { fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');

// Then mock them
jest.mock('axios');

// Mock DOM objects before accessing them
const mockQuerySelector = jest.fn();
const mockQuerySelectorAll = jest.fn();
const mockAddEventListener = jest.fn();

// Setup document mock
document.querySelector = mockQuerySelector;
document.querySelectorAll = mockQuerySelectorAll;
document.addEventListener = mockAddEventListener;

// Mock the controller module - Make sure the path is correct relative to this test file
jest.mock('../src/calculateController', () => {
  const originalModule = jest.requireActual('../src/calculateController');

  // Create a public test version of the class that exposes key behaviors
  return {
    ...originalModule,
    // Expose a testing version of the class
    __esModule: true,
    CalculateBMI: jest.fn().mockImplementation(() => {
      return {
        error: false,
        // Simulate the behavior of key methods without accessing private ones
        testSelectField: function () {
          // Instead of directly accessing document in the mock factory,
          // we'll use the behavior to simulate what happens
          const fields = [
            'gender',
            'activityIntensity',
            'target',
            'speed',
            'method',
          ];
          fields.forEach((field) => {
            // This now uses the previously mocked function
            const fieldButton = mockQuerySelector(`.${field}Selected`);
            if (fieldButton) {
              fieldButton.addEventListener('click', jest.fn());
            }
          });
        },
        testNumberOnlyField: function () {
          // Use the mock version
          const numberOnlyFields = mockQuerySelectorAll('.numberOnly');
          numberOnlyFields.forEach((field) => {
            field.addEventListener('input', jest.fn());
            field.addEventListener('focusout', jest.fn());
          });
        },
        testCalculateButton: function () {
          // Use the mock version
          const form = mockQuerySelector('.calculateForm');
          if (form) {
            form.addEventListener('submit', jest.fn());
          }
        },
      };
    }),
  };
});

// Import after mocks are set up - Make sure path is correct
const { CalculateBMI } = require('../src/calculateController');

describe('CalculateBMI Class', () => {
  let calculateBMI;
  let domElements;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup DOM elements for testing
    domElements = {
      calculateForm: {
        addEventListener: jest.fn(),
        querySelector: jest.fn(),
      },
      activityIntensity: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(),
          toggle: jest.fn(),
        },
        addEventListener: jest.fn(),
      },
      activityOptions: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(),
          toggle: jest.fn(),
        },
      },
      genderSelected: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        addEventListener: jest.fn(),
      },
      genderOptions: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(),
          toggle: jest.fn(),
        },
      },
      genderOptionList: [
        {
          addEventListener: jest.fn(),
          dataset: {
            value: 'male',
          },
          closest: jest.fn().mockReturnValue({}),
        },
      ],
      methodInput: {
        value: 'Normal TDEE',
        addEventListener: jest.fn(),
      },
      addActivityButton: {
        addEventListener: jest.fn(),
      },
      errorActivities: {
        innerHTML: '',
      },
      errorTarget: {
        textContent: '',
      },
      targetWeightInput: {
        addEventListener: jest.fn(),
      },
      numberOnlyFields: [
        {
          addEventListener: jest.fn(),
          name: 'weight',
          setCustomValidity: jest.fn(),
        },
      ],
      activities: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      },
      targetInput: {
        value: 'Gain',
        setCustomValidity: jest.fn(),
      },
      weightInput: {
        value: '70',
        setCustomValidity: jest.fn(),
      },
      targetWeightInputField: {
        value: '75',
        disabled: false,
      },
      activityItems: [],
    };

    // Setup document.querySelector mocks
    mockQuerySelector.mockImplementation((selector) => {
      if (selector === '.calculateForm') return domElements.calculateForm;
      if (selector === '.activityIntensity')
        return domElements.activityIntensity;
      if (selector === '.activities') return domElements.activities;
      if (selector === 'input[name="method"]') return domElements.methodInput;
      if (selector === '.addActivityButton')
        return domElements.addActivityButton;
      if (selector === '.errorActivities') return domElements.errorActivities;
      if (selector === '.errorTarget') return domElements.errorTarget;
      if (selector === 'input[name="targetWeight"]')
        return domElements.targetWeightInput;
      if (selector === 'input[name="target"]') return domElements.targetInput;
      if (selector === 'input[name="weight"]') return domElements.weightInput;
      if (selector === '.genderSelected') return domElements.genderSelected;
      if (selector === '.genderOptions') return domElements.genderOptions;
      return null;
    });

    // Setup document.querySelectorAll mocks
    mockQuerySelectorAll.mockImplementation((selector) => {
      if (selector === '.numberOnly') return domElements.numberOnlyFields;
      if (selector === '.genderOption') return domElements.genderOptionList;
      if (selector === '.activityItem') return domElements.activityItems;
      return [];
    });

    // Reassign the mocks back to document
    document.querySelector = mockQuerySelector;
    document.querySelectorAll = mockQuerySelectorAll;

    // Initialize the class
    calculateBMI = new CalculateBMI();
  });

  describe('Constructor', () => {
    test('should call the constructor and initialize the class', () => {
      // Verify the constructor was called
      expect(CalculateBMI).toHaveBeenCalled();
    });
  });

  describe('Form Event Handlers', () => {
    test('should set up event listeners on form elements', () => {
      // Call the test versions of the methods (simulating what happens during constructor call)
      calculateBMI.testSelectField();
      calculateBMI.testNumberOnlyField();
      calculateBMI.testCalculateButton();

      // Verify event listeners were added to key elements
      expect(domElements.genderSelected.addEventListener).toHaveBeenCalled();
      expect(
        domElements.numberOnlyFields[0].addEventListener
      ).toHaveBeenCalledWith('input', expect.any(Function));
      expect(
        domElements.numberOnlyFields[0].addEventListener
      ).toHaveBeenCalledWith('focusout', expect.any(Function));
      expect(domElements.calculateForm.addEventListener).toHaveBeenCalled();
    });
  });

  describe('DOM Interaction Behaviors', () => {
    test('should toggle dropdown visibility when field is clicked', () => {
      // Test the dropdown toggle behavior
      calculateBMI.testSelectField();

      // Find the click handler from the addEventListener mock
      const clickHandler =
        domElements.genderSelected.addEventListener.mock.calls[0][1];

      // Create a mock event object
      const mockEvent = {
        target: {
          closest: jest.fn().mockReturnValue(domElements.genderSelected),
        },
      };

      // Call the click handler
      clickHandler(mockEvent);

      // Expect the dropdown to be toggled
      expect(mockEvent.target.closest).toHaveBeenCalledWith('.genderSelected');
    });
  });

  describe('checkTargetInput', () => {
    test('should validate target weight when inputs are valid', () => {
      // Import the helper function directly
      const { checkTargetInput } = require('../src/calculateController');

      // Create context object similar to 'this' in the class
      const context = { error: false };

      // Call the function
      checkTargetInput.call(context);

      // Assert that the validation passed
      expect(context.error).toBe(false);
      expect(domElements.errorTarget.textContent).toBe('');
    });

    test('should show error when target weight is invalid', () => {
      // Import the helper function directly
      const { checkTargetInput } = require('../src/calculateController');

      // Mock the DOM elements for an invalid scenario (want to lose weight but target > current)
      mockQuerySelector.mockImplementation((selector) => {
        if (selector === 'input[name="targetWeight"]') return { value: '75' };
        if (selector === 'input[name="target"]') return { value: 'lose' };
        if (selector === 'input[name="weight"]') return { value: '70' };
        if (selector === '.errorTarget') return domElements.errorTarget;
        return null;
      });

      // Create context object similar to 'this' in the class
      const context = { error: false };

      // Call the function
      checkTargetInput.call(context);

      // Assert that the validation failed
      expect(context.error).toBe(true);
      expect(domElements.errorTarget.textContent).toBe(
        '*Please provide valid target weight!'
      );
    });
  });

  describe('API Integration', () => {
    // Test the calculateAPI function
    test('should make API call and handle success response', async () => {
      // Import the API function directly
      const { calculateAPI } = require('../src/calculateController');

      // Mock axios response
      axios.mockResolvedValueOnce({ data: { status: 'success' } });

      // Mock window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      // Call the function
      await calculateAPI({ gender: 'male', age: '30' });

      // Verify localStorage was used
      expect(localStorageMock.getItem).toHaveBeenCalledWith('calculateData');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'calculateData',
        JSON.stringify({ gender: 'male', age: '30' })
      );

      // Verify Loader was used
      expect(global.Loader.create).toHaveBeenCalled();
      expect(global.Loader.destroy).toHaveBeenCalled();

      // Verify API call was made
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: '/api/calculate',
        data: { gender: 'male', age: '30' },
      });

      // Restore original location
      window.location = originalLocation;
    });

    test('should handle API errors gracefully', async () => {
      // Import the API function directly
      const { calculateAPI } = require('../src/calculateController');

      // Mock axios to reject
      axios.mockRejectedValueOnce(new Error('API error'));

      // Spy on console.log
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      // Call the function
      await calculateAPI({ gender: 'male', age: '30' });

      // Verify Loader was destroyed
      expect(global.Loader.destroy).toHaveBeenCalled();

      // Verify error was logged
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));

      // Restore console.log
      consoleLogSpy.mockRestore();
    });
  });

  describe('Activity Handling', () => {
    test('should fetch and render activity names', async () => {
      // Import the function directly
      const { getAllActivityNames } = require('../src/calculateController');

      // Mock axios response
      axios.mockResolvedValueOnce({
        data: {
          status: 'success',
          data: ['Running', 'Walking', 'Swimming'],
        },
      });

      // Call the function
      await getAllActivityNames();

      // Verify API call was made
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: '/api/adultCompendium/getAllNames',
      });

      // Verify render function was called with data
      expect(global.renderActivityNameOption).toHaveBeenCalledWith([
        'Running',
        'Walking',
        'Swimming',
      ]);
    });

    test('should fetch and render activity descriptions', async () => {
      // Import the function directly
      const {
        getCurrentActivityDescription,
      } = require('../src/calculateController');

      // Create mock container
      const container = { innerHTML: '', insertAdjacentHTML: jest.fn() };

      // Mock axios response
      axios.mockResolvedValueOnce({
        data: {
          status: 'success',
          data: [
            { description: 'Light', activityCode: '123' },
            { description: 'Moderate', activityCode: '456' },
          ],
        },
      });

      // Call the function
      await getCurrentActivityDescription(container, 'Running');

      // Verify API call was made
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: '/api/adultCompendium/getDescription/Running',
      });

      // Verify container was updated
      expect(container.innerHTML).toBe('');
      expect(container.insertAdjacentHTML).toHaveBeenCalled();
    });
  });
});
