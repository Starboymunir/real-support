const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white opacity-75">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Loader;
