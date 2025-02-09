import { useState, useEffect } from 'react'
import { axiosInstance as axios } from '@/api/axiosInstance'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from "@/contexts/ThemeContext"
import { Loader2, ChevronDown, ChevronUp, User, LogOut, Moon, Sun, FileSearch, Activity } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Header, Footer } from '@/pages/StudentGradesPage'
import SadExpIcon from '@/components/svg/SadExpIcon'
import { useAuthStore } from '@/store/authStore'
import getCurrentSemester from '../utils/getCurrentSemester'
import ScrollToTopButton from "@/components/ScrollToTop"

const EnhancedCourseGrades = () => {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loadingStates, setLoadingStates] = useState({})
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reRequest, setReRequest] = useState(0)
  const [semester, setSemester] = useState(getCurrentSemester());
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const studentsResponse = await axios.get("/users/students")
        setStudents(studentsResponse.data.students)

        const coursesResponse = await axios.get("/courses", {params: {semester}})
        setCourses(coursesResponse.data.data || [])
      } catch (error) {
        if (error.response?.data?.message.includes("No active courses found")) {
          setCourses([]);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    } 

    fetchData()
  }, [reRequest, semester])
  
  const handleGradeUpdate = async (courseId, updatedGrades, type = 'course') => {
    const loadingToast = toast.loading('جارٍ تحديث الدرجات');
    
    try {
        const activityId = updatedGrades.activityId;
        const endpoint = activityId 
            ? `/courses/${courseId}/activities/${activityId}` 
            : `/courses/${courseId}`;

        // Define grades outside the block
        const grades = activityId 
            ? (({ activityId, ...rest }) => rest)(updatedGrades) 
            : updatedGrades;
            
        // Use the modified or original grades in the request
        if (user?.isAdmin && !activityId) {
          await axios.put(endpoint, grades);
        } else {
          await axios.patch(endpoint, grades);
        }
        
        toast.success('تم تحديث الدرجات بنجاح', { id: loadingToast });
    } catch (error) {
        toast.error('حدث خطأ أثناء تحديث الدرجات', { id: loadingToast });
    }
};
  
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]; // Stringified numbers

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      {!loading ? (
  error ? ( // Check if there's an error
    <div className="grow flex flex-col items-center justify-center gap-3 w-full opacity-50 select-none">
    <>
          <SadExpIcon height={80} width={80} />
          <p className='font-semibold -mt-4 text-center'>حدث خطأ أثناء الاتصال بالخادم</p>
          <p className="font-semibold text-center underline hover:opacity-50 md:cursor-pointer" onClick={() => setReRequest((prev) => prev + 1)}>
  إعادة المحاولة
</p>
</>
    </div>
  ) : courses.length === 0 ? ( // Check if there are no courses
    <div className="grow flex flex-col items-center justify-between gap-3 w-full select-none">
        { user.isAdmin &&
      <div className="my-4 text-right ml-auto mr-2">
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-48">
      الفصل الدراسي: {semester} <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {semesters.map((s) => (
      <DropdownMenuItem key={s} onSelect={() => setSemester(s)}>
        <div className="ml-auto">{s}</div>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    }
    <div className="opacity-50 flex flex-col gap-2 items-center justify-center">
          <FileSearch className="h-10 w-10 mb-4" />
          <p className='font-semibold -mt-4 text-center text-lg'>ليس هنالك أي مواد بعد</p>
          </div>
          <div className="opacity-0">.</div>
    </div>
    
  ) : (
    <main className="grow container mx-auto p-4">
    { user.isAdmin &&
      <div className="mb-4 text-right ml-auto">
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-48">
      الفصل الدراسي: {semester} <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {semesters.map((s) => (
      <DropdownMenuItem key={s} onSelect={() => setSemester(s)}>
        <div className="ml-auto">{s}</div>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    }
      <Tabs defaultValue={courses[0]?._id} className="w-full" dir="rtl">
        <TabsList className="w-fit mb-4 bg-muted/50 p-1 rounded-md overflow-auto block ml-auto text-center h-fit">
          {courses.map((course) => (
            <TabsTrigger
              key={course._id}
              value={course._id}
              className="text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                   <span className="text-sm">
  {course.prac
    ? course.courseName.length > 25
      ? `...عملي ${course.courseName.substring(0, 25)}`
      : `عملي ${course.courseName}`
    : course.courseName.length > 25
    ? `...${course.courseName.substring(0, 25)}`
    : course.courseName}
</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{course.courseName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
          ))}
        </TabsList>

        {courses.map((course) => (
          <TabsContent key={course._id} value={course._id}>
            <CourseSection
              course={course}
              students={students}
              onGradeUpdate={handleGradeUpdate}
              loading={loadingStates[`course-${course._id}`]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
) : (
  <>
  <Skeleton className="h-10 w-[80%] my-4 mt-6 mx-auto" />
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-3/4 ml-auto mr-0 -mb-2" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full ml-auto mr-0" />
            <Skeleton className="h-4 w-full ml-auto mr-0" />
            <Skeleton className="h-4 w-5/6 ml-auto mr-0" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
  </>
)}

      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

const CourseSection = ({ course, students, onGradeUpdate, loading }) => {
  const [maxMidterm, setMaxMidterm] = useState(course.maxMidterm || '');
  const [maxTermwork, setMaxTermwork] = useState(course.maxTermwork || '');
  const [maxFinal, setMaxFinal] = useState(course.maxFinal || '');
  
  const [grades, setGrades] = useState(
    students.map(student => ({
      studId: student._id,
      studGrades: course.studentsSubjectsGrades.find(g => g.studId === student._id)?.studGrades || {
        midterm: null,
        termwork: null,
        final: null
      }
    }))
  )
  const [isOpen, setIsOpen] = useState(true)
  const { user } = useAuthStore();

  const handleGradeChange = (studId, gradeType, value) => {
    
// Limit value to 100 if it's a number
  if (value !== null && value !== undefined && value > 100) {
    value = 100;
  }

  // Parse value as a number or leave as null
  if (value !== null && value !== undefined && value !== "") {
    value = Number(value).toFixed(2); // Format to two decimals
    value = Number(value); // Convert back to a number
  } else if (value === "") {
    value = null; // Convert empty string to null
  }
    
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.studId === studId 
          ? { ...grade, studGrades: { ...grade.studGrades, [gradeType]: value } }
          : grade
      )
    )
  }

  const handleUpdate = () => {
    const updatedGrades = {
      studentsSubjectsGrades: grades.map(({ studId, studGrades }) => ({ studId, studGrades }))
    }
    onGradeUpdate(course._id, updatedGrades)
  }
  
  const handleCourseGradeUpdate = async (courseId) => {
    const grades = {};

// Dynamically push values to the object
  if (maxMidterm !== null && maxMidterm !== undefined && maxMidterm !== '') {
    grades.maxMidterm = Number(maxMidterm);
} else {
  grades.maxMidterm = null;
}

  if (maxTermwork !== null && maxTermwork !== undefined && maxTermwork !== '') {
    grades.maxTermwork = Number(maxTermwork);
} else {
  grades.maxTermwork = null;
}

  if (maxFinal !== null && maxFinal !== undefined && maxFinal !== '') {
      grades.maxFinal = Number(maxFinal);
} else {
  grades.maxFinal = null;
}
    
    const loadingToast = toast.loading('جارٍ تحديث الدرجات');
    
    try {
      if (!user?.isAdmin) {
        await axios.patch(`/courses/${courseId}`, grades);
      } else {
        await axios.put(`/courses/${courseId}`, grades);
      }
        
        toast.success('تم تحديث الدرجات بنجاح', { id: loadingToast });
    } catch (error) {
        toast.error('حدث خطأ أثناء تحديث الدرجات', { id: loadingToast });
    }
  }

  return (
    <>
            <Card className="mb-8">
          <CardContent>
            <div className="text-right">
                <h1 className="text-xl mb-6 mt-2 font-bold opacity-75">الدرجات القصوى</h1>
                <div className="flex gap-2">
                <div className="flex flex-col">
                  <Label className="mb-1 text-right">حضور ومشاركة</Label>
                  <Input
                    type="number"
                    className="text-right"
                    value={maxTermwork}
                    max={100}
                    onChange={(e) => {
  const value = e.target.value;
  setMaxTermwork(
    value !== '' 
      ? Math.min(Number(Number(value).toFixed(2)), 100) 
      : ''
  );
}}
                  />
                </div>
                  <div className="flex flex-col">
                  <Label className="mb-1 text-right">{
                    course.prac ? "درجات المشروع" : "اختبار نصفي"
                  }</Label>
                  <Input
                    type="number"
                    className="text-right"
                    value={maxMidterm}
                    max={100}
                    onChange={(e) => {
  const value = e.target.value;
  setMaxMidterm(
    value !== '' 
      ? Math.min(Number(Number(value).toFixed(2)), 100) 
      : ''
  );
}}
                  />
                </div>
                  
                  <div className="flex flex-col">
                  <Label className="mb-1 text-right">{
                    course.prac ? "اختبار العملي" : "درجات المشروع"
                  }</Label>
                  <Input
                    type="number"
                    className="text-right"
                    value={maxFinal}
                    max={100}
                    onChange={(e) => {
  const value = e.target.value;
  setMaxFinal(
    value !== '' 
      ? Math.min(Number(Number(value).toFixed(2)), 100) 
      : ''
  );
}}
                  />
                </div>
                
                </div>
                <div>
                  <Button className="mt-6 w-full" onClick={() => handleCourseGradeUpdate(course._id)}>
              تحديث الدرجات
            </Button>
                </div>
              </div>
          </CardContent>
        </Card>
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex items-center w-full justify-between mb-2 rounded-full">
          <span className="text-lg font-semibold">{course.prac ? course.courseName + ' عملي' : course.courseName}</span>
          {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-row-reverse flex-wrap gap-4">
              {grades.map((grade, index) => {
                const student = students.find(s => s._id === grade.studId)
                return (
                  <div key={grade.studId} className="flex flex-col space-y-2 bg-muted/20 p-4 rounded-lg flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg ml-2">{index + 1}.</span>
                      <Input value={student?.name || ''} readOnly className="font-bold text-lg text-right" />
                    </div>
                    <div className="flex gap-2 pt-4">            <GradeInput
                        label="حضور ومشاركة"
                        value={grade.studGrades.termwork}
                        max={100}
                        onChange={(value) => handleGradeChange(grade.studId, 'termwork', value)}
                      />
                      <GradeInput
                        label={
                    course.prac ? "درجات المشروع" : "اختبار نصفي"
                  }
                        value={grade.studGrades.midterm}
                        max={100}
                        onChange={(value) => handleGradeChange(grade.studId, 'midterm', value)}
                      />                       <GradeInput
                        label={
                    course.prac ? "اختبار العملي" : "درجات المشروع"
                  }
                        value={grade.studGrades.final}
                        max={100}
                        onChange={(value) => handleGradeChange(grade.studId, 'final', value)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Button className="mt-6 w-full" onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              تحديث الدرجات
            </Button>
          </CardContent>
        </Card>
        {course.activities.length > 0 && 
        (
          <div className="flex flex-row-reverse items-center justify-end gap-2 text-right mr-0 ml-auto mt-12 opacity-50">
            <Activity size={24} />
            <h1 className="text-2xl text-right font-bold text-foreground">الأنشطة</h1>
          </div>
        )}
        {course.activities.map((activity) => (
          <ActivitySection
            key={activity._id}
            activity={activity}
            students={students}
            onGradeUpdate={(updatedGrades) => onGradeUpdate(course._id, { activityId: activity._id, studentGrades: updatedGrades }, `activity-${activity._id}`)}
            loading={loading}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
    </>
  )
}

const ActivitySection = ({ activity, students, onGradeUpdate, loading }) => {
  const [grades, setGrades] = useState(
    students.map(student => ({
      studId: student._id,
      studGrade: activity.studentGrades.find(g => g.studId === student._id)?.studGrade || null
    }))
  )
  const [isOpen, setIsOpen] = useState(true)

  const handleGradeChange = (studId, value, maxGrade) => {
    // Limit value so it doesn't exceed max grade if it's a number
  if (value !== null && value !== undefined && value > Number(maxGrade)) {
    value = Number(maxGrade);
  }

  // Parse value as a number or leave as null
  if (value !== null && value !== undefined && value !== "") {
    value = Number(value).toFixed(2); // Format to two decimals
    value = Number(value); // Convert back to a number
  } else if (value === "") {
    value = null; // Convert empty string to null
  }
    
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.studId === studId 
          ? { ...grade, studGrade: value }
          : grade
      )
    )
  }

  const handleUpdate = () => {
    onGradeUpdate(grades)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex items-center w-full justify-between mb-2 my-6">
          <span className="text-xl font-semibold text-center">{activity.name}</span>
          {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-6 bg-secondary/10">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-right">{activity.name}</h3>
              <p className="text-muted-foreground text-right">{activity.description}</p>
            </div>
            <div className="flex flex-row-reverse flex-wrap gap-4">
              {grades.map((grade, index) => {
                const student = students.find(s => s._id === grade.studId)
                return (
                  <div key={grade.studId} className="flex flex-col space-y-2 bg-background p-4 rounded-lg flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg ml-2">{index + 1}.</span>
                      <Input value={student?.name || ''} readOnly className="font-bold text-lg text-right" />
                    </div>
                    <GradeInput
                      label="الدرجة"
                      value={grade.studGrade}
                      max={100}
                      onChange={(value) => handleGradeChange(grade.studId, value, activity.maxGrade)}
                    />
                  </div>
                )
              })}
            </div>
            <Button className="mt-6 w-full" onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              تحديث درجات النشاط
            </Button>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

const GradeInput = ({ label, value, max, onChange }) => {
  return (
    <div className="flex flex-col">
      <Label className="mb-1 text-right">{label}</Label>
      <Input
        type="number"
        value={value === null ? "" : value} // Convert `null` to an empty string for input
        onChange={(e) => {
          const newValue = e.target.value === "" ? null : e.target.value; // Handle null when cleared
          onChange(newValue);
        }}
        className="text-right"
      />
    </div>
  );
};


export default EnhancedCourseGrades  
