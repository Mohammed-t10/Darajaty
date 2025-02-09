import AppLogo from '@/components/svg/AppLogo';

export default function Preloader() {
  
  return (
    <div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none">
      <AppLogo height={124} width={124} color="hsl(var(--primary))" />
    </div>
    <p className="font-bold absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1 opacity-50 select-none">دَرَجاتي</p>
    </div>
    );
}