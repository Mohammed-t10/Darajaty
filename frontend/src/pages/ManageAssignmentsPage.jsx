import React, { useState, useEffect } from "react"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { FileText, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { Header, Footer } from "@/pages/StudentGradesPage"

const ManageAssignmentsPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOption, setSortOption] = useState("name")

  const fetchCourses = async () => {
  setLoading(true)
  setError(null)
  try {
    const response = await axios.get("/courses/assignments?manage=1");
    setCourses(response.data.data)
  } catch (err) {
    setError("حدث خطأ أثناء جلب بيانات المقررات. يرجى المحاولة مرة أخرى.")
    toast.error("فشل في جلب المقررات")
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchCourses()
}, [])

  const handleGradeUpdate = async (courseId, assignmentId, studId, newGrade) => {
    
    const toastId = toast.loading("جارٍ تحديث الدرجة");
    
    try {
      const response = await axios.patch(`/courses/${courseId}/assignments/${assignmentId}/students/${studId}`, { newGrade });

      toast.success("تم تحديث الدرجة بنجاح", { id: toastId })
      
    } catch (error) {
      toast.error("فشل في تحديث الدرجة", { id: toastId })
    }
  }

  const sortStudents = (students) => {
    return [...students].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name)
        case "lastModified":
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case "grade":
          return (b.grade || 0) - (a.grade || 0)
        default:
          return 0
      }
    })
  }
  
  const handleGradeChange = (e, maxGrade) => {
    let grade = e.target.value;
    if (grade === "0") {
      e.target.value = Number(e.target.value);
      return;
    }
    
    if (grade == '') {
      e.target.value = null;
      return;
    }
    
    if (Number(grade) >= Number(maxGrade)) {
      e.target.value = Number(maxGrade);
      return;
    }
    
    const newGrade = Number(e.target.value);
    e.target.value = Number(newGrade.toFixed(2));
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto p-4 grow" dir="rtl">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto p-4 flex flex-col items-center justify-center grow" dir="rtl">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h1 className="text-lg font-bold mb-6 text-center text-red-500">{error}</h1>
        <Button onClick={fetchCourses} className="mt-4">
          <RefreshCw className="mr-2 h-5 w-5" />
          إعادة المحاولة
        </Button>
      </div>
      <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
    <Header />
    <div className="container mx-auto p-4 text-right grow">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary p-2 px-4 rounded-md w-fit opacity-80 mx-auto">التكليفات النشطة</h1>
      <Tabs defaultValue={courses[0]?._id} dir="rtl">
        <TabsList className="mb-4 justify-start h-auto w-fit flex flex-wrap" dir="rtl">
          {courses.map((course) => (
            <TabsTrigger key={course._id} value={course._id}>
              {course.courseName.length > 20 ? course.courseName.slice(0, 20) + "..." : course.courseName}
              {course.prac && " عملي"}
            </TabsTrigger>
          ))}
        </TabsList>
        {courses.map((course) => (
          <TabsContent key={course._id} value={course._id}>
          <h1 className="w-fit rounded-md py-2 px-4 bg-accent text-center mx-auto my-4 font-bold text-xl">{course.courseName}{course.prac && " عملي"}</h1>
            <Accordion type="single" collapsible className="w-full text-right">
              {course.assignments?.length === 0 ? <div className="mx-auto text-center font-semibold text-lg my-8 opacity-80">
              لا توجد تكليفات لهذه المادة بعد
              </div> : course.assignments.map((assignment) => (
                <AccordionItem key={assignment._id} value={assignment._id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="text-right">
                      <h3 className="text-lg font-semibold">{assignment.title.length > 20 ? assignment.title.slice(0, 20) + "..." : assignment.title}</h3>
                      <p className="text-sm text-gray-500">{assignment.description.length > 40 ? assignment.description.slice(0, 40) + "..." : assignment.description}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4" dir="rtl">
                          {assignment.file_url && <div className="flex items-center gap-2">
                            <FileText className="mr-2" />
                            <a
                              href={assignment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 font-semibold"
                            >
                              عرض ملف التكليف
                            </a>
                          </div>}
                          <div className="mt-4">
                            <p>الدرجة القصوى: <span className="font-semibold">{assignment.maxGrade}</span></p>
                            <p className="my-2">تاريخ البدء:    {format(new Date(assignment.startTime), "PP h:mm a", { locale: ar })}</p>
                            <p>تاريخ النهاية:    {format(new Date(assignment.endTime), "PP h:mm a", { locale: ar })}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full" dir="rtl">
                        {assignment.students?.length === 0 ? <div className="mx-auto my-8 font-semibold text-lg opacity-90">لم يقم أحد بتقديم حل بعد</div> :
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold">الطلاب</h4>
                            <Select onValueChange={(value) => setSortOption(value)}>
                              <SelectTrigger className="w-[180px]" dir="rtl">
                                <SelectValue placeholder="ترتيب حسب" />
                              </SelectTrigger>
                              <SelectContent dir="rtl">
                                <SelectItem value="name">الاسم</SelectItem>
                                <SelectItem value="lastModified"> تاريخ الرفع</SelectItem>
                                <SelectItem value="grade">الدرجة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        }
                          {sortStudents(assignment.students).map((student) => (
                            <div key={student.studId} className="mb-4 p-4 border rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-semibold">{student.name}</h5>
                                <a
                                  href={student.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline font-semibold"
                                >
                                  عرض الحل
                                </a>
                              </div>
                              <div className="text-sm text-gray-500 my-4 flex justify-start items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                تاريخ الرفع:&nbsp;
                              
                                   {format(new Date(student.lastModified), "PP h:mm a", { locale: ar })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`grade-${student.studId}`} className="mr-2 font-semibold">
                                  الدرجة:
                                </Label>
                                <Input
                                  onChange={(e) => handleGradeChange(e, assignment.maxGrade)}
                                  id={`grade-${student.studId}`}
                                  type="number"
                                  defaultValue={student.grade ?? ""}
                                  className="w-20 mr-2"
                                  min={0}
                                  max={assignment.maxGrade}
                                />
                                <Button
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling
                                    const newGrade = input.value
                                    handleGradeUpdate(course._id, assignment._id, student.studId, newGrade)
                                  }}
                                >
                                  تحديث
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    <Footer />
    </div>
  )
}

export default ManageAssignmentsPage

