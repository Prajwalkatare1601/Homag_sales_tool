import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleFactoryPlanner = () => {
    navigate("/index"); // <-- change this route if needed
  };

  const handleCalculator = () => {
    navigate("/calculator"); // <-- change this route if needed
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col gap-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>

        <button
          onClick={handleFactoryPlanner}
          className="w-80 py-6 text-2xl font-semibold rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
        >
          Factory Planner
        </button>

        <button
          onClick={handleCalculator}
          className="w-80 py-6 text-2xl font-semibold rounded-xl bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all"
        >
          Calculator
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
