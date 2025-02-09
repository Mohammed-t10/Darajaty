import { useState, useEffect } from 'react'
import { toast } from "react-hot-toast"
import { axiosInstance as axios } from '@/api/axiosInstance'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Trash2, Edit2 } from 'lucide-react'
import { Header, Footer } from '@/pages/StudentGradesPage'
import EditActivityModal from '@/components/EditActivityModal'
import LogoutModal from '@/components/LogoutModal'
import SadExpIcon from '@/components/svg/SadExpIcon'

const AddActivity = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  // Handle error cases 
  const [error, setError] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState('');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [reRequest, setReRequest] = useState(0);
  
  const [newActivity, setNewActivity] = useState({ name: '', description: '', maxGrade: '' })

  useEffect(() => {
    fetchCourses()
  }, [reRequest])

  const fetchCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get("/courses")
      setCourses(response.data.data)
      if (response.data.data.length > 0) {
        setSelectedCourse(response.data.data[0]._id)
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false)
    }
  }

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId)
  }

  const handleInputChange = (e) => {
    let { name, value } = e.target
    if (name === 'maxGrade') {
      value = value !== '' 
  ? Math.min(Number(Number(value).toFixed(2)), 100) 
  : '';
    }
    setNewActivity(prev => ({ ...prev, [name]: value }))
  }

  const handleAddActivity = async () => {
    if (!newActivity.name || !newActivity.description || (newActivity.maxGrade === null || newActivity.maxGrade === undefined)) {
      toast.error("يرجى التأكد من إدخال عنوان ووصف النشاط");
      return;
    }
    const loadingToast = toast.loading('جارٍ إضافة النشاط');
    try {
      const response = await axios.post(`/courses/${selectedCourse}/activities`, newActivity)
      setNewActivity({ name: '', description: '', maxGrade: '' })
      // Update UI 
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === selectedCourse
            ? { 
                ...course, 
                activities: [...course.activities, response.data.activity] // Add the new activity to the activities array
              }
            : course
        )
      );
      toast.success('تمت إضافة النشاط', {
        id: loadingToast
      });
    } catch (error) {
      toast.error('تعذر إضافة النشاط', {
        id: loadingToast
      });
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = (activityId) => {
    setIsLogoutOpen(true);
    setActivityToDelete(activityId);
  }

  const handleDeleteActivity = async () => {
    try {
      const loadingToast = toast.loading('جارٍ حذف النشاط');
      setIsLogoutOpen(false);
      
      await axios.delete(`/courses/${selectedCourse}/activities/${activityToDelete}`)
      // Update UI
      setCourses((prevCourses) =>
  prevCourses.map((course) =>
    course._id === selectedCourse
      ? {
          ...course,
          activities: course.activities.filter(
            (activity) => activity._id !== activityToDelete
          ),
        }
      : course
  )
);
      toast.success('تم حذف النشاط', {
        id: loadingToast
      });
    } catch (error) {
      toast.error('تعذر حذف النشاط', {
        id: loadingToast
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Header />
    <div className="container mx-auto p-4 min-h-[85vh]" dir="rtl">
      {loading ? (
        <div className="flex justify-center items-center h-[83vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
          <div className="h-[83vh] flex flex-col items-center justify-center gap-3 w-full opacity-50 select-none">
    <>
          <SadExpIcon height={80} width={80} />
          <p className='font-semibold -mt-4 text-center'>حدث خطأ أثناء الاتصال بالخادم</p>
          <p className="font-semibold text-center underline hover:opacity-50 md:cursor-pointer" onClick={() => setReRequest((prev) => prev + 1)}>
  إعادة المحاولة
</p>
</>
</div>
        ) : (
        <Tabs value={selectedCourse} onValueChange={handleCourseChange} className="w-full" dir="rtl">
          <TabsList className="w-fit mb-4 bg-muted/50 p-1 rounded-md overflow-auto block ml-auto text-center h-fit" dir="rtl">
            {courses.map((course) => (
     <TabsTrigger key={course._id} value={course._id}>
  <span className="text-sm">
    {course.prac
      ? course.courseName.length > 25
        ? `...عملي ${course.courseName.substring(0, 25)}`
        : `عملي ${course.courseName}`
      : course.courseName.length > 25
      ? `...${course.courseName.substring(0, 25)}`
      : course.courseName}
  </span>
</TabsTrigger>
            ))}
          </TabsList>
          {courses.map((course) => (
            <TabsContent key={course._id} value={course._id}>
            <h1 className="text-xl font-semibold my-6 bg-accent rounded-full w-fit py-2 px-4 mx-auto">{course.prac ? course.courseName + ' عملي' : course.courseName}</h1>
            { course?.activities?.length > 0 &&
              <Card className="mb-8">
                <CardContent>
                  <h2 className="text-2xl font-bold my-4 text-right"> الأنشطة الحالية</h2>
                  <div className="space-y-4">
                    {course.activities.map((activity) => (
                      <div key={activity._id} className="flex flex-row-reverse items-center justify-between bg-background border p-4 rounded-lg">
                        <div className="flex items-center flex-row-reverse justify-center gap-2">
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => handleDeleteConfirm(activity._id)}
                        >
                          <Trash2 className="h-1 w-1" />
                        </Button>
                        
                        <Button
                         size="xs"
                         onClick={() => {
                         setSelectedActivity(activity);
                         setIsEditActivityOpen(true);
                         }}
                        >
                          <Edit2 className="h-1 w-1 text-white" />
                        </Button>
                        </div>
                        <div className="text-right max-w-[70%]">
                          <h3 className="font-bold">{activity.name.length > 50
                              ? `...${activity.name.substring(0, 50)}`
                              : activity.name}</h3>
                          <p className="text-sm text-gray-600">
                            {activity.description.length > 80
                              ? `...${activity.description.substring(0, 80)}`
                              : activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
              <Card>
                <CardContent>
                  <h2 className="text-2xl font-bold my-4 text-right">إضافة نشاط جديد</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-right block">عنوان النشاط</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newActivity.name}
                        maxLength={100}
                        onChange={handleInputChange}
                        className="mt-1 text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-right block">وصف النشاط</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newActivity.description}
                        maxLength={300}
                        onChange={handleInputChange}
                        className="mt-1 text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGrade" className="text-right block">الدرجة القصوى</Label>
                      <Input
                        id="maxGrade"
                        name="maxGrade"
                        type="number"
                        value={newActivity.maxGrade}
                        onChange={handleInputChange}
                        className="mt-1 text-right"
                      />
                    </div>
                    <Button onClick={handleAddActivity} disabled={loading} className="w-full">
                      {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                      إضافة النشاط
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      {isEditActivityOpen && selectedActivity && (
  <EditActivityModal
    isOpen={isEditActivityOpen}
    setIsOpen={setIsEditActivityOpen}
    actName={selectedActivity.name}
    actDesc={selectedActivity.description}
    actGrade={selectedActivity.maxGrade}
    actId={selectedActivity._id}
    courseId={selectedCourse}
    setCourses={setCourses}
  />
)}
    </div>
    <LogoutModal isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} title='تأكيد حذف النشاط' body='هل أنت متأكد من أنك تريد حذف النشاط' cta='حذف' onClickHandler={handleDeleteActivity} />
    <Footer />
    </>
  )
}

export default AddActivity
