import { Route } from "@solidjs/router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ToolPage from "./pages/ToolPage";

export default function App() {
  return (
    <>
      <Route path="/" component={HomePage} />
      <Route path="/:toolId" component={ToolPage} />
      <Route path="*" component={NotFoundPage} />
    </>
  );
}
