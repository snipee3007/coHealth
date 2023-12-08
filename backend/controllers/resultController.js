exports.calculateBMI = async (req, res) => {
    try {
        // Extract user input from request body
        const { age, gender, height, weight, activity } = req.body;

        console.log('Received data:', { age, gender, height, weight, activity });

        if (!age || !gender || !height || !weight || !activity) {
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid input. Please fill in all fields.',
            });
        }

        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters ** 2)).toFixed(1);

        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if (gender === 'female') {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        let activityFactor;
        switch (activity) {
            case 'sedentary':
                activityFactor = 1.2;
                break;
            case 'lightly':
                activityFactor = 1.375;
                break;
            case 'moderately':
                activityFactor = 1.55;
                break;
            case 'very_active':
                activityFactor = 1.725;
                break;
            case 'extra_active':
                activityFactor = 1.9;
                break;
            default:
                activityFactor = 1.2;
        }


        const totalCalories = (bmr * activityFactor).toFixed(0);


        res.redirect(`/result?bmi=${bmi}&calories=${totalCalories}`);
    } catch (err) {
        console.error('Error:', err);

        res.status(400).json({
            status: 'failed',
            message: `Error code ${err.code}: ${err.message}`,
        });
    }
};
