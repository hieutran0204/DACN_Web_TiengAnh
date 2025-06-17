import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import CreateListeningQuestion from "./pages/Listening/Create";
import ListeningList from "./pages/Listening/List";
import EditListeningQuestion from "./pages/Listening/Edit";
import ListeningDetail from "./pages/Listening/Detail";

import CreateReadingQuestion from "./pages/Reading/ReadingCreate";
import ReadingList from "./pages/Reading/ReadingList";
import EditReadingQuestion from "./pages/Reading/ReadingEdit";
import ReadingDetail from "./pages/Reading/ReadingDetail";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listening/create" element={<CreateListeningQuestion />} />
        <Route path="/listening" element={<ListeningList />} />
        <Route path="/listening/edit/:id" element={<EditListeningQuestion />} />
        <Route path="/listening/:id" element={<ListeningDetail />} />
        <Route path="/reading/create" element={<CreateReadingQuestion />} />
        <Route path="/reading" element={<ReadingList />} />
        <Route path="/reading/edit/:id" element={<EditReadingQuestion />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />
        {/* Thêm các route khác nếu cần */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
