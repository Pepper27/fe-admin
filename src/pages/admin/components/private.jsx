import { useEffect } from "react";
import { fetchAdminUser } from "../../../config/api";
const PrivateRoute = ({ children }) => {
    useEffect(() => {
        (async () => {
            try {
                const resp = await fetchAdminUser();
                console.log(resp?.data?.data)
            } catch (err) {
                console.error('Auth check failed', err)
            }
        })();
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
