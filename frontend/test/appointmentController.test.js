// Import dependencies
const axios = require('axios');
const io = require('socket.io-client');
const { JSDOM } = require('jsdom');
const sinon = require('sinon');
const { expect } = require('chai');

// Mock modules
jest.mock('axios');
jest.mock('socket.io-client');
jest.mock('./utils/popup.js');
jest.mock('./utils/loader.js');

// Import modules to test
const { renderPopup } = require('../../frontend/utils/popup.js');
const Loader = require('../../frontend/utils/loader.js');
// We need to import the module under test after mocks are set up
let Appointment;

describe('Appointment Controller Tests', () => {
  // Setup DOM environment before tests
  let document;
  let window;

  beforeEach(() => {
    // Setup a DOM environment
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form>
            <div class="time">
              <select id="specialtyList">
                <option value="noInfo">Select specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
              </select>
              <select id="doctorList">
                <option value="noInfo">Select doctor</option>
              </select>
              <input type="text" name="schedule" disabled />
              <button class="submitDatepicker">Submit Date</button>
              <div id="listTime" class="hidden">
                <button>09:00</button>
                <button>09:30</button>
                <button>10:00</button>
                <button>10:30</button>
                <button>11:00</button>
                <button>11:30</button>
                <button>13:00</button>
                <button>13:30</button>
                <button>14:00</button>
                <button>14:30</button>
                <button>15:00</button>
                <button>15:30</button>
                <button>16:00</button>
                <button>16:30</button>
                <button>17:00</button>
                <button>17:30</button>
              </div>
              <input type="text" name="fullname" value="John Doe" />
              <input type="email" name="email" value="john@example.com" />
              <input type="text" name="phoneNumber" value="1234567890" />
              <textarea name="reason">Test reason</textarea>
              <button type="submit">Submit</button>
            </div>
          </form>
        </body>
      </html>
    `);

    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.CustomEvent = dom.window.CustomEvent;
    global.Event = dom.window.Event;
    global.MouseEvent = dom.window.MouseEvent;

    document = dom.window.document;
    window = dom.window;

    // Reset mocks
    jest.clearAllMocks();
    sinon.restore();

    // Now import the module under test
    // Note: In actual testing you might need to use a module system like jest.mock to handle ES modules
    Appointment =
      require('../../frontend/appointmentController.js').Appointment;
  });

  afterEach(() => {
    // Clean up
    global.window = undefined;
    global.document = undefined;
  });

  describe('sendAppointment Function', () => {
    it('should successfully send appointment data and show success popup', async () => {
      // Mock axios response
      axios.mockResolvedValue({
        data: { status: 'success' },
        status: 200,
      });

      // Call the function with test data
      const data = {
        time: new Date(),
        specialty: 'Cardiology',
        docFullname: 'Dr. Smith',
        fullname: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        reason: 'Test reason',
      };

      // Get the sendAppointment function from the module
      const {
        sendAppointment,
      } = require('../../frontend/appointmentController.js');
      await sendAppointment(data);

      // Verify axios was called with correct parameters
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/appointment/create',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      });

      // Verify loader functions were called
      expect(Loader.create).toHaveBeenCalled();
      expect(Loader.destroy).toHaveBeenCalled();

      // Verify popup was rendered with success message
      expect(renderPopup).toHaveBeenCalledWith(
        200,
        'Creating appointment',
        'Your appointment has been created! Please wait for the doctor checking it!',
        'reload'
      );
    });

    it('should handle errors when sending appointment data', async () => {
      // Mock axios to reject with an error
      axios.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid appointment data' },
        },
      });

      // Test data
      const data = {
        time: new Date(),
        specialty: 'Cardiology',
        docFullname: 'Dr. Smith',
        fullname: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        reason: 'Test reason',
      };

      // Get the sendAppointment function
      const {
        sendAppointment,
      } = require('../../frontend/appointmentController.js');
      await sendAppointment(data);

      // Verify loader functions were called
      expect(Loader.create).toHaveBeenCalled();
      expect(Loader.destroy).toHaveBeenCalled();

      // Verify error popup was shown
      expect(renderPopup).toHaveBeenCalledWith(
        400,
        'Creating appointment',
        'Invalid appointment data'
      );
    });
  });

  describe('Appointment Class', () => {
    let appointmentInstance;

    beforeEach(() => {
      // Mock API responses
      axios.mockImplementation((config) => {
        if (config.url === '/api/appointment/get') {
          return Promise.resolve({
            data: {
              data: [
                {
                  doctorID: {
                    fullname: 'Dr. Smith',
                    doctorInfo: [{ major: 'Cardiology' }],
                  },
                  time: new Date(2025, 4, 5, 10, 0), // May 5, 2025, 10:00 AM
                },
              ],
            },
          });
        } else if (config.url === '/api/doctor') {
          return Promise.resolve({
            data: {
              data: [{ fullname: 'Dr. Smith' }, { fullname: 'Dr. Johnson' }],
            },
          });
        }
        return Promise.reject(new Error('Unexpected request'));
      });

      // Create an instance of the Appointment class
      appointmentInstance = new Appointment();
    });

    it('should fetch doctor list when specialty is selected', async () => {
      // Trigger change event on specialty dropdown
      const specialtySelect = document.querySelector('#specialtyList');
      specialtySelect.value = 'Cardiology';

      const changeEvent = new Event('change');
      specialtySelect.dispatchEvent(changeEvent);

      // Wait for axios promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify axios was called to fetch doctors
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/doctor',
        params: { major: 'Cardiology' },
      });

      // Verify doctor options were added to the select
      const doctorOptions = document.querySelectorAll(
        '#doctorList option.delete'
      );
      expect(doctorOptions.length).to.equal(2);
      expect(doctorOptions[0].value).to.equal('Dr. Smith');
      expect(doctorOptions[1].value).to.equal('Dr. Johnson');
    });

    it('should enable date picker when doctor is selected', () => {
      // Trigger change event on doctor dropdown
      const doctorSelect = document.querySelector('#doctorList');
      doctorSelect.value = 'Dr. Smith';

      const changeEvent = new Event('change');
      doctorSelect.dispatchEvent(changeEvent);

      // Verify date picker is enabled
      const datepicker = document.querySelector('#datepicker');
      expect(datepicker.disabled).to.be.false;
    });

    it('should show time slots when date is submitted', () => {
      // Set up date and doctor selection
      const doctorSelect = document.querySelector('#doctorList');
      doctorSelect.value = 'Dr. Smith';

      const doctorChangeEvent = new Event('change');
      doctorSelect.dispatchEvent(doctorChangeEvent);

      // Set date value (use a future date to avoid the "Please choose another day" notice)
      const scheduleInput = document.querySelector('input[name="schedule"]');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateString = `${futureDate.getDate()}/${
        futureDate.getMonth() + 1
      }/${futureDate.getFullYear()}`;
      scheduleInput.value = dateString;

      // Click submit date button
      const submitButton = document.querySelector('.submitDatepicker');
      submitButton.click();

      // Verify time slots are shown
      const listTime = document.querySelector('#listTime');
      expect(listTime.classList.contains('hidden')).to.be.false;
    });

    it('should disable booked time slots', async () => {
      // Wait for list booked to be populated
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Set up date and doctor selection for a day with a booked appointment
      const doctorSelect = document.querySelector('#doctorList');
      doctorSelect.value = 'Dr. Smith';

      const doctorChangeEvent = new Event('change');
      doctorSelect.dispatchEvent(doctorChangeEvent);

      // Set the date to match the booked appointment (May 5, 2025)
      const scheduleInput = document.querySelector('input[name="schedule"]');
      scheduleInput.value = '5/5/2025';

      // Set specialty to match the booked appointment
      const specialtySelect = document.querySelector('#specialtyList');
      specialtySelect.value = 'Cardiology';

      // Click submit date button
      const submitButton = document.querySelector('.submitDatepicker');
      submitButton.click();

      // Verify the 10:00 AM slot is disabled (as it's booked)
      const timeButtons = document.querySelectorAll('#listTime button');
      const bookedButton = Array.from(timeButtons).find(
        (button) => button.textContent.trim() === '10:00'
      );

      expect(bookedButton.disabled).to.be.true;
      expect(bookedButton.classList.contains('cursor-not-allowed')).to.be.true;
      expect(bookedButton.classList.contains('opacity-20')).to.be.true;
    });

    it('should select a time slot when clicked', () => {
      // Set up the time slots to be visible
      const listTime = document.querySelector('#listTime');
      listTime.classList.remove('hidden');

      // Click on a time slot
      const timeButton = document.querySelector('#listTime button');
      timeButton.click();

      // Verify the button is styled as selected
      expect(timeButton.classList.contains('bg-gray-200')).to.be.false;
      expect(timeButton.classList.contains('linearBackground')).to.be.true;
      expect(timeButton.classList.contains('text-white')).to.be.true;
    });

    it('should submit form with correct data', async () => {
      // Set up form with all required values
      const specialtySelect = document.querySelector('#specialtyList');
      specialtySelect.value = 'Cardiology';

      const doctorSelect = document.querySelector('#doctorList');
      doctorSelect.value = 'Dr. Smith';

      const scheduleInput = document.querySelector('input[name="schedule"]');
      scheduleInput.value = '5/5/2025';

      // Mock the time selection
      // This would normally happen through click events, but we'll mock it for the test
      // by directly setting the private property
      appointmentInstance._time = '10:30';

      // Reset the axios mock for the form submission
      axios.mockReset();
      axios.mockResolvedValue({
        data: { status: 'success' },
        status: 200,
      });

      // Submit the form
      const form = document.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify axios was called with the correct appointment data
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/appointment/create',
          data: expect.objectContaining({
            specialty: 'Cardiology',
            docFullname: 'Dr. Smith',
            fullname: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '1234567890',
            reason: 'Test reason',
          }),
        })
      );
    });

    it('should show error when time is not selected', () => {
      // Set up form with all required values except time
      const specialtySelect = document.querySelector('#specialtyList');
      specialtySelect.value = 'Cardiology';

      const doctorSelect = document.querySelector('#doctorList');
      doctorSelect.value = 'Dr. Smith';

      const scheduleInput = document.querySelector('input[name="schedule"]');
      scheduleInput.value = '5/5/2025';

      // Do not select a time (leave appointmentInstance._time as '')

      // Submit the form
      const form = document.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Verify error popup was shown
      expect(renderPopup).toHaveBeenCalledWith(
        400,
        'Creating appointment',
        'Please provide the time of appointment!'
      );

      // Verify axios was not called
      expect(axios).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/appointment/create',
        })
      );
    });
  });
});
