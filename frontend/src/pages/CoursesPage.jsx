import { useState, useEffect } from "react"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Trash2, Edit, ChevronDown } from "lucide-react"
import { toast } from "react-hot-toast"
import { Header, Footer } from "@/pages/StudentGradesPage"
import SadExpIcon from "@/components/svg/SadExpIcon"
import getCurrentSemester from "@/utils/getCurrentSemester"

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [reRequest, setReRequest] = useState(0)
  const [semester, setSemester] = useState(getCurrentSemester())
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    tutorId: "",
    semester: "",
    prac: false,
    maxMidterm: "",
    maxTermwork: "",
    maxFinal: "",
  })
  const [editingCourse, setEditingCourse] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  useEffect(() => {
  const fetchData = async () => {
    try {
      await fetchCourses(); // Ensure promises are awaited
      await fetchTutors();
    } catch (error) {
      setError(true);
    }
  };

  fetchData(); // Call the async function
}, [reRequest, semester]);

  const fetchCourses = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await axios.get("/courses", {
        params: {
          semester
        }
      })
      setCourses(response.data.data)
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب المقررات")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchTutors = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await axios.get("/users/tutors")
      setTutors(response.data.tutors)
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب قائمة المعلمين")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCourse((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setNewCourse((prev) => ({ ...prev, prac: checked }))
  }

  const handleAddCourse = async () => {
    if (!newCourse.courseName || !newCourse.tutorId || !newCourse.semester) {
      toast.error("يرجى ملء الحقول الضرورية");
      return;
    }
    setLoading(true)
    try {
      const response = await axios.post("/courses", newCourse)
      setCourses((prevCourses) => [...prevCourses, response.data?.data])
      setNewCourse({
        courseName: "",
        tutorId: "",
        semester: "",
        prac: false,
        maxMidterm: "",
        maxTermwork: "",
        maxFinal: "",
      })
      toast.success("تمت إضافة المقرر بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة المقرر")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse.courseName || !editingCourse.tutorId || !editingCourse.semester) {
      toast.error("يرجى ملء الحقول الضرورية");
      return;
    }
    setLoading(true)
    try {
      const response = await axios.put(`/courses/${editingCourse._id}`, editingCourse)
      setCourses((prevCourses) =>
        prevCourses.map((course) => (course._id === editingCourse._id ? response.data.data : course)),
      )
      setEditingCourse(null)
      toast.success("تم تحديث المقرر بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المقرر")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    setLoading(true)
    try {
      await axios.delete(`/courses/${deleteConfirmation._id}`)
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== deleteConfirmation._id))
      setDeleteConfirmation(null)
      toast.success("تم حذف المقرر بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المقرر")
    } finally {
      setLoading(false)
    }
  }

  const renderGradeFields = (course, isEditing = false, isFromEditor = false) => {
    const handleChange = (e) => {
      const { name, value } = e.target
      const newValue = value === "" ? null : Math.min(Math.max(Number.parseInt(value) || 0, 0), 100)
      if (isEditing) {
        setEditingCourse((prev) => ({ ...prev, [name]: newValue }))
      } else {
        setNewCourse((prev) => ({ ...prev, [name]: newValue }))
      }
    }
    
    

    return (
      <>
        <div className={`${!isFromEditor ? "grid grid-cols-4" : "flex flex-row-reverse"}  items-center gap-4`}>
          <Label htmlFor={isEditing ? "edit-maxTermwork" : "maxTermwork"} className="text-right whitespace-nowrap">
            حضور ومشاركة
          </Label>
          <Input
            id={isEditing ? "edit-maxTermwork" : "maxTermwork"}
            name="maxTermwork"
            type="number"
            min="0"
            max="100"
            value={course.maxTermwork ?? ""}
            onChange={handleChange}
            className="col-span-3 text-right"
          />
        </div>
        <div className={`${!isFromEditor ? "grid grid-cols-4" : "flex flex-row-reverse"}  items-center gap-4`}>
          <Label htmlFor={isEditing ? "edit-maxMidterm" : "maxMidterm"} className="text-right whitespace-nowrap">
            {course.prac ? "درجات المشروع" : "اختبار نصفي"}
          </Label>
          <Input
            id={isEditing ? "edit-maxMidterm" : "maxMidterm"}
            name="maxMidterm"
            type="number"
            min="0"
            max="100"
            value={course.maxMidterm ?? ""}
            onChange={handleChange}
            className="col-span-3 text-right"
          />
        </div>
        <div className={`${!isFromEditor ? "grid grid-cols-4" : "flex flex-row-reverse"}  items-center gap-4`}>
          <Label htmlFor={isEditing ? "edit-maxFinal" : "maxFinal"} className="text-right whitespace-nowrap">
            {course.prac ? "اختبار العملي" : "درجات المشروع"}
          </Label>
          <Input
            id={isEditing ? "edit-maxFinal" : "maxFinal"}
            name="maxFinal"
            type="number"
            min="0"
            max="100"
            value={course.maxFinal ?? ""}
            onChange={handleChange}
            className="col-span-3 text-right"
          />
        </div>
      </>
    )
  }
  if (error) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex grow justify-center items-center">
             <div className="flex flex-col items-center justify-center gap-3 w-full opacity-50 select-none">
          <SadExpIcon height={80} width={80} />
          <p className='font-semibold -mt-4 text-center'>حدث خطأ أثناء الاتصال بالخادم</p>
          <p className="font-semibold text-center underline hover:opacity-50 md:cursor-pointer" onClick={() => setReRequest((prev) => prev + 1)}>
  إعادة المحاولة
