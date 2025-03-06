const { body, validationResult } = require('express-validator');

const validateVehicle = [
    body('name').notEmpty().withMessage('Name is required'),
    body('year').isInt({ min: 1886 }).withMessage('Year must be a valid number'),
    body('type').isIn(['SUV', 'Sedan']).withMessage('Type must be either SUV or Sedan'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateVehicle };