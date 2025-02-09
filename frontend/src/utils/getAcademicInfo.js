const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const startYear = 2023;

let level = year - startYear;
if (month >= 9) ++level;
if (level > 4) level = 4;

let semester = (month >= 1 && month < 9) ? 2 : 1;
// Semester defaults to 2 if year ≥ 2027
if (year - startYear > 3) semester = 2;

const levels = ['الأول', 'الثاني', 'الثالث', 'الرابع'];
const semesters = ['الأول', 'الثاني'];

const levelName = levels[level - 1];
const semesterName = semesters[semester - 1];

export { levels, semesters, levelName as level, semesterName as semester };