// calculate.js

class BMI {
    renderBMIDescription() {
        const content = document.querySelector('.bmiDescriptionContent');
        const data = new URLSearchParams(window.location.search);
        const bmi = parseFloat(data.get("bmi"));

        if (!isNaN(bmi)) {
            if (bmi < 16) {
                content.innerHTML = "Severe Thinness";
            } else if (bmi >= 16 && bmi < 17) {
                content.innerHTML = "Moderate Thinness";
            } else if (bmi >= 17 && bmi < 18.5) {
                content.innerHTML = "Mild Thinness";
            } else if (bmi >= 18.5 && bmi < 25) {
                content.innerHTML = "Normal";
            } else if (bmi >= 25 && bmi < 30) {
                content.innerHTML = "Overweight";
            } else if (bmi >= 30 && bmi < 35) {
                content.innerHTML = "Obese Class I";
            } else if (bmi >= 35 && bmi < 40) {
                content.innerHTML = "Obese Class II";
            } else if (bmi >= 40) {
                content.innerHTML = "Obese Class III";
            }
        } else {
            content.innerHTML = "Invalid BMI";
        }
    }
    renderCaloriesDescription() {
        const content = document.querySelector('.caloriesDescriptionContent');
        const content2 = document.querySelector('.caloriesDescriptionTitle');
        const data = new URLSearchParams(window.location.search);
        const calories = data.get("calories");
        content2.innerHTML = calories + " (+/- 100)"
        content.innerHTML = "Per day to maintain weight"
    }
}

export default new BMI()