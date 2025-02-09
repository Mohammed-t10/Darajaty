import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'react-hot-toast';

import StudentGradesPage from './pages/StudentGradesPage';
import EnhancedCourseGrades from '@/pages/ManageGradesPage'
import LoginPage from './pages/LoginPage';
import Preloader from '@/components/Preloader';
import { useAuthStore } from './store/authStore';
import AddActivity from '@/pages/AddActivityPage';
import CourseManagment from '@/pages/CoursesPage';
import UserManagment from "@/pages/UsersPage"
import CourseAssignments from "@/pages/StudentAssignmentsPage";
import AddAssignmentPage from "@/pages/AddAssignmentPage";
import ManageAssignmentsPage from "@/pages/ManageAssignmentsPage";

const toastOptions = {
  className: 'flex-row-reverse text-right select-none',
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user?.role !== "tutor") {
    return children;
  }
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return <Navigate to='/tutor-panel' replace />;
};

const RoleBasedRoute = ({ children, role }) => {
    const { user, isAuthenticated } = useAuthStore();
    if (isAuthenticated && role === "admin" && user?.isAdmin) {
      return children;
    }
    if (isAuthenticated && (user?.role === role)){
        return children;
    }
    return <Navigate to={isAuthenticated ? '/' : '/login'} replace />;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to='/' replace />
  }
  return children;
};

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
}, [checkAuth]); 

  if (isCheckingAuth) return <Preloader />;

  return (
    <div>
      <Routes>
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <StudentGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/assignments'
          element={
            <ProtectedRoute>
              <CourseAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path='/login'
          element={
          <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser>
          }
        />
        <Route
          path='/admin-panel'
          element={
            <RoleBasedRoute role="admin">
              <EnhancedCourseGrades />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/admin-panel/activities'
          element={
            <RoleBasedRoute role="admin">
              <AddActivity />
            </RoleBasedRoute>
          }
          />
          <Route
            path='/admin-panel/courses'
            element={
              <RoleBasedRoute role="admin">
                <CourseManagment />
              </RoleBasedRoute>
            }
          />
          <Route
            path='/admin-panel/users'
            element={
              <RoleBasedRoute role="admin">
                <UserManagment />
              </RoleBasedRoute>
            }
          />
        <Route
          path='/tutor-panel'
          element={
            <RoleBasedRoute role="tutor">
              <EnhancedCourseGrades />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/tutor-panel/activities'
          element={
            <RoleBasedRoute role="tutor">
              <AddActivity />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/tutor-panel/assignments/add-assignment'
          element={
            <RoleBasedRoute role="tutor">
              <AddAssignmentPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/tutor-panel/assignments/manage-assignments'
          element={
            <RoleBasedRoute role="tutor">
              <ManageAssignmentsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/admin-panel/assignments/manage-assignments'
          element={
            <RoleBasedRoute role="admin">
              <AddAssignmentPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path='/admin-panel/assignments/manage-grades'
          element={
            <RoleBasedRoute role="admin">
              <ManageAssignmentsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path='*'
          element={<Navigate to='/' replace />}
        />
      </Routes>
      <Toaster toastOptions={toastOptions} />
    </div>
    );

}

export default App;
