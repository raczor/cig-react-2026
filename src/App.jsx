import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import NewOrderPage from "./pages/NewOrderPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import EditOrderPage from "./pages/EditOrderPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OrdersPage />} />
        {/* Static path: wins over orders/:id for /orders/new. */}
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/edit" element={<EditOrderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
