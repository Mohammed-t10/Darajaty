import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Laptop, User, LogOut, Key, ChevronDown, ChevronUp, Activity, Eye, EyeOff, Menu, Home, LayoutDashboard, Mail, LayoutPanelLeft, GraduationCap, Book, FileText } from 'lucide-react';
import InfoIcon from '@/components/svg/InfoIcon';
import { axiosInstance as axios } from '@/api/axiosInstance';
import { Link, NavLink, useLocation } from 'react-router';
import { toast } from 'react-hot-toast';

// Shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LevelAndSemesterDropdowns, initialLevel, initialSemester, levels, semesters } from '@/components/LevelAndSemesterDropdowns';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import ChangeEmailModal from '@/components/ChangeEmailModal';

// Theme context
import { useTheme } from "../contexts/ThemeContext";
import AppLogo from '@/components/svg/AppLogo';
import SadExpIcon from '@/components/svg/SadExpIcon';
import Loader from '@/components/svg/Loader';
import { useAuthStore } from '@/store/authStore';
import LogoutModal from '@/components/LogoutModal';

function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-end">
          <span className="ml-2">تغيير المظهر</span>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuItem onClick={() => setTheme("light")} className="">
          <div className="flex flex-row-reverse items-center justify-between w-full">
            <div className="flex flex-row-reverse items-center justify-center">
             <Sun className="ml-2 h-4 w-4 ml-4" />
             <span>فاتح</span>
            </div>
            <div className={`h-[6px] w-[6px] rounded-full ${theme === 'light' && 'bg-foreground'}`}></div>
          </div>

        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex flex-row-reverse items-center">
          <div className="flex flex-row-reverse items-center justify-between w-full">
            <div className="flex flex-row-reverse items-center justify-center">
             <Moon className="ml-2 h-4 w-4 ml-4" />
             <span>داكن</span>
            </div>
            <div className={`h-[6px] w-[6px] rounded-full ${theme === 'dark' && 'bg-foreground'}`}></div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex flex-row-reverse items-center">
          <div className="flex flex-row-reverse items-center justify-between w-full">
            <div className="flex flex-row-reverse items-center justify-center">
             <Laptop className="ml-2 h-4 w-4 ml-4" />
             <span>تلقائي</span>
            </div>
            <div className={`h-[6px] w-[6px] rounded-full ${theme === 'system' && 'bg-foreground'}`}></div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



