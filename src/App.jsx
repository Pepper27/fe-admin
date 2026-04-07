import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import Login from "./pages/admin/authen/login";
import ForgotPassword from "./pages/admin/authen/forgot-password";
import OtpPassword from "./pages/admin/authen/otp-password";
import ResetPassword from "./pages/admin/authen/reset-password";
import BlogList from "./pages/admin/blog/blog-list";
import BlogCreate from "./pages/admin/blog/blog-create";
import BlogUpdate from "./pages/admin/blog/blog-update";
import CategoryList from "./pages/admin/category/category-list";
import CategoryCreate from "./pages/admin/category/category-create";
import CategoryUpdate from "./pages/admin/category/category-update";
import Dashboard from "./pages/admin/dashboard";
import LayoutAdmin from "./pages/admin/components/layout";
import PrivateRoute from "./pages/admin/components/private"
import ProductCreate from "./pages/admin/product/product-create";
import ProductList from "./pages/admin/product/product-list";
import ProductUpdate from "./pages/admin/product/product-update";
import DesignList from "./pages/admin/design/design-list";
import ClientList from "./pages/admin/client/client-list";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.forgotPassword} element={<ForgotPassword />} />
        <Route path={routes.otpPassword} element={<OtpPassword />} />
        <Route path={routes.resetPassword} element={<ResetPassword />} />
        <Route
          path={routes.dashboard}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <Dashboard />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <BlogList />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <BlogCreate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <BlogUpdate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <CategoryList />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <CategoryCreate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <CategoryUpdate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.productCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <ProductCreate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.productList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <ProductList />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.productUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <ProductUpdate />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.designList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <DesignList />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.clientList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <ClientList />
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
