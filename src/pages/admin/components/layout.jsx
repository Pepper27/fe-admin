import Header from "./header/header";
import Sidebar from "./sidebar/sidebar";
// import "../../../"
const Layout = ({ children }) => {
    return (
        <div className="bg-[#F5F6FA]">
            <Header />
            <Sidebar />
            {children}
        </div>
    );
};

export default Layout;