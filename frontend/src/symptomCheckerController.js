const data = async function () {};

class SymptomChecker {
  constructor() {
    // Danh sách triệu chứng mẫu - bạn có thể thay thế bằng dữ liệu từ API
    this.allSymptoms = [];
    this.selectedSymptoms = [];

    this.#renderSymptomsByTag();
    this.#setupSearchBar();
    this.#renderNextStep();
  }

  // Hàm để render triệu chứng bệnh theo tag
  async #renderSymptomsByTag() {
    const buttons = document.querySelectorAll('#tagSymptoms button');
    buttons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        console.log('vô đây');
        e.preventDefault();
        buttons.forEach((btn) => {
          btn.classList.remove('linearBackground', 'text-white');
        });
        button.classList.add('linearBackground', 'text-white');

        if (button.textContent.trim() === 'All') {
          try {
            this.#renderSymptomsList(this.allSymptoms);
          } catch (err) {
            alert('Cannot get all data');
          }
        } else {
          try {
            const tag =
              button.textContent.trim() == 'Skin'
                ? 'skin'
                : button.textContent.trim() == 'Nails'
                ? 'nails'
                : button.textContent.trim();
            console.log(button.textContent.trim());
            const res = await axios({
              method: 'get',
              url: `/api/symptom/${tag}`,
            });

            this.#renderSymptomsList(res.data.data);
          } catch (err) {
            alert('Cannot get data by tag');
          }
        }
      });
    });
    // Load tất cả triệu chứng khi trang được tải
    if (this.allSymptoms.length == 0) {
      try {
        const res = await axios({
          method: 'get',
          url: '/api/symptom',
        });
        const symptoms = res.data.data;
        symptoms.forEach((symptom) => {
          this.allSymptoms.push(symptom.symptom);
        });
        this.#renderSymptomsList(this.allSymptoms);
      } catch (err) {
        alert(err.response.data.message);
      }
    } else {
      this.#renderSymptomsList(this.allSymptoms);
    }
  }

  // Render danh sách triệu chứng
  #renderSymptomsList(symptoms) {
    const listContainer = document.getElementById('symptomsList');
    listContainer.innerHTML = '';
    if (typeof symptoms[0] === 'object') {
      symptoms.forEach((symptom) => {
        const symptomElement = document.createElement('div');
        symptomElement.className =
          'p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer';
        symptomElement.textContent = symptom.symptom;

        symptomElement.addEventListener('click', () => {
          symptomElement.classList.add('linearBackground', 'text-white');
          this.#addSymptom(symptom.symptom);
        });

        listContainer.appendChild(symptomElement);
      });
    } else {
      symptoms.forEach((symptom) => {
        const symptomElement = document.createElement('div');
        symptomElement.className =
          'p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer';
        symptomElement.textContent = symptom;

        symptomElement.addEventListener('click', () => {
          symptomElement.classList.add('linearBackground', 'text-white');
          this.#addSymptom(symptom);
        });

        listContainer.appendChild(symptomElement);
      });
    }
    this.#renderSelectedTag();
  }

  // Thiết lập thanh tìm kiếm
  #setupSearchBar() {
    const searchInput = document.getElementById('symptomSearch');
    const searchDropdown = document.getElementById('searchDropdown');

    // Xử lý sự kiện nhập trong thanh tìm kiếm
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.trim().toLowerCase();

      if (searchTerm === '') {
        searchDropdown.classList.add('hidden');
        return;
      }

      // Lọc triệu chứng phù hợp với từ khóa tìm kiếm
      const filteredSymptoms = this.allSymptoms.filter((symptom) =>
        symptom.toLowerCase().includes(searchTerm)
      );

      if (filteredSymptoms.length > 0) {
        this.#renderDropdown(filteredSymptoms);
        searchDropdown.classList.remove('hidden');
      } else {
        searchDropdown.classList.add('hidden');
      }
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchDropdown.contains(e.target)
      ) {
        searchDropdown.classList.add('hidden');
      }
    });

    // Xử lý phím Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !searchDropdown.classList.contains('hidden')) {
        e.preventDefault();
        const firstItem = searchDropdown.querySelector('.dropdown-item');
        if (firstItem) {
          this.#addSymptom(firstItem.textContent);
          searchInput.value = '';
          searchDropdown.classList.add('hidden');
        }
      }
    });
  }

  // Render dropdown kết quả tìm kiếm
  #renderDropdown(symptoms) {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = '';

    symptoms.forEach((symptom) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = symptom;

      item.addEventListener('click', () => {
        this.#addSymptom(symptom);
        document.getElementById('symptomSearch').value = '';
        dropdown.classList.add('hidden');
      });

      dropdown.appendChild(item);
    });
  }

  // Thêm triệu chứng vào danh sách đã chọn
  #addSymptom(symptom) {
    if (this.selectedSymptoms.includes(symptom)) {
      return; // Tránh thêm trùng lặp
    }

    this.selectedSymptoms.push(symptom);
    this.#renderSelectedSymptoms();
  }

  // Xóa triệu chứng khỏi danh sách đã chọn
  #removeSymptom(symptom) {
    // Xóa khỏi danh sách đã chọn
    this.selectedSymptoms = this.selectedSymptoms.filter((s) => s !== symptom);

    // Xóa class linearBackground và text-white từ phần tử trong #symptomsList
    const symptomElements = document.querySelectorAll('#symptomsList div');
    symptomElements.forEach((element) => {
      if (element.textContent.trim() === symptom) {
        element.classList.remove('linearBackground', 'text-white');
      }
    });

    // Render lại danh sách đã chọn
    this.#renderSelectedSymptoms();
  }

  // Render danh sách triệu chứng đã chọn
  #renderSelectedSymptoms() {
    const container = document.getElementById('mySymptomsList');
    container.innerHTML = '';

    if (this.selectedSymptoms.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-gray-500 text-center p-4';
      emptyMessage.textContent = 'No symptoms selected';
      container.appendChild(emptyMessage);
      return;
    }

    this.selectedSymptoms.forEach((symptom) => {
      const symptomElement = document.createElement('div');
      symptomElement.className =
        'border-b-2 flex justify-between h-12 items-center';

      const symptomText = document.createElement('p');
      symptomText.className = 'content-center';
      symptomText.textContent = symptom;

      const removeButton = document.createElement('button');
      removeButton.className = 'text-gray-500 hover:text-red-500 px-2';
      removeButton.innerHTML = '<i class="fa fa-times-rectangle"></i>';

      removeButton.addEventListener('click', () => {
        this.#removeSymptom(symptom);
      });

      symptomElement.appendChild(symptomText);
      symptomElement.appendChild(removeButton);
      container.appendChild(symptomElement);
    });
  }

  #renderSelectedTag() {
    // Tìm và thêm class cho element trong danh sách triệu chứng có textContent tương ứng
    const symptomElements = document.querySelectorAll('#symptomsList div');
    if (this.selectedSymptoms !== null) {
      this.selectedSymptoms.forEach((symptom) => {
        for (const element of symptomElements) {
          if (element.textContent.trim() === symptom) {
            element.classList.add('linearBackground', 'text-white');
            console.log(element);
            break;
          }
        }
      });
    }
  }

  // async #renderNextStep() {
  //   document.querySelector('.next').addEventListener('click', async (e) => {
  //     if (this.selectedSymptoms.length == 0) {
  //       // popup phai chon it nhat 1 trieu chung
  //       alert('You must choose at least 1 symptom');
  //     } else {
  //       e.preventDefault();
  //       document
  //         .querySelector('.stepInformation .step1')
  //         .classList.add('hidden');
  //       document
  //         .querySelector('.stepInformation .step2')
  //         .classList.remove('hidden');

  //       document.querySelector('.step2').classList.add('active');
  //       document.querySelector('.step2').classList.remove('disactive');
  //       console.log(this.selectedSymptoms);
  //       try {
  //         const res = await axios({
  //           method: 'post',
  //           url: `/api/disease/predict`,
  //           data: { symptoms: this.selectedSymptoms },
  //         });
  //         const data = res.data.data;

  //         console.log(data.predictions);
  //         let dataArray = Object.entries(data.predictions);
  //         console.log(dataArray);
  //         for (let i = 0; i < dataArray.length; i++) {
  //           const predictButton = document.querySelector(
  //             `button .predict${i + 1}`
  //           );
  //           predictButton.firstChild.textContent = dataArray[i][0];
  //           predictButton.lastChild.textContent = dataArray[i][1];
  //           predictButton.addEventListener('click', (e) => {
  //             console.log('here');
  //           });
  //         }
  //       } catch {
  //         alert('Cannot predict disease!');
  //       }
  //     }
  //   });
  // }
  async #renderNextStep() {
    const nextButton = document.querySelector('.next');

    nextButton.addEventListener('click', async (e) => {
      if (this.selectedSymptoms.length == 0) {
        // popup phai chon it nhat 1 trieu chung
        alert('You must choose at least 1 symptom');
      } else {
        e.preventDefault();

        // tạo hiệu ứng loading screen
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = `
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span class="ml-2">Loading predictions...</span>
          </div>
        `;

        // Insert loading spinner after the next button
        nextButton.parentNode.insertBefore(
          loadingSpinner,
          nextButton.nextSibling
        );

        // Hide next button
        nextButton.classList.add('hidden');

        try {
          // Fetch predictions
          const res = await axios({
            method: 'post',
            url: `/api/disease/predict`,
            data: { symptoms: this.selectedSymptoms },
          });
          const data = res.data.data;

          console.log(data.predictions);
          let dataArray = Object.entries(data.predictions);
          console.log(dataArray);

          // Update prediction buttons with data
          for (let i = 0; i < dataArray.length && i < 3; i++) {
            const predictionElement = document.querySelector(
              `.predict${i + 1}`
            );
            if (predictionElement) {
              const nameElement =
                predictionElement.querySelector('p:first-child');
              const percentElement =
                predictionElement.querySelector('p:last-child');

              if (
                nameElement &&
                percentElement &&
                dataArray[i][1] !== '0.00%'
              ) {
                nameElement.textContent = dataArray[i][0];
                percentElement.textContent = `Predictions: ${dataArray[i][1]}`;
              } else {
              }
            }
          }
          // Remove loading spinner and show next button again
          loadingSpinner.remove();
          nextButton.classList.remove('hidden');

          // Switch to step 2
          document
            .querySelector('.stepInformation .step1')
            .classList.add('hidden');
          document
            .querySelector('.stepInformation .step2')
            .classList.remove('hidden');
          document.querySelector('.step2').classList.add('active');
          document.querySelector('.step2').classList.remove('disactive');

          // Add event listeners to prediction buttons
          const predictButtons = document.querySelectorAll(
            '#top3Diseases button'
          );
          predictButtons.forEach((button, index) => {
            if (index < dataArray.length) {
              button.addEventListener('click', () => {
                // Handle clicking on a disease prediction
                const diseaseName = dataArray[index][0];
                // Update details section with the selected disease information
                this.#showDiseaseDetails(diseaseName);
              });
            }
          });
        } catch (error) {
          // Remove loading spinner and show next button on error
          loadingSpinner.remove();
          nextButton.classList.remove('hidden');
          alert('Cannot predict disease!');
          console.error(error);
        }
      }
    });
  }

  // Helper method to show disease details
  async #showDiseaseDetails(diseaseName) {
    const detailsSection = document.querySelector('.step2 div:nth-child(2)');
    if (detailsSection) {
      const titleElement = detailsSection.querySelector('p:nth-child(2)');
      if (titleElement) {
        titleElement.textContent = diseaseName;
        try {
          const res = await axios({
            method: 'get',
            url: `/api/disease/${diseaseName}`,
          });
        } catch (err) {
          alert('Cannot get details');
        }
      }
    }
  }
}
new SymptomChecker();
