export const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .trim()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const isValidCourseData = (data) => {
    const unauthorizedFields = ['courseName', 'tutorId', 'semester', 'isActive', 'prac', 'activities'];
    for (const field of unauthorizedFields) {
        if (data[field] !== undefined) {
            return false;
        }
    }

    return true;
};
