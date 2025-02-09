import { useState, useEffect } from "react"
import { axiosInstance as axios } from "@/api/axiosInstance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Trash2, Edit } from "lucide-react"
import { toast } from "react-hot-toast"
import { isValidEmail } from "@/utils/helpers/regExps"
import { Header, Footer } from "@/pages/StudentGradesPage"
import SadExpIcon from "@/components/svg/SadExpIcon"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [reRequest, setReRequest] = useState(0)
  const [filter, setFilter] = useState("all")
  const [newUser, setNewUser] = useState({
    id: "",
    name: "",
    password: "",
    role: "",
    email: "",
    isAdmin: false,
  })
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [filter, reRequest])

  const fetchUsers = async () => {
    setLoading(true)
    setError(false)
    try {
      let endpoint = "/users"
      if (filter !== 'all') {
        endpoint += `/${filter}s`
      }
      const response = await axios.get(endpoint)
      if (filter === 'all') {
        setUsers(response.data.users)
      } else {
        setUsers(response.data[`${filter}s`])
      }
    } catch (error) {
      setError(true)
      toast.error("حدث خطأ أثناء جلب المستخدمين")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setNewUser((prev) => ({ ...prev, isAdmin: checked }))
  }

  const generateRandomId = () => {
    const randomId = Math.floor(10000000 + Math.random() * 90000000).toString()
    setNewUser((prev) => ({ ...prev, id: randomId }))
  }

  const validateUser = (user) => {
    if (!user.id || user.id.length !== 8 || isNaN(user.id)) {
      toast.error("يرجى إدخال رقم تعريفي صالح مكون من 8 أرقام")
      return false
    }
    if (!user.name || user.name.trim() === "") {
      toast.error("يرجى إدخال اسم المستخدم")
      return false
    }
    if (!user.role) {
      toast.error("يرجى اختيار دور المستخدم")
      return false
    }
    if (user.email && !isValidEmail(user.email)) {
      toast.error("يرجى إدخال بريد إلكتروني صالح")
      return false
    }
    return true
  }

  const handleAddUser = async () => {
    if (!validateUser(newUser)) return
    if (!newUser.password || newUser.password.length < 6) {
      toast.error("يرجى إدخال كلمة مرور لا تقل عن 6 أحرف");
      return;
    }

    setLoading(true)
    try {
      const response = await axios.post("/users", newUser)
      setUsers((prevUsers) => [...prevUsers, response.data.user])
      setNewUser({
        id: "",
        name: "",
        password: "",
        role: "",
        email: "",
        isAdmin: false,
      })
      toast.success("تمت إضافة المستخدم بنجاح")
    } catch (error) {
      let errMsg = "حدث خطأ أثناء إضافة المستخدم";
      if (error.response.data.message.includes("duplicate key")) {
        errMsg = "هذا المعرف موجود مسبقاً";
      }
      toast.error(errMsg);
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
  }

  const handleUpdateUser = async () => {
    if (!validateUser(editingUser)) return

    setLoading(true)
    try {
      const response = await axios.patch(`/users/${editingUser._id}`, editingUser)
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === editingUser._id ? response.data.user : user)))
      setEditingUser(null)
      toast.success("تم تحديث المستخدم بنجاح")
    } catch (error) {
      let errMsg = "حدث خطأ أثناء تحديث المستخدم"
      if (error.response.data.message.includes("cannot be modified")) {
        errMsg = "لا يمكنك تعديل بيانات هذا المستخدم"
      }
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateUser = async (userId, isActive) => {
    setLoading(true)
    try {
      await axios.patch(`/users/${userId}`, { isActive: !isActive })
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, isActive: !isActive } : user)))
      toast.success(isActive ? "تم تعطيل المستخدم بنجاح" : "تم تفعيل المستخدم بنجاح")
    } catch (error) {
      let errMsg = "حدث خطأ أثناء تعطيل/تفعيل المستخدم"
      if (error.response.data.message.includes("cannot be modified")) {
        errMsg = "لا يمكنك تعطيل هذا المستخدم"
      }
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Header />
    <div className="container mx-auto p-4 max-w-[600px]" dir="rtl">

      <Card className="mb-8">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold mb-6 text-right">إضافة مستخدم جديد</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                المعرف
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="id"
                  name="id"
                  type="number"
                  value={newUser.id}
                  onChange={handleInputChange}
                  className="text-right"
                  placeholder="أدخل 8 أرقام"
                />
                <Button type="button" onClick={generateRandomId}>
                  توليد
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم
              </Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="col-span-3 text-right"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="col-span-3 text-right"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                كلمة المرور
              </Label>
              <Input
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                className="col-span-3 text-right"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                الدور
              </Label>
              <Select
                dir="rtl"
                name="role"
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="col-span-3 text-right">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">طالب</SelectItem>
                  <SelectItem value="tutor">معلم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAdmin" className="text-right">
                مسؤول
              </Label>
              <div className="col-span-3 flex justify-end">
                <Switch id="isAdmin" name="isAdmin" checked={newUser.isAdmin} onCheckedChange={handleSwitchChange} />
              </div>
            </div>
            <Button onClick={handleAddUser} disabled={loading} className="w-full">
            إضافة المستخدم
              {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-start">
        <Select value={filter} onValueChange={setFilter} dir="rtl">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="فرز المستخدمين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستخدمين</SelectItem>
            <SelectItem value="student">الطلاب</SelectItem>
            <SelectItem value="tutor">المعلمون</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 w-full opacity-50 select-none">
    <>
          <SadExpIcon height={80} width={80} />
          <p className='font-semibold -mt-4 text-center'>حدث خطأ أثناء الاتصال بالخادم</p>
          <p className="font-semibold text-center underline hover:opacity-50 md:cursor-pointer" onClick={() => setReRequest((prev) => prev + 1)}>
  إعادة المحاولة
</p>
</>
    </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, index) => (
            <Card key={user._id} className="relative">
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">
                  {index + 1}. {user.name}
                </h2>
                <p> المعرف: {user.id}</p>
                <p>الدور: {user.role === "student" ? "طالب" : "معلم"}</p>
                {user.email && <p>البريد الإلكتروني: {user.email}</p>}
                <p>مسؤول: {user.isAdmin ? "نعم" : "لا"}</p>
                <p>الحالة: {user.isActive ? "نشط" : "غير نشط"}</p>
                <div className="absolute top-2 left-2 flex space-x-2 rtl:space-x-reverse">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>تعديل المستخدم</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="edit-id"
                            type="number"
                            readOnly
                            value={editingUser?.id || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, id: e.target.value })}
                            className="col-span-3 text-right"
                          />
                          <Label htmlFor="edit-id" className="text-right">
                            الرقم التعريفي
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          
                          <Input
                            id="edit-name"
                            value={editingUser?.name || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="col-span-3 text-right"
                          />
                          <Label htmlFor="edit-name" className="text-right">
                            اسم المستخدم
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        
                          <Input
                            id="edit-email"
                            type="email"
                            value={editingUser?.email || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="col-span-3 text-right"
                          />
                          <Label htmlFor="edit-email" className="text-right">
                            البريد الإلكتروني
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">

                          <Select
                            dir="rtl"
                            value={editingUser?.role || ""}
                            onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                          >
                            <SelectTrigger className="col-span-3 text-right">
                              <SelectValue placeholder="اختر الدور" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">طالب</SelectItem>
                              <SelectItem value="tutor">معلم</SelectItem>
                            </SelectContent>
                          </Select>
                                                <Label htmlFor="edit-role" className="text-right">
                            الدور
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">

                          <div className="col-span-3 flex justify-end">
                            <Switch
                              id="edit-isAdmin"
                              checked={editingUser?.isAdmin || false}
                              onCheckedChange={(checked) => setEditingUser({ ...editingUser, isAdmin: checked })}
                            />
                                              
                          </div>
                           <Label htmlFor="edit-isAdmin" className="text-right">
                            مسؤول
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleUpdateUser}>تحديث المستخدم</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="icon"
                    onClick={() => handleDeactivateUser(user._id, user.isActive)}
                  >
                    {user.isActive ? "تعطيل" : "تفعيل"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    <Footer />
    </>
  )
}

export default UserManagement

