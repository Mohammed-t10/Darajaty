import React, { useState, useEffect, useCallback } from "react"
import { format, formatDistance, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"
import { ar } from "date-fns/locale"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Upload, Trash2, RefreshCw, AlertTriangle, Eye, Edit2, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import {Header, Footer } from "@/pages/StudentGradesPage";
import getCurrentSemester from "@/utils/getCurrentSemester"
import DarajatyAI from "@/components/DarajatyAI"

const CourseAssignments = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState({})

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("/courses/assignments/student")
      setCourses(response.data.data)
    } catch (err) {
      setError("حدث خطأ أثناء جلب بيانات المقررات. يرجى المحاولة مرة أخرى.")
      toast.error("فشل في جلب المقررات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleFileUpload = async (courseId, assignmentId, file) => {
    const formData = new FormData()
    formData.append("file", file)
    
    const toastId = toast.loading("جارٍ رفع الملف")

    try {
      setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: 0 }))
      const response = await axios.post(`/courses/${courseId}/assignments/${assignmentId}/student`, formData, {
        timeout: 300000, // 5 minutes
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: percentCompleted }))
        },
      })

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                assignments: course.assignments.map((assignment) =>
                  assignment._id === assignmentId
                    ? {
                        ...assignment,
                        students: [
                          {
                            _id: "newSubmission",
                            name: "الطالب الحالي",
                            file_url: response.data.fileUrl,
                            grade: null,
                            lastModified: new Date().toISOString(),
                          },
                        ],
                      }
                    : assignment,
                ),
              }
            : course,
        ),
      )

      toast.success("تم رفع الملف بنجاح", { id: toastId })
    } catch (error) {
      toast.error("فشل في رفع الملف", { id: toastId })
    } finally {
      setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: 0 }))
    }
  }

  const handleDeleteSubmission = async (courseId, assignmentId) => {
    const toastId = toast.loading("جارٍ حذف الملف")
    try {
      await axios.delete(`/courses/${courseId}/assignments/${assignmentId}/student`)
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                assignments: course.assignments.map((assignment) =>
                  assignment._id === assignmentId ? { ...assignment, students: [] } : assignment,
                ),
              }
            : course,
        ),
      )
      toast.success("تم حذف الملف بنجاح", { id: toastId })
    } catch (error) {
      toast.error("فشل في حذف الملف", { id: toastId })
    }
  }

  const handleUpdateSubmission = async (courseId, assignmentId, file) => {
    const formData = new FormData()
    formData.append("file", file)
    
    const toastId = toast.loading("جارٍ تحديث الملف")

    try {
      setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: 0 }))
      const response = await axios.patch(`courses/${courseId}/assignments/${assignmentId}/student`, formData, {
        timeout: 300000,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: percentCompleted }))
        },
      })

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                assignments: course.assignments.map((assignment) =>
                  assignment._id === assignmentId
                    ? {
                        ...assignment,
                        students: assignment.students.map((student) => ({
                          ...student,
                          file_url: response.data.fileUrl,
                          lastModified: new Date().toISOString(),
                        })),
                      }
                    : assignment,
                ),
              }
            : course,
        ),
      )

      toast.success("تم تحديث الملف بنجاح", { id: toastId })
    } catch (error) {
      toast.error("فشل في تحديث الملف", { id: toastId })
    } finally {
      setUploadProgress((prev) => ({ ...prev, [`${courseId}-${assignmentId}`]: 0 }))
    }
  }

  function FileUploadButton({ onFileSelect }) {
    
    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file.type !== "application/pdf") {
          return toast.error("يجب اختيار ملف بي دي إف");
        }
        if (file?.size > 10 * 1024 * 1024) {
          return toast.error("يجب أن لا يتجاوز حجم الملف 10 ميجا بايت");
        }
        if (file) onFileSelect(file)
    };
    
    return (
    <div className="relative">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors duration-300"
      >
        <Upload className="ml-2 mr-2 h-5 w-5" />
        رفع الملف
      </label>
    </div> );
  }
  