function ChangePasswordModal({ isOpen, setIsOpen }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false); // State for old password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // State for new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6 || oldPassword.length < 6 || confirmPassword.length < 6) {
      setError('يجب أن لا تقل كلمة المرور عن 6 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('يرجى التأكد من تطابق كلمتي المرور الجديدتين');
      return;
    }
    
    setError('');
    setLoading(true);
  
    try {
      await resetPassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowOldPassword(false);
      setShowConfirmPassword(false);
      setIsOpen(false);
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      let errMsg = 'حدث خطأ أثناء تغيير كلمة المرور';
      
      if (error.response?.data?.message === 'Passwords do not match') {
        errMsg = 'كلمة المرور الحالية خاطئة';
      }
      if (error.response?.status === 429) {
        errMsg = "لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة بعد فترة من الوقت";
        }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95%] rounded sm:max-w-[425px] select-none">
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="old-password">كلمة المرور الحالية</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOldPassword ? 'text' : 'password'} // Toggle password visibility
                className="text-right pl-10"
                value={oldPassword}
                onChange={(e) => {
  setOldPassword(e.target.value);
  setError('');
}}
                
              />
              <div
                onClick={() => setShowOldPassword(!showOldPassword)} // Toggle old password visibility
                className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

        
          <div className="space-y-2 text-right">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'} // Toggle password visibility
                className="text-right pl-10" 
                value={newPassword}
                onChange={(e) => {
  setNewPassword(e.target.value);
  setError('');
}}
                
              />
              <div
                onClick={() => setShowNewPassword(!showNewPassword)} // Toggle new password visibility
                className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

      
          <div className="space-y-2 text-right">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'} // Toggle password visibility
                className="text-right pl-10"
                value={confirmPassword}
                onChange={(e) => {
  setConfirmPassword(e.target.value);
  setError('');
}}
                
              />
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
                className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-right">{error}</p>}
          <DialogFooter>
            <Button type="submit">
              {loading ? <Loader /> : 'تغيير كلمة المرور'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



export function Header({ courses }) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  
  const { user } = useAuthStore();
  const location = useLocation();
  
  useEffect(() => {
    const userName = localStorage.getItem('name');
    const userId = localStorage.getItem('id');
    if (userName && userId) {
      setName(userName);
      setId(userId);
      return;
    }

    if (user) {
      setName(user.name);
      setId(user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('id', user.id);
    }
  }, [])
  


const AssignmentsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        className="w-full justify-end select-none relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>التكليفات</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isOpen && (user?.isAdmin || user?.role === "tutor") && (
        <div className="pr-4">
          <SheetClose asChild>
            <Link to={`/${user?.isAdmin ? "admin" : "tutor"}-panel/assignments/manage-assignments`}>
              <Button variant="ghost" className="w-full justify-end select-none relative overflow-hidden">
                {location.pathname.endsWith("/assignments/manage-assignments") && 
                  <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                <span>إدارة التكليفات</span>
                <LayoutPanelLeft className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link to={`/${user?.isAdmin ? "admin" : "tutor"}-panel/assignments/manage-grades`}>
              <Button variant="ghost" className="w-full justify-end select-none relative overflow-hidden">
                {location.pathname.endsWith("/assignments/manage-grades") && 
                  <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                <span>إدارة الدرجات</span>
                <GraduationCap className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>
        </div>
      )}
    </div>
  );
};



  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[400px] p-0 border-l-[hsl(222.2,47.4%,11.2%)] overflow-y-auto">
            <div className="text-center flex gap-1 items-center justify-center bg-primary text-primary-foreground py-16">
                <span className="font-bold text-3xl select-none">
                  دَرَجاتي
                </span>
                <AppLogo width={50} height={50} color='hsl(var(--primary-foreground))' />
              </div>
            <nav className="flex flex-col space-y-3 p-6">
              <div className="flex items-center mb-6 mt-6 ml-auto">
                <div className="flex flex-col items-end mr-2">
                  {!name || !id ? (<div>
                    <Skeleton className="h-4 w-36 ml-auto mb-1" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </div>) : ( <>
                  <h2 className="font-semibold text-md sm:text-lg text-right rtl">{user?.role === "tutor" && " المحاضر/ "}{name}</h2>
                  <p className="text-sm text-muted-foreground">{id}</p>
                  </>)
                  }
                </div>
                <User className="h-10 w-10" />
              </div>
              {user?.role === "student" && <SheetClose asChild>
              <Link to="/">
                <Button variant="ghost" className="w-full justify-end select-none relative overflow-hidden">
                {location.pathname === "/" && 
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                  <span>الرئيسية</span>
                  <Home className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </SheetClose>
              }
           {user?.role === "student" && <SheetClose asChild>
              <Link to="/assignments">
                <Button variant="ghost" className="w-full justify-end select-none relative overflow-hidden">
                {location.pathname === "/assignments" && 
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                  <span>التكاليف</span>
                  <FileText className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </SheetClose>
              }
              {(user?.isAdmin || user?.role === 'tutor') && (
                <>
              <SheetClose asChild>
              <Link to={user?.isAdmin ? "/admin-panel" : "/tutor-panel"} end >
                <Button variant="ghost" className="w-full justify-end select-none relative"
                >
                {(location.pathname === '/admin-panel' || location.pathname === "/tutor-panel") &&
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                    <span>لوحة التحكم</span>
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              </SheetClose>
              </>
              )}
              {user?.isAdmin && (
                <SheetClose asChild>
                <Link to="/admin-panel/users">
                <Button variant="ghost" className="w-full justify-end select-none relative"
                >
                {location.pathname.endsWith("/users") &&
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                    <span>المستخدمون</span>
                  <User className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </SheetClose>
                )}
                              {user?.isAdmin && (
                <SheetClose asChild>
                <Link to="/admin-panel/courses">
                <Button variant="ghost" className="w-full justify-end select-none relative"
                >
                {location.pathname.endsWith("/courses") &&
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                    <span>المقررات</span>
                  <Book className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </SheetClose>
                )}
              {(user?.isAdmin || user?.role === "tutor") && (
              <SheetClose asChild>
                <Link to={`/${user?.isAdmin ? "admin-panel" : "tutor-panel"}/activities`}>
                <Button variant="ghost" className="w-full justify-end select-none relative"
                >
                {location.pathname.endsWith("/activities") &&
                <div className="absolute right-[1px] top-1/2 h-[60%] w-[3px] bg-primary -translate-y-1/2 rounded-full"></div>
                }
                    <span>الأنشطة</span>
                  <Activity className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </SheetClose>
              )}
              
              {(user?.isAdmin || user?.role === "tutor") && <AssignmentsMenu />}
              
              <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-end select-none" onClick={() => setIsChangeEmailOpen(true)}>
                  <span>تغيير البريد الإلكتروني</span>
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-end select-none" onClick={() => setIsChangePasswordOpen(true)}>
                  <span>تغيير كلمة المرور</span>
                  <Key className="ml-2 h-4 w-4" />
                </Button>
              </SheetClose>
              <div className="flex justify-end mr-1 select-none pb-2">
                <ModeToggle />
              </div>
              <div className="border-t w-[60%] ml-auto mr-4" />
              <SheetClose asChild>
                <Button variant="ghost"
                  className="w-full justify-end text-red-500 select-none"
                  onClick={() => setIsLogoutOpen(true)}
                >
                    <span>تسجيل الخروج</span>
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold flex-grow text-center select-none">
          دَرَجاتي
        </h1>
        <div className="flex items-center space-x-4 space-x-reverse">

          <div className="w-10 h-10 flex items-center justify-center select-none">
            <AppLogo color='hsl(var(--primary-foreground))' />
          </div>
        </div>
      </div>
      <ChangePasswordModal isOpen={isChangePasswordOpen} setIsOpen={setIsChangePasswordOpen} />
      <ChangeEmailModal isOpen={isChangeEmailOpen} setIsOpen={setIsChangeEmailOpen} />
      <LogoutModal isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} title='تأكيد تسجيل الخروج' body='هل أنت متأكد من أنك تريد تسجيل الخروح' cta='تسجيل الخروح' />
    </header>
  );
}

export function Footer({ login }) {
  return (
    <footer className="bg-primary/5 py-4 mt-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {login && (
            <span>&copy; {new Date().getFullYear()} دَرَجاتي. جميع الحقوق محفوظة</span>)}
        </p>
        
        {!login && (
        <div className="max-w-[90%] mx-auto">
          <p className="text-sm text-muted-foreground">
            .دَرَجاتي. جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-muted-foreground mt-2 opacity-75">
            &copy; {new Date().getFullYear()} <span className="opacity-60">|</span> Developed and maintained by Mohammed Tawfeek
          </p>
          </div>
        )}
      </div>
    </footer>
  );
}

