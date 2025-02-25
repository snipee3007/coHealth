window.onload = function () {
  const spinners = document.querySelectorAll("#spinner");

  // Extract BMI and Calories from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bmiResult = parseFloat(urlParams.get("bmi")) || 0;
  const caloriesResult = parseFloat(urlParams.get("calories")) || 0;

  spinners.forEach((spinner, i) => {
    let ctx = spinner.getContext("2d");
    let width = spinner.width;
    let height = spinner.height;
    let degrees = 0;
    let new_degrees = 0;
    let difference = 0;
    let color = i == 0 ? "turquoise" : "HotPink";
    let bgColorLight = i == 0 ? "#E8FFFC" : "#FCE6FC";
    let bgColorDark = "#0077cc"; 
    let text;
    let animation_loop;

    function init() {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = bgColorLight;
      ctx.lineWidth = 15;
      ctx.arc(width / 2, width / 2, 60, 0, Math.PI * 2, false);
      ctx.stroke();

      let radians = degrees * Math.PI / 180;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 15;
      ctx.arc(width / 2, height / 2, 60, 0 - 90 * Math.PI / 180, radians - 90 * Math.PI / 180, false);
      ctx.stroke();

      if (degrees === 0) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = bgColorDark;
        ctx.fill();
      }

      ctx.fillStyle = "black";
      ctx.font = "25px Alice";
      text = i == 0 ? bmiResult.toFixed(1) : caloriesResult.toFixed(0);
      text_width = ctx.measureText(text).width;
      ctx.fillText(text, width / 2 - text_width / 2, height / 2);

      ctx.fillStyle = "black";
      ctx.font = "20px Alice";
      let textLabel = i == 0 ? "BMI" : "Calories";
      text_width = ctx.measureText(textLabel).width;
      ctx.fillText(textLabel, width / 2 - text_width / 2, height / 2 + 30);
    }

    function draw() {
      if (typeof animation_loop != undefined) clearInterval(animation_loop);
      new_degrees = (i == 0 ? bmiResult / 50 : caloriesResult / 4000) * 360;
      difference = new_degrees - degrees;
      animation_loop = setInterval(animate_to, 10000 / difference);
    }

    function animate_to() {
      if (degrees == new_degrees) {
        clearInterval(animation_loop);
      } else if (degrees < new_degrees) {
        degrees++;
        init();
      } else {
        clearInterval(animation_loop);
      }
    }

    draw();
  });
};
