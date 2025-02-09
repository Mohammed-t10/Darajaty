import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Loader from "@/components/svg/Loader";
import { axiosInstance as axios } from '@/api/axiosInstance';

function EditActivityModal({ isOpen, setIsOpen, actName, actDesc, actGrade, actId, courseId, setCourses }) {
  const [name, setName] = useState(actName || "");
  const [desc, setDesc] = useState(actDesc || "");
  const [grade, setGrade] = useState(actGrade);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const handleGradeChange = (e) => {
    let newGrade = e.target.value;
    
    newGrade = newGrade !== '' 
  ? Math.min(Number(Number(newGrade).toFixed(2)), 100) 
  : '';
    
    setGrade(newGrade);
    setError("");
  };

  const handleDataChange = async (e) => {
    e.preventDefault();

    if (!name || !desc || (grade === undefined || grade === null)) {
      setError("يرجى التأكد من إدخال عنوان ووصف النشاط");
      return;
    }
    const data = {
      name: name,
      description: desc,
      maxGrade: grade
    };

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(`/courses/${courseId}/activities/${actId}`, data);
      const updatedCourse = response.data.course;
      setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === updatedCourse._id ? updatedCourse : course
      )
    );
      toast.success("تم تحديث بيانات النشاط");
      setIsOpen(false); // Close modal after successful update
    } catch (error) {
      let errMsg = "حدث خطأ أثناء تحديث النشاط";
      if (error.response?.status === 429) {
        errMsg =
          "لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة بعد فترة من الوقت";
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded w-[95%] sm:max-w-[425px] select-none text-right">
        <DialogHeader>
          <DialogTitle>تحديث النشاط</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleDataChange} className="space-y-6">
          <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="actName" className="block opacity-75">
              عنوان النشاط
            </label>
            <Input
              id="actName"
              className="text-right"
              value={name}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
            </div>
            <div className="space-y-1">
            <label htmlFor="actDesc" className="block opacity-75">
              وصف النشاط
            </label>
            <Textarea
              id="actDesc"
              className="text-right"
              value={desc}
              maxLength={300}
              onChange={(e) => {
                setDesc(e.target.value);
                setError("");
              }}
            />
            </div>
            <div className="space-y-1">
            <label htmlFor="actGrade" className="block opacity-75">
              الدرجة القصوى
            </label>
            <Input
              id="actGrade"
              type="number"
              className="text-right"
              value={grade === null ? "" : grade}
              onChange={handleGradeChange}
            />
            </div>
            {error && (
              <p className="my-2 text-red-500 text-right text-sm">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader /> : "تحديث النشاط"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditActivityModal;