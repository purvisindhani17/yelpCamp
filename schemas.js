const basejoi = require('joi');
const sanitizeHtml = require('sanitize-html'); // Changed to camelCase to match the usage below

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // This now matches the variable name in the require statement
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = basejoi.extend(extension);

module.exports.campgroundSchema = joi.object({
    campground: joi.object({
        // Added .escapeHTML() to sanitize these inputs
        title: joi.string().required().escapeHTML(),
        price: joi.number().required().min(0),
        location: joi.string().required().escapeHTML(),
        description: joi.string().required().escapeHTML()
    }).required(),
    deleteImages: joi.array()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        body: joi.string().required().escapeHTML() // Added .escapeHTML() here too
    }).required()
});