import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "@/routes/AppRoutes";

const App = () => (
  <BrowserRouter>
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: 20, right: 20 }}
      toastOptions={{
        className: "toast-base",
        duration: 3200,
        success: {
          className: "toast-base toast-success",
          duration: 2600,
          iconTheme: {
            primary: "#0f766e",
            secondary: "#ecfeff",
          },
        },
        error: {
          className: "toast-base toast-error",
          duration: 3600,
          iconTheme: {
            primary: "#b91c1c",
            secondary: "#fff1f2",
          },
        },
        loading: {
          className: "toast-base toast-info",
        },
        style: {
          borderRadius: "14px",
          padding: "12px 14px",
          fontSize: "14px",
          lineHeight: "1.35",
          maxWidth: "420px",
        },
      }}
    />
    <AppRoutes />
  </BrowserRouter>
);

export default App;
