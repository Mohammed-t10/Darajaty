import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';
import AppLogo from '@/components/svg/AppLogo';
import { isValidEmail } from '@/utils/helpers/regExps.js';
import Loader from '@/components/svg/Loader';
import { useAuthStore } from '@/store/authStore';
import { Footer } from './StudentGradesPage';

const LoginPage = () => {
  const [view, setView] = useState('login');
  const [secretKey, setSecretKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailId, setEmailId] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, sendNewPassword } = useAuthStore();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if ((!secretKey || secretKey.length < 6) && (!personalId || personalId.length < 8)) {
      setKeyError('يرجى التأكد من صحة صيغة البيانات المدخلة');
      return;
    }
    if(!personalId || personalId.length < 8) {
      setKeyError('يرجى إدخال معرف صحيح');
      return;
    }
    if (!secretKey|| secretKey.length < 6) {
      setKeyError('يرجى إدخال كلمة مرور صالحة');
      return;
    }
    
    setLoading(true);
    setKeyError('');
      
    try {
      await login(personalId, secretKey);
      toast.success('تم تسجيل الدخول بنجاح');
      // User is already redirected from App.jsx
    } catch (error) {
      let errMsg = "تعذر تسجيل الدخول";
      if (error.response.data.message === "Invalid credentials") {
        errMsg = "بيانات تسجيل الدخول خاطئة";
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
};
  
  const handleKeyReset = async (e) => {
    e.preventDefault();
    if (!emailId) {
      setEmailError('يرجى إدخال المعرف الخاص بك');
      return;
    }
    if (emailId.length < 8) {
      setEmailError('الرجاء إدخال معرف صحيح');
      return;
    }
    if (!email) {
      setEmailError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if(!isValidEmail(email)) {
      setEmailError('الرجاء إدخال بريد إلكتروني صالح');
      return;
    }
    setLoading(true);
    setEmailError('');
    
    try {
      await sendNewPassword(emailId, email);
      toast.success('تم إرسال كلمة المرور الجديدة بنجاح', { duration: 3500 });
      setView('login');
      setEmail('');
    } catch (error) {
      let errMsg = 'حدث خطأ أثناء إرسال كلمة المرور الجديدة';
      
      if (error.response?.data?.message.includes('Email not associated')) {
        errMsg = 'يرجى التأكد من صحة البيانات التي أدخلتها';
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
    <div className="min-h-screen flex flex-col justify-between">
      <div className="opacity-0">.</div>
    <div className="flex items-center justify-center bg-background">
      <Card className="w-[95%] max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
            <AppLogo width={84} height={84} className="mt-4" clickable={false} />
          </div>
          <CardTitle className="text-2xl font-bold select-none">دَرَجاتي</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <motion.form
                dir="rtl"
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-4"
              >
                <Input
                  type="number"
                  className="text-right"
                  placeholder="المعرف"
                  value={personalId}
                  onChange={(e) => {
                  setPersonalId(e.target.value);
                  setKeyError('');
                  }}
                  required
                />
 <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'} // Toggle between text and password type
        className="text-right"
        placeholder="كلمة المرور"
        value={secretKey}
        onChange={(e) => {
          setSecretKey(e.target.value);
          setKeyError('');
        }}
        required
      />
      <div
        onClick={togglePasswordVisibility}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer opacity-70"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </div>
    </div>
    <div>
                <Button
                type="button"
                className='w-full'
                onClick={handleLogin}
                disabled={loading}
                >
                  {loading ? <Loader /> : 'تسجيل الدخول'}
                </Button>
                </div>
                {keyError && <p className="text-red-500 text-sm text-right">{keyError}</p>}
                <Button
                  type="button"
                  variant="link"
                  className={`block ml-auto ${loading && 'pointer-events-none'}`}
                  onClick={() => {
                  setView('forgot');
                  setKeyError('');
                  }}
                >
                  نسيت كلمة المرور؟
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-4"
              >
                <Input
                  placeholder="أدخل المعرف الخاص بك"
                  type="number"
                  value={emailId}
                  className="text-center"
                  onChange={(e) => {
                  setEmailId(e.target.value);
                  setEmailError('');
                  }}
                  required
                />
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  className="text-center"
                  onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  }}
                  required
                />
                <Button
                type="button"
                className="w-full"
                onClick={handleKeyReset}
                disabled={loading}
                >
                  {loading ? <Loader /> : 'إرسال كلمة المرور الجديدة'}
                </Button>
                {emailError && <p className="text-red-500 text-right text-sm">{emailError}</p>}
                <Button
                  type="button"
                  variant="link"
                  className={`block ml-auto ${loading && 'pointer-events-none'}`}
                  onClick={() => {
                  setView('login');
                  setEmailError('');
                  }}
                >
                  العودة إلى تسجيل الدخول
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
    <div>
      <Footer login={true} />
    </div>
    </div>
  );

};

export default LoginPage;

