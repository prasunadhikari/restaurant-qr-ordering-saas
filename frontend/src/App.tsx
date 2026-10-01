import { BrowserRouter, Route, Routes } from "react-router-dom";

import RestaurantLayout from "./layouts/RestaurantLayout";
import HomePage from "./pages/HomePage";
import RestaurantMenuPage from "./pages/customer/RestaurantMenuPage";
import DashboardPage from "./pages/restaurant/DashboardPage";
import OrdersPage from "./pages/restaurant/OrdersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Customer */}
        <Route
          path="/r/:restaurantSlug/t/:tableNumber"
          element={<RestaurantMenuPage />}
        />

        {/* Restaurant Dashboard */}
        <Route element={<RestaurantLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/dashboard/orders"
            element={<OrdersPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;