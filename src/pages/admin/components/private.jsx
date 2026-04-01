import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { pathAdmin } from "../../../config/api";
import { routes } from "../../../routes";
const PrivateRoute = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("token", token)
        fetch(`${pathAdmin}/admin/account/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then (res=>res.json)
        .then (data=>(console.log(data.data)))
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