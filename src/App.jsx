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
import PermissionGuard from "./pages/admin/components/permission-guard";
import ProductCreate from "./pages/admin/product/product-create";
import ProductList from "./pages/admin/product/product-list";
import ProductUpdate from "./pages/admin/product/product-update";
import CollectionList from "./pages/admin/collection/collection-list";
import CollectionCreate from "./pages/admin/collection/collection-create";
import CollectionUpdate from "./pages/admin/collection/collection-update";
import DesignList from "./pages/admin/design/design-list";
import ClientList from "./pages/admin/client/client-list";
import WishlistList from "./pages/admin/wishlist/wishlist-list";
import OrderList from "./pages/admin/order/order-list";
import RoleList from "./pages/admin/setting/role/role-list";
import RoleCreate from "./pages/admin/setting/role/role-ceate";
import RoleUpdate from "./pages/admin/setting/role/role-update";
import SettingList from "./pages/admin/setting/setting-list";
import SettingAccountList from "./pages/admin/setting/account/setting-account-list";
import SettingAccountCreate from "./pages/admin/setting/account/setting-account-create";
import SettingAccountUpdate from "./pages/admin/setting/account/setting-account-update";
import SettingInfoWebsite from "./pages/admin/setting/setting-info-website";
import SizeList from "./pages/admin/size/size-list";
import ColorList from "./pages/admin/color/color-list";
import MaterialList from "./pages/admin/material/material-list";
import SizeCreate from "./pages/admin/size/size-create";
import ColorCreate from "./pages/admin/color/color-create";
import MaterialCreate from "./pages/admin/material/material-create";
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
                <PermissionGuard permission="dashboard-view">
                  <Dashboard />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="new-view">
                  <BlogList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="new-create">
                  <BlogCreate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.blogUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="new-edit">
                  <BlogUpdate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="category-view">
                  <CategoryList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="category-create">
                  <CategoryCreate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.categoryUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="category-edit">
                  <CategoryUpdate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.productCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="product-create">
                  <ProductCreate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.productList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="product-view">
                  <ProductList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.productUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="product-edit">
                  <ProductUpdate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.collectionList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="collection-view">
                  <CollectionList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.collectionCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="collection-create">
                  <CollectionCreate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.collectionUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="collection-edit">
                  <CollectionUpdate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.designList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="my-designs-view">
                  <DesignList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.clientList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="user-view">
                  <ClientList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.orderList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="order-view">
                  <OrderList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path={routes.wishlistList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="wishlist-view">
                  <WishlistList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.roleList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                {/* <PermissionGuard permission="role-view"> */}
                  <RoleList />
                {/* </PermissionGuard> */}
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
path={routes.roleCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                {/* <PermissionGuard permission="role-create"> */}
                  <RoleCreate />
                {/* </PermissionGuard> */}
              </LayoutAdmin>
          }
        />
        <Route
path={routes.roleUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                {/* <PermissionGuard permission="role-edit"> */}
                  <RoleUpdate />
                {/* </PermissionGuard> */}
              </LayoutAdmin>
          }
        />
        <Route
          path={routes.settingList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="setting-view">
                  <SettingList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.settingAccountList}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="account-view">
                  <SettingAccountList />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.settingAccountCreate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="account-create">
                  <SettingAccountCreate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path={routes.settingAccountUpdate}
          element={
            <PrivateRoute>
              <LayoutAdmin>
                <PermissionGuard permission="account-edit">
                  <SettingAccountUpdate />
                </PermissionGuard>
              </LayoutAdmin>
            </PrivateRoute>
          }
        />
          <Route
            path={routes.settingWebsiteInfo}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="info-view">
                    <SettingInfoWebsite />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.sizeList}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="size-view">
                    <SizeList />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.colorList}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="color-view">
                    <ColorList />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.materialList}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="material-view">
                    <MaterialList />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.sizeCreate}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="size-create">
                    <SizeCreate />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.colorCreate}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="color-create">
                    <ColorCreate />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
          <Route
            path={routes.materialCreate}
            element={
              <PrivateRoute>
                <LayoutAdmin>
                  <PermissionGuard permission="material-create">
                    <MaterialCreate />
                  </PermissionGuard>
                </LayoutAdmin>
              </PrivateRoute>
            }
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
