import Sidebar from "./components/layout/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1  bg-gray-50">{children}</main>
        </div>
    );
};

export default MainLayout;
