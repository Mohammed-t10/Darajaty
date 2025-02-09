import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Loader from '@/components/svg/Loader';
import { useAuthStore } from '@/store/authStore';

function LogoutModal({ isOpen, setIsOpen, title, body, cta, onClickHandler }) {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
      setIsOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded w-[95%] sm:max-w-[425px] select-none text-right">
        <DialogHeader>
          <DialogTitle className="text-center"> {title}</DialogTitle>
        </DialogHeader>
        <div className="text-right my-4">
          {body}
        </div>
        <DialogFooter className="flex flex-row justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="w-1/2"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={onClickHandler || handleLogout}
            disabled={loading}
            className="w-1/2"
          >
            {loading ? <Loader /> : cta }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LogoutModal;