function TimeLeft({ assignment }) {
  const now = new Date();
  const endTime = new Date(assignment.endTime);
  const timeLeftInDays = differenceInDays(endTime, now);
  const timeLeftInHours = differenceInHours(endTime, now);
  const timeLeftInMinutes = differenceInMinutes(endTime, now);

  // Determine the color and text based on the time left
  let textColor;
  let timeLeftText;

  if (timeLeftInHours > 48) {
    textColor = "text-green-500";
    timeLeftText = `${timeLeftInDays} ${timeLeftInDays === 1 ? "يوم" : "أيام"}`;
  } else if (timeLeftInHours <= 48 && timeLeftInHours > 24) {
    textColor = "text-yellow-500";
    timeLeftText = `${timeLeftInDays} ${timeLeftInDays === 1 ? "يوم" : "أيام"}`;
  } else if (timeLeftInHours <= 24 && timeLeftInHours > 0) {
    textColor = "text-red-500";
    timeLeftText = `${timeLeftInHours} ساعة`;
  } else if (timeLeftInMinutes > 0 && timeLeftInMinutes < 60) {
    textColor = "text-red-500";
    timeLeftText = `${timeLeftInMinutes} ${timeLeftInMinutes <= 10 ? "دقائق" : "دقيقة"}`;
  } else {
    textColor = "text-red-500";
    timeLeftText = "انتهى الوقت";
  }

  return (
    <div className="flex justify-between items-center mt-2">
      <span className="font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        الوقت المتبقي:
      </span>
      <span className={`${textColor} font-semibold`}>
        {timeLeftText !== "انتهى الوقت"
          ? formatDistance(endTime, now, { locale: ar, addSuffix: false })
          : "انتهى الوقت"}
      </span>
    </div>
  );
}


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto p-4 grow" dir="rtl">
        {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 * i }}>
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
          </motion.div>
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
        <motion.div className="flex flex-col justify-center items-center gap-4" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <AlertTriangle className="h-10 w-10 text-red-600" />
          <h1 className="text-lg font-semibold text-center text-red-600">{error}</h1>
          <Button onClick={fetchCourses} className="mt-2">
            إعادة المحاولة
            <RefreshCw className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
      <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
    <Header />
    <div className="container mx-auto p-4 grow" dir="rtl">
      <motion.div
        className="text-2xl font-bold mb-8 mt-2 text-center flex justify-center items-center gap-2 text-primary"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span>الفصل الدراسي:</span>
        <span>{getCurrentSemester()}</span>
      </motion.div>
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AnimatePresence>
        {
          courses?.length === 0 && (
              <div className="text-lg font-semibold text-gray-500 text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 justify-center items-center w-full">
              <FileText className="h-8 w-8" />
              <span>
                لا توجد أي تكاليف بعد للفصل الدراسي {getCurrentSemester()}</span>
              </div>
            )
        }
          {courses?.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem value={course._id} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="text-xl font-semibold bg-primary text-primary-foreground p-4 hover:no-underline hover:bg-primary/90">
                  {course.courseName.length > 30 ? course.courseName.slice(0, 30) + "..." : course.courseName}
                  {course.prac && " عملي"}
                </AccordionTrigger>
                <AccordionContent className="bg-background p-4">
                  <div className="grid gap-6">
                    {course.assignments?.map((assignment) => (
                      <Card
                        key={assignment._id}
                        className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <CardHeader className="bg-secondary">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">الدرجة القصوى:</span>
                              <span className="font-semibold">{assignment.maxGrade ?? '?'}</span>
                            </div>
<div className="flex justify-between items-center">
  <span className="font-semibold">تاريخ البدء:</span>
  <span>{format(new Date(assignment.startTime), "PP h:mm a", { locale: ar })}</span>
</div>
                     <div className="flex justify-between items-center">
  <span className="font-semibold">زمن التسليم:</span>
  <span>
   {format(new Date(assignment.endTime), "PP h:mm a", { locale: ar })}
  </span>
</div>
  <TimeLeft assignment={assignment} />
                            {assignment.file_url && (
                              <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => window.open(assignment.file_url, "_blank")}
                              >
                                <FileText className="h-5 w-5" />
                                عرض تفاصيل التكليف
                              </Button>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="bg-secondary/50">
                          {assignment.students.length > 0 ? (
                            <div className="w-full">
                              <h3 className="font-semibold mb-4 text-lg mt-4">الحل المقدم:</h3>
                              {assignment.students?.map((student) => (
                                <div
                                  key={student?.studId}
                                  className="flex justify-between items-center mb-4 bg-background p-4 rounded-lg"
                                >
                                  <div>
        <p className="text-sm text-muted-foreground my-2">
  تم التسليم: {format(new Date(student?.lastModified), "PP h:mm a", { locale: ar })}
</p>
                                    {true && (
                                      <p className="font-semibold text-primary">
                                <span className="text-secondary-foreground font-semibold">الدرجة:</span>{student?.grade ?? '?'}/{assignment.maxGrade ?? '?'}
                                      </p>
                                    )}
                                  </div>
                                  <div className={`flex flex-col justify-center items-center gap-2`}>
                                    <Button variant="outline" onClick={() => window.open(student?.file_url, "_blank")}>
                                      <Eye className="h-5 w-5" />
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" className={`${new Date(assignment.endTime) < new Date() || assignment.students?.[0]?.grade != null ? "opacity-50 pointer-events-none" : ""}`}><Edit2 className="h-5 w-5" /></Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>تعديل الحل المقدم</DialogTitle>
                                          <DialogDescription>
                                          <div className="my-2">
                                        قم برفع ملف جديد لتحديث حل التكليف
                              </div>            </DialogDescription>
                                        </DialogHeader>
                                        <FileUploadButton 
                                          onFileSelect={(file) =>
                                            handleUpdateSubmission(course._id, assignment._id, file)
                                          }
                                        />
                                        {uploadProgress[`${course._id}-${assignment._id}`] > 0 && (
                       <div className="flex flex-col justify-end"> 
                       <div>
                       <Progress
                                            value={uploadProgress[`${course._id}-${assignment._id}`]}
                                            className="mt-2"
                                          />
                              </div>
                              <div className="mt-2 font-semibold opacity-60 mx-auto text-primary">
                              {uploadProgress[`${course._id}-${assignment._id}`]}%
                              </div>
                                          </div>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className={`${new Date(assignment.endTime) < new Date() || assignment.students?.[0]?.grade != null ? "opacity-50 pointer-events-none" : ""}`}>
                                          <Trash2 className="h-5 w-5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>هل أنت متأكد من حذف الحل؟</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحل المقدم نهائيًا.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteSubmission(course._id, assignment._id)}
                                          >
                                            تأكيد الحذف
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={`w-full ${new Date(assignment.endTime) < new Date() || assignment.students?.[0]?.grade != null ? "opacity-50 pointer-events-none" : ""}`}>
                              <h3 className="font-semibold mb-4 text-lg mt-4">تسليم الحل:</h3>
                              <FileUploadButton
                                onFileSelect={(file) => handleFileUpload(course._id, assignment._id, file)}
                              />
                              {uploadProgress[`${course._id}-${assignment._id}`] > 0 && (
                                <div className="flex flex-col justify-end">
                                <div>
                                <Progress value={uploadProgress[`${course._id}-${assignment._id}`]} className="mt-4" />
                            </div>
                            <div className="mx-auto text-center font-semibold mt-2 opacity-60 text-primary">
                            {uploadProgress[`${course._id}-${assignment._id}`]}%
                            </div>
                            </div>
                              )}
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </Accordion>
    </div>
    <DarajatyAI />
    <Footer />
    </div>
  )
}

export default CourseAssignments