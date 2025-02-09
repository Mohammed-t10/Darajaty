import mongoose from "mongoose";
const { Schema } = mongoose;

const isValidDecimal = (value) => {
  if (value === null) return true;

  if (value < 0 || value > 100) return false;

  const stringValue = value.toString();
  const decimalPointIndex = stringValue.indexOf(".");

  if (decimalPointIndex !== -1) {
    return stringValue.split(".")[1].length <= 2;
  }

  return true;
};

const gradeError =
  "Grade must be between 0 and 100 and have no more than 2 decimal places.";

const studentGradesSchema = new Schema({
  studId: { type: String, required: true },
  studGrades: {
    midterm: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
    termwork: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
    final: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
  },
});

const activityGradeSchema = new Schema({
  studId: { type: String, required: true },
  studGrade: {
    type: Number,
    default: null,
    validate: {
      validator: isValidDecimal,
      message: gradeError,
    },
  },
});

const activitySchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: [
      100,
      "Activity name must be less than or equal to 100 characters",
    ],
  },
  description: {
    type: String,
    required: true,
    maxlength: [
      300,
      "Description must be less than or equal to 300 characters",
    ],
  },
  maxGrade: {
    type: Number,
    default: null,
    validate: {
      validator: isValidDecimal,
      message: gradeError,
    },
  },
  studentGrades: [activityGradeSchema],
});

const assignmentStudentSchema = new Schema({
  studId: { type: String, required: true },
  file_url: { type: String, default: null },
  grade: {
    type: Number,
    default: null,
    validate: {
      validator: isValidDecimal,
      message: gradeError,
    },
  },
  lastModified: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const assignmentSchema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 300 },
  file_url: { type: String, default: null },
  maxGrade: {
    type: Number,
    default: 100,
    validate: { validator: isValidDecimal, message: gradeError },
  },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  students: [assignmentStudentSchema],
});

const courseSchema = new Schema(
  {
    courseName: { type: String, required: true },
    tutorId: { type: String, required: true },
    semester: { type: String, required: true },
    prac: { type: Boolean, required: true },
    maxMidterm: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
    maxTermwork: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
    maxFinal: {
      type: Number,
      default: null,
      validate: {
        validator: isValidDecimal,
        message: gradeError,
      },
    },
    studentsSubjectsGrades: [studentGradesSchema],
    activities: [activitySchema],
    assignments: [assignmentSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);
