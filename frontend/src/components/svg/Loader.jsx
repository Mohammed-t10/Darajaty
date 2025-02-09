const Loader = ({ size = 20, strokeColor = 'secondary' }) => {
  return (
    <div
      className={`relative ${strokeColor}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        className="animate-spin"
        viewBox="0 0 50 50"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          className="stroke-current"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90, 150"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  );
};

export default Loader;