function StudentGrades({ level, semester, subjects, apiError, setReRequest }) {
  const [expandedSubject, setExpandedSubject] = useState(null);

  const toggleExpand = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

if (!subjects || subjects.length < 1) {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 w-3/4 opacity-50 select-none">
        {!apiError ? (
          <>
            <InfoIcon height={42} width={42} />
            <p
            className="text-center font-semibold">
              ستظهر بيانات مواد المستوى {level} للفصل الدراسي {semester} هنا بمجرد أن يتم رفعهم إلى قاعدة البيانات
            </p>
          </>
        ) : (
        <>
          <SadExpIcon height={80} width={80} />
          <p className='font-semibold -mt-4 text-center'>حدث خطأ أثناء الاتصال بالخادم</p>
          <p className="font-semibold text-center underline hover:opacity-50 md:cursor-pointer" onClick={() => setReRequest((prev) => prev + 1)}>
  إعادة المحاولة
</p>

        </>
        )}
      </div>
    </>
  );
} 

const renderGrade = (grade, maxGrade) => (
  <span className="font-semibold">
    {grade !== null && grade !== undefined ? grade : '?'}
    <span className="text-muted-foreground text-sm ml-1">
      / {maxGrade !== null && maxGrade !== undefined ? maxGrade : '?'}
    </span>
  </span>
);

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {subjects.map((subject, index) => (
        <motion.div
          key={subject._id}
          layout
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full"
        >
          <Card 
            className={`cursor-pointer overflow-hidden transition-shadow duration-300 pb-1 ${
              expandedSubject === subject._id ? 'shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => toggleExpand(subject._id)}
          >
            <CardHeader className="bg-primary/10 text-primary p-4">
              <CardTitle className="text-xl font-bold text-center flex justify-between items-center">
                {expandedSubject === subject._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                <div className="flex justify-center items-center gap-2"><span className="text-lg">{subject.name}</span> {subject.prac && <Badge>
                  <span className="mb-[2px] p-0">عملي</span>
                </Badge>}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className={`p-4 transition-all duration-500 ${
              expandedSubject === subject._id ? 'max-h-[600px]' : 'max-h-24'
            } overflow-hidden`}>
              <ScrollArea className="h-full pl-4">
                <div className="space-y-4 text-right">
                  {subject.grades.termwork && (
                    <div className="flex justify-between items-center">
                      {renderGrade(subject.grades.termwork.grade, subject.grades.termwork.maxGrade)}
                      <Badge variant="outline" className="ml-2">حضور ومشاركة</Badge>
                    </div>
                  )}
                  {subject.grades.midterm && (
                    <div className="flex justify-between items-center">
                      {renderGrade(subject.grades.midterm.grade, subject.grades.midterm.maxGrade)}
                      <Badge variant="outline" className="ml-2">{
                        subject.prac ? "درجات المشروع" : "اختبار نصفي"
                      }</Badge>
                    </div>
                  )}
                  {subject.grades.final && (
                    <div className="flex justify-between items-center">
                      {renderGrade(subject.grades.final.grade, subject.grades.final.maxGrade)}
                      <Badge variant="outline" className="ml-2">{
                        subject.prac ? "اختبار العملي" : "درجات المشروع"
                      }</Badge>
                    </div>
                  )}
                  {subject.grades.activities?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center justify-end mt-4">
                        الأنشطة
                        <Activity className="h-4 w-4 ml-2" />
                      </h4>
                      <AnimatePresence>
                        {expandedSubject === subject._id && subject.grades.activities.map((activity, actIndex) => (
                          <motion.div
                            key={actIndex}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: actIndex * 0.1 }}
                          >
                            <Card className="p-4 bg-secondary/10">
                              <div className="flex justify-between items-center mb-2">
                                {renderGrade(activity.grade, activity.maxGrade)}
                                <span className="font-medium">{activity.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground text-right">{activity.description}</p>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                      {subject.grades.assignments?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center justify-end mt-4">
                        التكاليف
                        <FileText className="h-4 w-4 ml-2" />
                      </h4>
                      <AnimatePresence>
                        {expandedSubject === subject._id && subject.grades.assignments.map((assignment, actIndex) => (
                          <motion.div
                            key={actIndex}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: actIndex * 0.1 }}
                          >
                            <Card className="p-4 bg-secondary/10">
                              <div className="flex justify-between items-center mb-2">
                                {renderGrade(assignment.grade, assignment.maxGrade)}
                                <span className="font-medium">{assignment.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground text-right">{assignment.description}</p>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(4)].map((_, i) => (
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 * i }}>
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-4">
            <Skeleton className="h-6 w-3/4 ml-auto mr-0 -mb-2" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full ml-auto mr-0" />
              <Skeleton className="h-4 w-5/6 ml-auto mr-0" />
              <Skeleton className="h-4 w-4/6 ml-auto mr-0" />
            </div>
          </CardContent>
        </Card>
        </motion.div>
      ))}
    </div>
  );
}

function StudentGradesPage() {
  
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(initialLevel);
  const [semester, setSemester] = useState(initialSemester);
  
  // Recently added
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [reRequest, setReRequest] = useState(1);
  
  const updateLevelAndSemester = (newLevel, newSemester) => {
        setLevel(newLevel);
        setSemester(newSemester);
    };
    
    
    useEffect(() => {
    setError('');

    const levelIndex = levels.indexOf(level);
    const semesterIndex = semesters.indexOf(semester);
    const initialLevelIndex = levels.indexOf(initialLevel);
    const initialSemesterIndex = semesters.indexOf(initialSemester);

    const isIgnoredLevel = levelIndex === 0 || (levelIndex === 1 && semesterIndex === 0);
    const isAboveCurrentLevelOrSemester = 
        (level !== initialLevel || semester !== initialSemester) &&
        (levelIndex > initialLevelIndex || semesterIndex > initialSemesterIndex);

    if (isAboveCurrentLevelOrSemester || isIgnoredLevel) {
      // Render placeholder text
      return setSubjects([]);
    }

    const fetchSubjects = async () => {
        setLoading(true);
        
        const year = levelIndex + 1;
        const term = semesterIndex + 1;
        // Calculate the semester based on year and term
        let semes = year * 2;
        if (term % 2 !== 0) semes--;

        try {
            const response = await axios.get("/courses/student", {
                params: { semes }
            });
            setSubjects(response.data.data);
        } catch (error) {
            setError('Failed to get data');
        } finally {
            setLoading(false);
        }
    };

    fetchSubjects();
}, [level, semester, reRequest]);
  return (

      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
        
        <Header />
        <main className="container mx-auto p-4 sm:p-8 flex-grow">
          <LevelAndSemesterDropdowns sendData={updateLevelAndSemester} loading={loading} />
          {loading ? <LoadingSkeleton /> : <StudentGrades level={level} semester={semester} subjects={subjects} apiError={error} setReRequest={setReRequest} />}
        </main>
        <Footer dev={true} />
      </div>

  );
}

export default StudentGradesPage;

