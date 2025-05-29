const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map((err) => err.message) });
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    academicYear: Joi.string().min(1).max(50).required(),
    profilePicture: Joi.string().uri().optional(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    academicYear: Joi.string().min(1).max(50).optional(),
    profilePicture: Joi.string().uri().optional(),
  }).min(1),
  preferences: Joi.object({
    preferredGroupSize: Joi.string().valid('Individual', 'Small Group', 'Large Group').optional(),
    preferredStudyStyle: Joi.string().valid('Quiet Study', 'Discussion-Based', 'Practice Problems').optional(),
    studyEnvironmentPreference: Joi.string().valid('Online', 'On-Campus', 'Library', 'Coffee Shop').optional(),
  }).min(1),
  availability: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    }).custom((value, helpers) => {
      if (value.startTime >= value.endTime) {
        return helpers.error('any.custom', { message: 'startTime must be before endTime' });
      }
      return value;
    })
  ),
  message: Joi.object({
    receiverUserId: Joi.number().integer().positive().required(),
    messageContent: Joi.string().min(1).max(1000).required(),
  }),
  course: Joi.object({
    courseName: Joi.string().min(1).max(100).required(),
    courseCode: Joi.string().min(1).max(20).required(),
    description: Joi.string().max(500).optional(),
  }),
  enroll: Joi.object({
    courseId: Joi.number().integer().positive().required(),
  }),
  session: Joi.object({
    courseId: Joi.number().integer().positive().required(),
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    scheduledTime: Joi.date().iso().required(),
    location: Joi.string().max(100).optional(),
  }),
  participant: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'declined').required(),
  }),
  resource: Joi.object({
    courseId: Joi.number().integer().positive().required(),
    title: Joi.string().min(1).max(100).required(),
    fileUrl: Joi.string().uri().required(),
    description: Joi.string().max(500).optional(),
  }),
  rating: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional(),
  }),
};

module.exports = { validate, schemas };