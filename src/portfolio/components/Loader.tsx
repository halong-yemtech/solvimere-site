export default function Loader() {
  return (
    <div className="w-12 h-12 relative loader" role="status" aria-label="Loading">
      <span className="w-full h-full absolute top-0 left-0 rounded-full bg-main-orange origin-center scale-100"></span>
      <span className="w-full h-full absolute top-0 left-0 rounded-full bg-main-orange opacity-25 origin-center scale-0"></span>
    </div>
  );
}
