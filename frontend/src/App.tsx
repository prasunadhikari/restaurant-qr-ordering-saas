import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ProtectedOwnerRoute from "./components/restaurant/ProtectedOwnerRoute";
import ProtectedStaffRoute from "./components/staff/ProtectedStaffRoute";

import RestaurantLayout from "./layouts/RestaurantLayout";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

import HomePage from "./pages/HomePage";

import RestaurantMenuPage from "./pages/customer/RestaurantMenuPage";

import OwnerLoginPage from "./pages/restaurant/OwnerLoginPage";

import DashboardPage from "./pages/restaurant/DashboardPage";
import OrdersPage from "./pages/restaurant/OrdersPage";
import MenuPage from "./pages/restaurant/MenuPage";
import TablesPage from "./pages/restaurant/TablesPage";
import QRPage from "./pages/restaurant/QRPage";
import AnalyticsPage from "./pages/restaurant/AnalyticsPage";
import SettingsPage from "./pages/restaurant/SettingsPage";
import StaffManagementPage from "./pages/restaurant/StaffManagementPage";
import StaffLoginPage from "./pages/staff/StaffLoginPage";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import StaffOrdersPage from "./pages/staff/StaffOrdersPage";
import StaffOrderDetailPage from "./pages/staff/StaffOrderDetailPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import RestaurantsPage from "./pages/admin/RestaurantsPage";
import RestaurantManagePage from "./pages/admin/RestaurantManagePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<HomePage />}
        />

        {/* Customer */}
        <Route
          path="/r/:restaurantSlug/t/:tableNumber"
          element={<RestaurantMenuPage />}
        />

        {/* Restaurant Owner Login */}
        <Route
          path="/login"
          element={<OwnerLoginPage />}
        />

        {/* Restaurant Staff */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route element={<ProtectedStaffRoute />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/staff/orders" element={<StaffOrdersPage />} />
            <Route path="/staff/orders/:id" element={<StaffOrderDetailPage />} />
          </Route>
        </Route>

        {/* Protected Restaurant Owner Dashboard */}
        <Route element={<ProtectedOwnerRoute />}>
          <Route element={<RestaurantLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/dashboard/orders"
              element={<OrdersPage />}
            />

            <Route
              path="/dashboard/menu"
              element={<MenuPage />}
            />

            <Route
              path="/dashboard/tables"
              element={<TablesPage />}
            />

            <Route
              path="/dashboard/qr"
              element={<QRPage />}
            />

            <Route
              path="/dashboard/analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="/dashboard/settings"
              element={<SettingsPage />}
            />

            <Route
              path="/dashboard/staff"
              element={<StaffManagementPage />}
            />
          </Route>
        </Route>

        {/* Platform Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* Protected Platform Admin */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/restaurants"
              element={<RestaurantsPage />}
            />

            <Route
              path="/admin/restaurants/:id"
              element={<RestaurantManagePage />}
            />

            <Route
              path="/admin/settings"
              element={<AdminSettingsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;