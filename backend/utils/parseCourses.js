export function parseCoursesData(studentId, courses) {
  const jsonData = courses.map(course => {
    const studentSubjectGrade = course.studentsSubjectsGrades.find(student => student.studId === studentId);

    let grades = {};

    if (studentSubjectGrade) {
      grades.midterm = studentSubjectGrade.studGrades.midterm
        ? { grade: studentSubjectGrade.studGrades.midterm, maxGrade: course.maxMidterm }
        : { grade: null, maxGrade: course.maxMidterm };

      grades.termwork = studentSubjectGrade.studGrades.termwork
        ? { grade: studentSubjectGrade.studGrades.termwork, maxGrade: course.maxTermwork }
        : { grade: null, maxGrade: course.maxTermwork };

      grades.final = studentSubjectGrade.studGrades.final
        ? { grade: studentSubjectGrade.studGrades.final, maxGrade: course.maxFinal }
        : { grade: null, maxGrade: course.maxFinal };
    } else {
      grades.midterm = { grade: null, maxGrade: course.maxMidterm };
      grades.termwork = { grade: null, maxGrade: course.maxTermwork };
      grades.final = { grade: null, maxGrade: course.maxFinal };
    }

    let activities = [];
    course.activities.forEach(activity => {
      const activityGrade = activity.studentGrades.find(grade => grade.studId === studentId);

      activities.push({
        name: activity.name,
        description: activity.description,
        grade: activityGrade ? activityGrade.studGrade : null,
        maxGrade: activity.maxGrade,
      });
    });

    let assignments = course.assignments
      .filter(assignment => new Date(assignment.endTime) > Date.now())
      .map(assignment => {
        const assignmentGrade = assignment.students.find(stud => stud.studId === studentId);

        return {
          title: assignment.title,
          description: assignment.description,
          grade: assignmentGrade ? assignmentGrade?.grade : null,
          maxGrade: assignment.maxGrade,
        };
      });

    return {
      _id: course._id,
      name: course.courseName,
      prac: course.prac || false,
      grades: {
        ...grades,
        activities,
        assignments,
      },
    };
  });

  return jsonData;
}
