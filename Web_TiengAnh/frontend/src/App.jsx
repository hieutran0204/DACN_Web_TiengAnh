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

import SpeakingList from "./pages/Speaking/SpeakingList";
import SpeakingDetail from "./pages/Speaking/SpeakingDetail";
import SpeakingCreate from "./pages/Speaking/SpeakingCreate";
import SpeakingEdit from "./pages/Speaking/SpeakingEdit";

import WritingList from "./pages/Writing/WritingList";
import WritingDetail from "./pages/Writing/WritingDetail";
import WritingCreate from "./pages/Writing/WritingCreate";
import WritingEdit from "./pages/Writing/WritingEdit";

import ExamList from "./pages/Exam/ExamList";
import ExamDetail from "./pages/Exam/ExamDetail";
import ExamDetail_User from "./pages/Exam/ExamDetail_User";
import ExamCreate from "./pages/Exam/ExamCreate";
import ExamEdit from "./pages/Exam/ExamEdit";

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
        <Route path="/speaking" element={<SpeakingList />} />
        <Route path="/speaking/:id" element={<SpeakingDetail />} />
        <Route path="/speaking/create" element={<SpeakingCreate />} />
        <Route path="/speaking/edit/:id" element={<SpeakingEdit />} />
        <Route path="/writing" element={<WritingList />} />
        <Route path="/writing/:id" element={<WritingDetail />} />
        <Route path="/writing/create" element={<WritingCreate />} />
        <Route path="/writing/edit/:id" element={<WritingEdit />} />
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exams/:id" element={<ExamDetail_User />} />
        <Route path="/exams/:id/admin" element={<ExamDetail />} />
        <Route path="/exams/create" element={<ExamCreate />} />
        <Route path="/exams/edit/:id" element={<ExamEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