</p>
          </div>
          </div>
          <Footer />
        </div>
        )
    }
    
    if (loading) {
            return  <div className="min-h-screen flex flex-col p-0">
        <Header />
        <div className="flex grow justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
        </div>
    }
    
  return (
    <>
    <Header />
    <div className="container mx-auto p-4" dir="rtl">
        <>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {courses.length === 0 ? (<div className="text-lg font-semibold text-right bg-accent py-2 px-4 rounded-md w-fit">لا توجد أي مقررات لهذا الفصل الدراسي</div>) : (courses.map((course) => (
              <Card key={course._id} className="relative">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2">{course.courseName}</h2>
                  <p>الفصل الدراسي: {course.semester}</p>
                  <p>عملي: {course.prac ? "نعم" : "لا"}</p>
                  {course.maxTermwork && (
                    <p>
                    حضور ومشاركة : {course.maxTermwork}
                    </p>
                  )}
                  {course.maxMidterm && (
                    <p>
                      {course.prac ? "درجات المشروع" : "اختبار نصفي"}: {course.maxMidterm}
                    </p>
                  )}
                  {course.maxFinal && <p>{course.prac ? "اختبار العملي" : "درجات المشروع"}: {course.maxFinal}</p>}
                  <div className="absolute top-2 left-2 flex space-x-2 rtl:space-x-reverse">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>تعديل المقرر</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Input
                              id="edit-courseName"
                              value={editingCourse?.courseName || ""}
                              onChange={(e) => setEditingCourse({ ...editingCourse, courseName: e.target.value })}
                              className="col-span-3 text-right"
                            />
                            <Label htmlFor="edit-courseName" className="text-right">
                              اسم المقرر
                            </Label>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            
                            <Select
                              dir="rtl"
                              value={editingCourse?.tutorId || ""}
                              onValueChange={(value) => setEditingCourse({ ...editingCourse, tutorId: value })}
                            >
                              <SelectTrigger className="col-span-3 text-right">
                                <SelectValue placeholder="اختر المحاضر" />
                              </SelectTrigger>
                              <SelectContent>
                                {tutors.map((tutor) => (
                                  <SelectItem key={tutor._id} value={tutor._id}>
                                    {tutor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Label htmlFor="edit-tutorId" className="text-right">
                              المحاضر
                            </Label>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">

                            <Select
                              dir="rtl"
                              value={editingCourse?.semester || ""}
                              onValueChange={(value) => setEditingCourse({ ...editingCourse, semester: value })}
                            >
                              <SelectTrigger className="col-span-3 text-right">
                                <SelectValue placeholder="اختر الفصل الدراسي" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                                  <SelectItem key={semester} value={semester.toString()}>
                                    {semester}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                                                <Label htmlFor="edit-semester" className="text-right">
                              الفصل الدراسي
                            </Label>
                          </div>
                          <div className="flex items-center justify-end gap-20">

                            <Switch
                              id="edit-prac"
                              checked={editingCourse?.prac || false}
                              onCheckedChange={(checked) => setEditingCourse({ ...editingCourse, prac: checked })}
                            />
                                               <Label htmlFor="edit-prac" className="text-left">
                              عملي
                            </Label>
                          </div>
                          {renderGradeFields(editingCourse || {}, true, true)}
                        </div>
                        <DialogFooter>
                          <Button onClick={handleUpdateCourse}>تحديث المقرر</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="icon" onClick={() => setDeleteConfirmation(course)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold mb-4 text-right">إضافة مقرر جديد</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="courseName" className="text-right">
                    اسم المقرر
                  </Label>
                  <Input
                    id="courseName"
                    name="courseName"
                    value={newCourse.courseName}
                    onChange={handleInputChange}
                    className="col-span-3 text-right"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tutorId" className="text-right">
                    المحاضر
                  </Label>
                  <Select
                    dir="rtl"
                    name="tutorId"
                    value={newCourse.tutorId}
                    onValueChange={(value) => setNewCourse({ ...newCourse, tutorId: value })}
                  >
                    <SelectTrigger className="col-span-3 text-right">
                      <SelectValue placeholder="اختر المحاضر" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor._id} value={tutor._id}>
                          {tutor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester" className="text-right">
                    الفصل الدراسي
                  </Label>
                  <Select
                    dir="rtl"
                    name="semester"
                    value={newCourse.semester}
                    onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                  >
                    <SelectTrigger className="col-span-3 text-right">
                      <SelectValue placeholder="اختر الفصل الدراسي" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                        <SelectItem key={semester} value={semester.toString()}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prac" className="text-right">
                    عملي
                  </Label>
                  <div className="col-span-3 flex justify-start">
                  <div dir="ltr">
                    <Switch id="prac" name="prac" checked={newCourse.prac} onCheckedChange={handleSwitchChange} />
                  </div>
                    
                  </div>
                </div>
                {renderGradeFields(newCourse)}
                <Button onClick={handleAddCourse} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                  إضافة المقرر
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-right my-4">هل أنت متأكد من رغبتك في حذف هذا المقرر؟</p>
          <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button className="w-2/4" variant="outline" onClick={() => setDeleteConfirmation(null)}>
              إلغاء
            </Button>
            <Button className="w-2/4" variant="destructive" onClick={handleDeleteCourse}>
              حذف
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      <Footer />
      </>
  )
}

export default CourseManagement

