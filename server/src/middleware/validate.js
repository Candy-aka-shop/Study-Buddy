const Joi = require('joi');

const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  register: Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(100).required(),
  }),
  updateProfile: Joi.object({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    email: Joi.string().email().max(100).optional(),
    oldPassword: Joi.string().min(6).optional(),
    password: Joi.string().min(6).optional(),
    username: Joi.string().min(3).max(100).optional(),
    academicYear: Joi.string().valid('first year', 'second year', 'third year', 'final year').optional(),
    profilePicture: Joi.string().uri().max(2048).optional().allow(null),
    courses: Joi.array().items(Joi.string().trim()).optional(),
    studyStyle: Joi.string().valid('group', 'individual', 'mixed').optional(),
    availableDays: Joi.array()
      .items(
        Joi.object({
          id: Joi.any().optional(),
          day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
          startTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          endTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        })
      )
      .optional(),
  }).or('firstName', 'lastName', 'email', 'password', 'username', 'academicYear', 'profilePicture', 'courses', 'studyStyle', 'availableDays'),
  updatePreferences: Joi.object({
    studyPreferences: Joi.array().items(Joi.string().trim()).required(),
    preferredStudyStyle: Joi.string().valid('group', 'individual', 'mixed').required(),
    availableDays: Joi.array()
      .items(
        Joi.object({
          id: Joi.any().optional(),
          day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
          startTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          endTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        })
      )
      .min(1)
      .required(),
    yearOfStudy: Joi.string().valid('first year', 'second year', 'third year', 'final year').required(),
  }),
  updateAvailability: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    })
  ),
  createSession: Joi.object({
    courseId: Joi.string().uuid().required(),
    title: Joi.string().max(100).required(),
    description: Joi.string().allow(''),
    scheduledTime: Joi.date().iso().required(),
    location: Joi.string().max(100).allow(''),
  }),
  joinSession: Joi.object({
    status: Joi.string().valid('accepted', 'pending', 'declined').default('pending'),
  }),
  shareResource: Joi.object({
    courseId: Joi.string().uuid().required(),
    title: Joi.string().max(100).required(),
    fileUrl: Joi.string().uri().required(),
    description: Joi.string().allow(''),
  }),
  rateSession: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow(''),
  }),
    requestPasswordReset: Joi.object({
    identifier: Joi.string().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: 'Invalid input provided', details: error.details });
  }
  next();
};

module.exports = { validate, schemas };