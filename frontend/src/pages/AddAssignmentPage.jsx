import React, { useState, useEffect, useRef } from "react"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { Header, Footer } from "@/pages/StudentGradesPage"
import { convertImageToPDF } from "@/utils/convertImageToPDF"

const API_BASE_URL = "http://localhost:4000/"

const AddAssignmentPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [retry])

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("/courses/assignments?manage=0")
      setCourses(response.data.data)
    } catch (err) {
      setError("حدث خطأ ما، يرجى إعادة المحاولة")
      toast.error("فشل في جلب التكليفات")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssignment = async (courseId, newAssignment) => {
  const toastId = toast.loading("جارٍ إضافة التكليف");
  try {
    const formData = new FormData();
    Object.keys(newAssignment).forEach((key) => {
      if (key === "file" && newAssignment[key]) {
        formData.append("file", newAssignment[key]);
      } else {
        if (newAssignment[key] !== null && newAssignment[key] !== "null") {
          
          formData.append(key, newAssignment[key]);
        }
      }
    });

    await axios.post(`/courses/${courseId}/assignments`, formData, {
      timeout: 300000,
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update state with the new assignment
    toast.success("تمت إضافة التكليف بنجاح", { id: toastId });
    setRetry(!retry);
  } catch (err) {
    toast.error("فشل في إضافة التكليف", { id: toastId });
  }
};

const handleUpdateAssignment = async (courseId, assignmentId, updatedAssignment) => {
  const toastId = toast.loading("جارٍ تحديث التكليف");
  const optionalFields = ["maxGrade", "startTime"]
  try {
    const formData = new FormData();
    Object.keys(updatedAssignment).forEach((key) => {
      if (key === "file") {
        formData.append("file", updatedAssignment[key]);
      } else if (optionalFields.includes(key)) {
        formData.append(key, updatedAssignment[key]);
      } else {
        if ((updatedAssignment[key] !== null && updatedAssignment[key] !== "null")) {
          formData.append(key, updatedAssignment[key]);
        }
      }
    });

    await axios.patch(`/courses/${courseId}/assignments/${assignmentId}`, formData, {
      timeout: 300000,
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("تم تحديث التكليف بنجاح", { id: toastId });
    setRetry(!retry);
  } catch (err) {
    toast.error("فشل في تحديث التكليف", { id: toastId });
  }
};

const handleDeleteAssignment = async (courseId, assignmentId) => {
  const toastId = toast.loading("جارٍ حذف التكليف");
  try {
    await axios.delete(`/courses/${courseId}/assignments/${assignmentId}`);

    toast.success("تم حذف التكليف بنجاح", { id: toastId });
    setCourses((prevCourses) =>
  prevCourses.map((course) =>
    course._id === courseId
      ? { ...course, assignments: course.assignments.filter((a) => a._id !== assignmentId) }
      : course
  )
    );
  } catch (err) {
    toast.error("فشل في حذف التكليف", { id: toastId });
  }
};

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col grow justify-center items-center">
          <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
    </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col grow justify-center items-center gap-4">
          <p className="text-center text-red-400 max-w-[70%]">{error}</p>
          <Button onClick={() => setRetry(!retry)} variant="outline">إعادة المحاولة</Button>
        </div>
        <Footer />
      </div>
      )
  }

  return (
    <>
    <Header />
    <div className="container mx-auto p-4" dir="rtl">
      <Tabs defaultValue={courses[0]?._id} dir="rtl">
        <TabsList className="justify-start h-auto w-fit flex flex-wrap">
          {courses.map((course) => (
            <TabsTrigger key={course._id} value={course._id}>
              {course.courseName.length > 17 ? course.courseName.slice(0, 17) + "..." : course.courseName}{course.prac && " عملي"}
            </TabsTrigger>
          ))}
        </TabsList>
        {courses.map((course) => (
          <TabsContent key={course._id} value={course._id}>
            <h1 className="text-xl text-center mx-auto bg-accent rounded-md py-2 px-4 my-4 font-bold w-fit">{course.courseName}{course.prac && " عملي"}</h1>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>إضافة تكليف جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentForm retry={retry} setRetry={setRetry} from="add" onSubmit={(assignment) => handleAddAssignment(course._id, assignment)} />
              </CardContent>
            </Card>
            {course.assignments.map((assignment) => (
              <AssignmentCard
                retry={retry}
                setRetry={setRetry}
                assignmentId={assignment._id}
                courseId={course._id}
                key={assignment._id}
                assignment={assignment}
                onUpdate={(updatedAssignment) => handleUpdateAssignment(course._id, assignment._id, updatedAssignment)}
                onDelete={() => handleDeleteAssignment(course._id, assignment._id)}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
    <Footer />
    </>
  )
}

const AssignmentForm = ({ retry, setRetry, assignmentId, courseId, onSubmit, initialValues = {}, from }) => {
  const [title, setTitle] = useState(initialValues.title || "")
  const [description, setDescription] = useState(initialValues.description || "")
  const [maxGrade, setMaxGrade] = useState(initialValues.maxGrade?.toString() || "")
  const [startTime, setStartTime] = useState(
    initialValues.startTime ? new Date(initialValues.startTime).toISOString().slice(0, 16) : "",
  )
  const [endTime, setEndTime] = useState(
    initialValues.endTime ? new Date(initialValues.endTime).toISOString().slice(0, 16) : "",
  )
  const [file, setFile] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const fileInputRef = useRef("")
  
  // onChange file handler
  const handleFileChange = async (file) => {
    if (!file) {
        toast('لم يتم اختيار أي ملف توضيحي للتكليف');
        return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("لا يجب أن يزيد حجم الملف عن 10 ميجا بايت");
      return;
    }

    if (file.type === "application/pdf") {
        // If it's already a PDF, update state as is
        setFile(file);
        toast("تم تحميل الملف");
    } else if (file.type.startsWith("image/")) {
        // If it's an image, call confirm
        setFile(file);
        setOpenDialog(true);
    } else {
        toast.error("يرجى رفع صورة أو ملف بي دي إف");
    }
};

// Handle confirm
const confirmConversion = async () => {
        if (file) {
          const toastId = toast.loading("جارٍ PDF تحويل الملف إلى");
            try {
                const pdfFile = await convertImageToPDF(file);
                setFile(pdfFile);
                toast.success("تم التحويل بنجاح", { id: toastId });
            } catch (error) {
                toast.error("حدث خطأ أثناء التحويل", { id: toastId });
            }
        }
        setOpenDialog(false); // Close the dialog
    };
    
const handleCancel = () => {
    setOpenDialog(false);
    setFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
};

const handleGradeChange = (e) => {
  let inputValue = e.target.value;

  // If the input is empty, set it as empty
  if (inputValue === '') {
    setMaxGrade('');
    return;
  }

  let grade = Number(inputValue);
  grade = Number(grade.toFixed(2));

  if (grade > 100) {
    grade = 100;
  }

  // Ensure 0 is explicitly stored instead of a falsy value
  setMaxGrade(grade === 0 ? 0 : grade);
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      file,
      maxGrade: maxGrade === '' ? null : maxGrade,
      startTime: startTime || null,
      endTime,
    })
  }
  
  const updateFileInputRef = useRef(null)
  
  const handleUpdateFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("لا يجب أن يزيد حجم الملف عن 10 ميجا بايت");
      return;
    }

    if (file.type === "application/pdf") {
        toast('تم تحميل الملف');
        handleFileUpdate(file);
    } else if (file.type.startsWith("image/")) {
        const toastId = toast.loading("جارٍ تحويل الصورة إلى بي دي إف")
        try {
            const pdfFile = await convertImageToPDF(file);
            toast.success("تم التحويل بنجاح", { id: toastId });
            handleFileUpdate(pdfFile);
            } catch (error) {
            toast.error("حدث خطأ أثناء التحويل", { id: toastId });
            }
    } else {
        toast.error("يرجى رفع صورة أو ملف بي دي إف");
    }
}

  
  const handleFileUpdate = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const toastId = toast.loading("جارٍ تحديث الملف")
    
    try {
      const response = await axios.patch(`/courses/${courseId}/assignments/${assignmentId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("تم تحديث الملف بنجاح", { id: toastId });
      setRetry(!retry);
    } catch (error) {
      toast.error("فشل في تحديث الملف", { id: toastId });
    }
    
  }
  
  const handleFileDelete = async () => {
    const toastId = toast.loading("جارٍ حذف الملف")
    
    try {
      const response = await axios.patch(`/courses/${courseId}/assignments/${assignmentId}`, { deleteFile: "1" });
      toast.success("تم حذف الملف بنجاح", { id: toastId });
      setRetry(!retry);
    } catch (error) {
      toast.error("فشل في حذف الملف", { id: toastId });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">العنوان</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
  <Label className={initialValues?.file_url ? "text-blue-500 font-semibold my-2" : ""} htmlFor="file">
    {!initialValues?.file_url && "التكليف الحالي"}
  </Label>
  {initialValues?.file_url && (
  <div className="flex flex-col gap-2">
    <p className="pointer-events-none text-primary font-semibold">ملف التكليف:</p>
    <div className="flex gap-2">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={updateFileInputRef}
        className="hidden"
        onChange={handleUpdateFileChange}
      />

      {/* Hidden Label Wrapping the Update Button */}
      <label htmlFor="file-upload" className="">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => updateFileInputRef.current?.click()}
        >
          تحديث الملف
        </Button>
      </label>

      {/* Delete File Button */}
      <Button size="sm" type="button" variant="destructive" onClick={handleFileDelete}>
        حذف الملف
      </Button>
    </div>
  </div>
)}
  <Input 
    ref={fileInputRef} 
    id="file" 
    type="file" 
    accept="image/*,application/pdf" 
    className={initialValues?.file_url ? "hidden" : ""}
    onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
  />
  </div>
      <div>
        <Label htmlFor="maxGrade">الدرجة القصوى (اختياري)</Label>
        <Input
          id="maxGrade"
          type="number"
          value={maxGrade}
          onChange={handleGradeChange}
        />
      </div>
      <div>
        <Label htmlFor="startTime">وقت البدء (اختياري)</Label>
        <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="endTime">وقت الانتهاء</Label>
        <Input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{from === "add" ? "إضافة" : "تحديث"}</Button>
       {/* ShadCN Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog} dir="rtl">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle dir="rtl" className="text-center">هل تريد تحويل الملف إلى PDF؟</DialogTitle>
                    </DialogHeader>
                    <p className="text-center mt-2" dir="rtl">الملف الذي قمت بتحميله ليس ملف PDF، هل ترغب في تحويله إلى PDF؟</p>
                    <DialogFooter>
                    <div className="mt-4 w-full flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleCancel}>
                            لا، إلغاء
                        </Button>
                        <Button className="flex-1" onClick={confirmConversion}>نعم، تحويل</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </form>
  )
}

const AssignmentCard = ({ retry, setRetry, assignmentId, courseId, assignment, onUpdate, onDelete }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {assignment.title}
          <div className="flex space-x-2 gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>تعديل التكليف</DialogTitle>
                </DialogHeader>
                <AssignmentForm retry={retry} setRetry={setRetry} assignmentId ={assignmentId} courseId={courseId} onSubmit={onUpdate} initialValues={assignment} from="edit" />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تأكيد الحذف</DialogTitle>
                  <DialogDescription>
                  <span className="block my-4">
                    هل أنت متأكد أنك تريد حذف هذا التكليف؟ لا يمكن التراجع عن هذا الإجراء
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={onDelete}>
                    تأكيد
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{assignment.description}</p>
        <p>الدرجة القصوى: {assignment.maxGrade || "غير محدد"}</p>
        <p>وقت البدء: {assignment.startTime ?    format(new Date(assignment.startTime), "PP h:mm a", { locale: ar }) : "غير محدد"}</p>
        <p>وقت الانتهاء:    {format(new Date(assignment.endTime), "PP h:mm a", { locale: ar })}</p>
        {assignment.file_url && 
        <a
          href={assignment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline block mt-2 font-semibold"
        >
          عرض ملف التكليف
        </a>
        }
      </CardContent>
    </Card>
  )
}

export default AddAssignmentPage

