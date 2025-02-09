import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/svg/Loader';
import { isValidEmail } from '@/utils/helpers/regExps.js';
import { useAuthStore } from '@/store/authStore';

function ChangeEmailModal({ isOpen, setIsOpen }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateEmail } = useAuthStore();
  const [error, setError] = useState('');

  // Initialize email with the user's current email when the modal opens
  useState(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleEmailChange = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if(!isValidEmail(email)) {
      setError('الرجاء إدخال بريد إلكتروني صالح');
      return;
    }

    setLoading(true);
    try {
      await updateEmail(email);
      toast.success('تم تحديث البريد الإلكتروني بنجاح');
      setTimeout(() => {
        toast('سيتم إرسال كلمات المرور الجديدة إلى هذا البريد الإلكتروني من الآن فصاعداً', {
        duration: 5000
        });
      }, 2000);
      setIsOpen(false);
    } catch (error) {
      let errMsg = "حدث خطأ أثناء تغيير البريد الإلكتروني";
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
      <DialogContent className="rounded w-[95%] sm:max-w-[425px] select-none text-right">
        <DialogHeader>
          <DialogTitle>تغيير البريد الإلكتروني</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEmailChange} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block">البريد الإلكتروني</label>
            <Input
              id="email"
              className="text-right"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />
            {error && <p className="my-2 text-red-500 text-right text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || (user?.email === email.toLowerCase().trim())}>
              {loading ? <Loader /> : 'تحديث البريد الإلكتروني'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangeEmailModal;