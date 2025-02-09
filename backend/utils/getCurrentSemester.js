export default function getCurrentSemester() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const startYear = 2023;

    // Calculate how many years have passed
    let level = year - startYear;

    // Determine the current term based on the month
    const term = (month >= 1 && month < 9) ? 2 : 1;

    if (term === 1) level++;

    // Calculate semester
    let semester = level * 2;

    if (term === 1) --semester;

    return String(semester);
}
