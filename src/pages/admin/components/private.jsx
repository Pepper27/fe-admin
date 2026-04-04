import { useEffect } from "react";
import { pathAdmin } from "../../../config/api";
const PrivateRoute = ({ children }) => {
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("token", token)
        fetch(`${pathAdmin}/admin/account/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            }
        })
        .then((res) => res.json())
        .then((data) => console.log(data?.data))
        .catch((err) => console.error("Auth check failed", err));
        // .then(res => {
        //     if (res.status === 200) {
        //         setIsAuth(true);
        //     } else {
        //         setIsAuth(false);
        //     }
        //     return res.json();
        // })
        // .catch(() => setIsAuth(false));
        // const data = await res.json();
        // console.log(data);
    }, []);

    // if (isAuth === null) {
    //     return <></>;
    // }

    // if (!isAuth) {
    //     return <Navigate to={routes.login} replace />;
    // }

    return children;
};

export default PrivateRoute;
