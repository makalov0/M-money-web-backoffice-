
import './App.css'
// import Navbar from './components/layout/navbar';
import Sidebar from './components/layout/Sidebar';

export default function App() {
  return (
    <div>
      <Sidebar />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600">
          Hello React + TypeScript + Tailwind v3 🎉
        </h1>
      </div>
    </div>
  );
}

