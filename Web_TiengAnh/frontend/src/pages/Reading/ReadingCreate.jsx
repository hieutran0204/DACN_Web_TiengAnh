// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useAdminCheck } from "../../utils/auth";

// export default function CreateReadingQuestion() {
//   const [skills, setSkills] = useState([]);
//   const [parts, setParts] = useState([]);
//   const [filteredParts, setFilteredParts] = useState([]);
//   const [image, setImage] = useState(null);
//   const [form, setForm] = useState({
//     skill: "",
//     part: "",
//     type: "multiple_choice",
//     content: "",
//     difficult: "medium",
//     explanation: "",
//     multipleChoice: { question: "", options: ["", "", "", ""], answer: "" },
//     trueFalseNotGiven: { statement: "", answer: "True" },
//     yesNoNotGiven: { statement: "", answer: "Yes" },
//     matchingHeadings: { paragraph: "", headings: ["", ""], correctHeading: "" },
//     matchingInformation: { infoText: "", paragraphLabel: "" },
//     matchingFeatures: { item: "", features: ["", ""], matchedFeature: "" },
//     matchingSentenceEndings: {
//       start: "",
//       endings: ["", ""],
//       correctEnding: "",
//     },
//     sentenceCompletion: { sentenceWithBlank: "", answer: "", wordLimit: "" },
//     summaryCompletion: {
//       summaryText: "",
//       blanks: [""],
//       answers: [""],
//       wordLimit: "",
//     },
//     diagramLabelCompletion: {
//       diagramUrl: "",
//       labels: [""],
//       correctLabels: [""],
//     },
//   });
//   useAdminCheck();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     axios
//       .get("http://localhost:3000/api/skills", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setSkills(res.data.data))
//       .catch((err) => {
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           alert(
//             "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
//           );
//           localStorage.removeItem("token");
//           localStorage.removeItem("roleId");
//           localStorage.removeItem("role");
//           window.location.href = "/login";
//         } else {
//           alert("Lỗi lấy skill: " + (err.response?.data?.error || err.message));
//         }
//       });

//     axios
//       .get("http://localhost:3000/api/parts", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setParts(res.data.data))
//       .catch((err) => {
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           alert(
//             "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
//           );
//           localStorage.removeItem("token");
//           localStorage.removeItem("roleId");
//           localStorage.removeItem("role");
//           window.location.href = "/login";
//         } else {
//           alert("Lỗi lấy part: " + (err.response?.data?.error || err.message));
//         }
//       });
//   }, []);

//   useEffect(() => {
//     const filtered = parts.filter(
//       (p) => p.skill === form.skill || p.skill?._id === form.skill
//     );
//     setFilteredParts(filtered);
//     setForm((prev) => ({ ...prev, part: "" }));
//   }, [form.skill, parts]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNestedChange = (section, field, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));
//   };

//   const handleArrayChange = (section, field, index, value) => {
//     const updatedArray = [...form[section][field]];
//     updatedArray[index] = value;
//     setForm((prev) => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: updatedArray },
//     }));
//   };

//   const addToArray = (section, field) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: [...prev[section][field], ""],
//       },
//     }));
//   };

//   const handleImageChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const validateForm = () => {
//     if (!form.skill) return "Vui lòng chọn kỹ năng.";
//     if (!form.part) return "Vui lòng chọn part.";
//     if (!form.type) return "Vui lòng chọn loại câu hỏi.";

//     switch (form.type) {
//       case "multiple_choice":
//         if (!form.multipleChoice.question)
//           return "Vui lòng nhập câu hỏi cho multiple_choice.";
//         if (form.multipleChoice.options.some((opt) => !opt))
//           return "Vui lòng nhập đầy đủ các tùy chọn.";
//         if (!form.multipleChoice.answer)
//           return "Vui lòng nhập đáp án cho multiple_choice.";
//         break;
//       case "true_false_not_given":
//         if (!form.trueFalseNotGiven.statement)
//           return "Vui lòng nhập nội dung câu hỏi cho true_false_not_given.";
//         break;
//       case "yes_no_not_given":
//         if (!form.yesNoNotGiven.statement)
//           return "Vui lòng nhập nội dung câu hỏi cho yes_no_not_given.";
//         break;
//       case "matching_headings":
//         if (!form.matchingHeadings.paragraph)
//           return "Vui lòng nhập đoạn văn cho matching_headings.";
//         if (form.matchingHeadings.headings.some((h) => !h))
//           return "Vui lòng nhập đầy đủ các tiêu đề.";
//         if (!form.matchingHeadings.correctHeading)
//           return "Vui lòng nhập tiêu đề đúng.";
//         break;
//       case "matching_information":
//         if (!form.matchingInformation.infoText)
//           return "Vui lòng nhập thông tin cho matching_information.";
//         if (!form.matchingInformation.paragraphLabel)
//           return "Vui lòng nhập nhãn đoạn văn.";
//         break;
//       case "matching_features":
//         if (!form.matchingFeatures.item)
//           return "Vui lòng nhập mục cho matching_features.";
//         if (form.matchingFeatures.features.some((f) => !f))
//           return "Vui lòng nhập đầy đủ các đặc điểm.";
//         if (!form.matchingFeatures.matchedFeature)
//           return "Vui lòng nhập đặc điểm đúng.";
//         break;
//       case "matching_sentence_endings":
//         if (!form.matchingSentenceEndings.start)
//           return "Vui lòng nhập câu bắt đầu cho matching_sentence_endings.";
//         if (form.matchingSentenceEndings.endings.some((e) => !e))
//           return "Vui lòng nhập đầy đủ các kết thúc.";
//         if (!form.matchingSentenceEndings.correctEnding)
//           return "Vui lòng nhập kết thúc đúng.";
//         break;
//       case "sentence_completion":
//         if (!form.sentenceCompletion.sentenceWithBlank)
//           return "Vui lòng nhập câu có chỗ trống cho sentence_completion.";
//         if (!form.sentenceCompletion.answer)
//           return "Vui lòng nhập đáp án cho sentence_completion.";
//         break;
//       case "summary_completion":
//         if (!form.summaryCompletion.summaryText)
//           return "Vui lòng nhập tóm tắt cho summary_completion.";
//         if (form.summaryCompletion.blanks.some((b) => !b))
//           return "Vui lòng nhập đầy đủ các chỗ trống.";
//         if (form.summaryCompletion.answers.some((a) => !a))
//           return "Vui lòng nhập đầy đủ các đáp án.";
//         break;
//       case "diagram_label_completion":
//         if (!form.diagramLabelCompletion.diagramUrl)
//           return "Vui lòng nhập URL sơ đồ cho diagram_label_completion.";
//         if (form.diagramLabelCompletion.labels.some((l) => !l))
//           return "Vui lòng nhập đầy đủ các nhãn.";
//         if (form.diagramLabelCompletion.correctLabels.some((cl) => !cl))
//           return "Vui lòng nhập đầy đủ các nhãn đúng.";
//         break;
//       default:
//         return "Loại câu hỏi không hợp lệ.";
//     }
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       alert(validationError);
//       return;
//     }

//     const data = new FormData();
//     const token = localStorage.getItem("token");

//     data.append("skill", form.skill);
//     data.append("part", form.part);
//     data.append("type", form.type);
//     data.append("content", form.content);
//     data.append("difficult", form.difficult);
//     data.append("explanation", form.explanation);
//     if (image) data.append("image", image);

//     if (form.type === "multiple_choice") {
//       data.append("multipleChoice[question]", form.multipleChoice.question);
//       form.multipleChoice.options.forEach((opt, i) =>
//         data.append(`multipleChoice[options][${i}]`, opt)
//       );
//       data.append("multipleChoice[answer]", form.multipleChoice.answer);
//     } else if (form.type === "true_false_not_given") {
//       data.append(
//         "trueFalseNotGiven[statement]",
//         form.trueFalseNotGiven.statement
//       );
//       data.append("trueFalseNotGiven[answer]", form.trueFalseNotGiven.answer);
//     } else if (form.type === "yes_no_not_given") {
//       data.append("yesNoNotGiven[statement]", form.yesNoNotGiven.statement);
//       data.append("yesNoNotGiven[answer]", form.yesNoNotGiven.answer);
//     } else if (form.type === "matching_headings") {
//       data.append(
//         "matchingHeadings[paragraph]",
//         form.matchingHeadings.paragraph
//       );
//       form.matchingHeadings.headings.forEach((h, i) =>
//         data.append(`matchingHeadings[headings][${i}]`, h)
//       );
//       data.append(
//         "matchingHeadings[correctHeading]",
//         form.matchingHeadings.correctHeading
//       );
//     } else if (form.type === "matching_information") {
//       data.append(
//         "matchingInformation[infoText]",
//         form.matchingInformation.infoText
//       );
//       data.append(
//         "matchingInformation[paragraphLabel]",
//         form.matchingInformation.paragraphLabel
//       );
//     } else if (form.type === "matching_features") {
//       data.append("matchingFeatures[item]", form.matchingFeatures.item);
//       form.matchingFeatures.features.forEach((f, i) =>
//         data.append(`matchingFeatures[features][${i}]`, f)
//       );
//       data.append(
//         "matchingFeatures[matchedFeature]",
//         form.matchingFeatures.matchedFeature
//       );
//     } else if (form.type === "matching_sentence_endings") {
//       data.append(
//         "matchingSentenceEndings[start]",
//         form.matchingSentenceEndings.start
//       );
//       form.matchingSentenceEndings.endings.forEach((e, i) =>
//         data.append(`matchingSentenceEndings[endings][${i}]`, e)
//       );
//       data.append(
//         "matchingSentenceEndings[correctEnding]",
//         form.matchingSentenceEndings.correctEnding
//       );
//     } else if (form.type === "sentence_completion") {
//       data.append(
//         "sentenceCompletion[sentenceWithBlank]",
//         form.sentenceCompletion.sentenceWithBlank
//       );
//       data.append("sentenceCompletion[answer]", form.sentenceCompletion.answer);
//       data.append(
//         "sentenceCompletion[wordLimit]",
//         form.sentenceCompletion.wordLimit
//       );
//     } else if (form.type === "summary_completion") {
//       data.append(
//         "summaryCompletion[summaryText]",
//         form.summaryCompletion.summaryText
//       );
//       form.summaryCompletion.blanks.forEach((b, i) =>
//         data.append(`summaryCompletion[blanks][${i}]`, b)
//       );
//       form.summaryCompletion.answers.forEach((a, i) =>
//         data.append(`summaryCompletion[answers][${i}]`, a)
//       );
//       data.append(
//         "summaryCompletion[wordLimit]",
//         form.summaryCompletion.wordLimit
//       );
//     } else if (form.type === "diagram_label_completion") {
//       data.append(
//         "diagramLabelCompletion[diagramUrl]",
//         form.diagramLabelCompletion.diagramUrl
//       );
//       form.diagramLabelCompletion.labels.forEach((l, i) =>
//         data.append(`diagramLabelCompletion[labels][${i}]`, l)
//       );
//       form.diagramLabelCompletion.correctLabels.forEach((cl, i) =>
//         data.append(`diagramLabelCompletion[correctLabels][${i}]`, cl)
//       );
//     }

//     try {
//       await axios.post("http://localhost:3000/api/reading-questions", data, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       alert("✅ Tạo câu hỏi thành công!");
//       setForm({
//         skill: "",
//         part: "",
//         type: "multiple_choice",
//         content: "",
//         difficult: "medium",
//         explanation: "",
//         multipleChoice: { question: "", options: ["", "", "", ""], answer: "" },
//         trueFalseNotGiven: { statement: "", answer: "True" },
//         yesNoNotGiven: { statement: "", answer: "Yes" },
//         matchingHeadings: {
//           paragraph: "",
//           headings: ["", ""],
//           correctHeading: "",
//         },
//         matchingInformation: { infoText: "", paragraphLabel: "" },
//         matchingFeatures: { item: "", features: ["", ""], matchedFeature: "" },
//         matchingSentenceEndings: {
//           start: "",
//           endings: ["", ""],
//           correctEnding: "",
//         },
//         sentenceCompletion: {
//           sentenceWithBlank: "",
//           answer: "",
//           wordLimit: "",
//         },
//         summaryCompletion: {
//           summaryText: "",
//           blanks: [""],
//           answers: [""],
//           wordLimit: "",
//         },
//         diagramLabelCompletion: {
//           diagramUrl: "",
//           labels: [""],
//           correctLabels: [""],
//         },
//       });
//       setImage(null);
//     } catch (err) {
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         alert(
//           "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
//         );
//         localStorage.removeItem("token");
//         localStorage.removeItem("roleId");
//         localStorage.removeItem("role");
//         window.location.href = "/login";
//       } else {
//         alert(
//           "❌ Lỗi gửi câu hỏi: " + (err.response?.data?.message || err.message)
//         );
//       }
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">
//         Tạo câu hỏi Reading
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Skill
//           </label>
//           <select
//             name="skill"
//             value={form.skill}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             required>
//             <option value="">-- Chọn kỹ năng --</option>
//             {skills.map((skill) => (
//               <option key={skill._id} value={skill._id}>
//                 {skill.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Part
//           </label>
//           <select
//             name="part"
//             value={form.part}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             required>
//             <option value="">-- Chọn part --</option>
//             {filteredParts.map((part) => (
//               <option key={part._id} value={part._id}>
//                 {part.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Loại câu hỏi
//           </label>
//           <select
//             name="type"
//             value={form.type}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
//             <option value="multiple_choice">Multiple Choice</option>
//             <option value="true_false_not_given">True/False/Not Given</option>
//             <option value="yes_no_not_given">Yes/No/Not Given</option>
//             <option value="matching_headings">Matching Headings</option>
//             <option value="matching_information">Matching Information</option>
//             <option value="matching_features">Matching Features</option>
//             <option value="matching_sentence_endings">
//               Matching Sentence Endings
//             </option>
//             <option value="sentence_completion">Sentence Completion</option>
//             <option value="summary_completion">Summary Completion</option>
//             <option value="diagram_label_completion">
//               Diagram Label Completion
//             </option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Nội dung
//           </label>
//           <textarea
//             name="content"
//             value={form.content}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Hình ảnh (tùy chọn)
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             className="mt-1 block w-full"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Độ khó
//           </label>
//           <select
//             name="difficult"
//             value={form.difficult}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
//             <option value="easy">Dễ</option>
//             <option value="medium">Trung bình</option>
//             <option value="hard">Khó</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Giải thích
//           </label>
//           <textarea
//             name="explanation"
//             value={form.explanation}
//             onChange={handleChange}
//             className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         {form.type === "multiple_choice" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Câu hỏi
//             </label>
//             <input
//               value={form.multipleChoice.question}
//               onChange={(e) =>
//                 handleNestedChange("multipleChoice", "question", e.target.value)
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Tùy chọn
//             </label>
//             {form.multipleChoice.options.map((opt, i) => (
//               <input
//                 key={i}
//                 value={opt}
//                 placeholder={`Tùy chọn ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "multipleChoice",
//                     "options",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("multipleChoice", "options")}
//               className="mt-2 text-blue-600">
//               + Thêm tùy chọn
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Đáp án
//             </label>
//             <input
//               value={form.multipleChoice.answer}
//               onChange={(e) =>
//                 handleNestedChange("multipleChoice", "answer", e.target.value)
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//         )}

//         {["true_false_not_given", "yes_no_not_given"].includes(form.type) && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Câu hỏi
//             </label>
//             <input
//               value={form[form.type].statement}
//               onChange={(e) =>
//                 handleNestedChange(form.type, "statement", e.target.value)
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Đáp án
//             </label>
//             <select
//               value={form[form.type].answer}
//               onChange={(e) =>
//                 handleNestedChange(form.type, "answer", e.target.value)
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required>
//               {form.type === "true_false_not_given" ? (
//                 <>
//                   <option value="True">True</option>
//                   <option value="False">False</option>
//                   <option value="Not Given">Not Given</option>
//                 </>
//               ) : (
//                 <>
//                   <option value="Yes">Yes</option>
//                   <option value="No">No</option>
//                   <option value="Not Given">Not Given</option>
//                 </>
//               )}
//             </select>
//           </div>
//         )}

//         {form.type === "matching_headings" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Đoạn văn
//             </label>
//             <textarea
//               value={form.matchingHeadings.paragraph}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingHeadings",
//                   "paragraph",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Các tiêu đề
//             </label>
//             {form.matchingHeadings.headings.map((h, i) => (
//               <input
//                 key={i}
//                 value={h}
//                 placeholder={`Tiêu đề ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "matchingHeadings",
//                     "headings",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("matchingHeadings", "headings")}
//               className="mt-2 text-blue-600">
//               + Thêm tiêu đề
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Tiêu đề đúng
//             </label>
//             <input
//               value={form.matchingHeadings.correctHeading}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingHeadings",
//                   "correctHeading",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//         )}

//         {form.type === "matching_information" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Thông tin
//             </label>
//             <textarea
//               value={form.matchingInformation.infoText}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingInformation",
//                   "infoText",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Nhãn đoạn văn
//             </label>
//             <input
//               value={form.matchingInformation.paragraphLabel}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingInformation",
//                   "paragraphLabel",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//         )}

//         {form.type === "matching_features" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Mục
//             </label>
//             <input
//               value={form.matchingFeatures.item}
//               onChange={(e) =>
//                 handleNestedChange("matchingFeatures", "item", e.target.value)
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Các đặc điểm
//             </label>
//             {form.matchingFeatures.features.map((f, i) => (
//               <input
//                 key={i}
//                 value={f}
//                 placeholder={`Đặc điểm ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "matchingFeatures",
//                     "features",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("matchingFeatures", "features")}
//               className="mt-2 text-blue-600">
//               + Thêm đặc điểm
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Đặc điểm đúng
//             </label>
//             <input
//               value={form.matchingFeatures.matchedFeature}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingFeatures",
//                   "matchedFeature",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//         )}

//         {form.type === "matching_sentence_endings" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Câu bắt đầu
//             </label>
//             <input
//               value={form.matchingSentenceEndings.start}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingSentenceEndings",
//                   "start",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Các kết thúc
//             </label>
//             {form.matchingSentenceEndings.endings.map((e, i) => (
//               <input
//                 key={i}
//                 value={e}
//                 placeholder={`Kết thúc ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "matchingSentenceEndings",
//                     "endings",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("matchingSentenceEndings", "endings")}
//               className="mt-2 text-blue-600">
//               + Thêm kết thúc
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Kết thúc đúng
//             </label>
//             <input
//               value={form.matchingSentenceEndings.correctEnding}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "matchingSentenceEndings",
//                   "correctEnding",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//         )}

//         {form.type === "sentence_completion" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Câu có chỗ trống
//             </label>
//             <input
//               value={form.sentenceCompletion.sentenceWithBlank}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "sentenceCompletion",
//                   "sentenceWithBlank",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Đáp án
//             </label>
//             <input
//               value={form.sentenceCompletion.answer}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "sentenceCompletion",
//                   "answer",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Giới hạn từ
//             </label>
//             <input
//               type="number"
//               value={form.sentenceCompletion.wordLimit}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "sentenceCompletion",
//                   "wordLimit",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             />
//           </div>
//         )}

//         {form.type === "summary_completion" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Tóm tắt
//             </label>
//             <textarea
//               value={form.summaryCompletion.summaryText}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "summaryCompletion",
//                   "summaryText",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Chỗ trống
//             </label>
//             {form.summaryCompletion.blanks.map((b, i) => (
//               <input
//                 key={i}
//                 value={b}
//                 placeholder={`Chỗ trống ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "summaryCompletion",
//                     "blanks",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("summaryCompletion", "blanks")}
//               className="mt-2 text-blue-600">
//               + Thêm chỗ trống
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Đáp án
//             </label>
//             {form.summaryCompletion.answers.map((a, i) => (
//               <input
//                 key={i}
//                 value={a}
//                 placeholder={`Đáp án ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "summaryCompletion",
//                     "answers",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("summaryCompletion", "answers")}
//               className="mt-2 text-blue-600">
//               + Thêm đáp án
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Giới hạn từ
//             </label>
//             <input
//               type="number"
//               value={form.summaryCompletion.wordLimit}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "summaryCompletion",
//                   "wordLimit",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             />
//           </div>
//         )}

//         {form.type === "diagram_label_completion" && (
//           <div className="border-t pt-4">
//             <label className="block text-sm font-medium text-gray-700">
//               URL sơ đồ
//             </label>
//             <input
//               value={form.diagramLabelCompletion.diagramUrl}
//               onChange={(e) =>
//                 handleNestedChange(
//                   "diagramLabelCompletion",
//                   "diagramUrl",
//                   e.target.value
//                 )
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Nhãn
//             </label>
//             {form.diagramLabelCompletion.labels.map((l, i) => (
//               <input
//                 key={i}
//                 value={l}
//                 placeholder={`Nhãn ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "diagramLabelCompletion",
//                     "labels",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => addToArray("diagramLabelCompletion", "labels")}
//               className="mt-2 text-blue-600">
//               + Thêm nhãn
//             </button>
//             <label className="block text-sm font-medium text-gray-700 mt-2">
//               Nhãn đúng
//             </label>
//             {form.diagramLabelCompletion.correctLabels.map((cl, i) => (
//               <input
//                 key={i}
//                 value={cl}
//                 placeholder={`Nhãn đúng ${i + 1}`}
//                 onChange={(e) =>
//                   handleArrayChange(
//                     "diagramLabelCompletion",
//                     "correctLabels",
//                     i,
//                     e.target.value
//                   )
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() =>
//                 addToArray("diagramLabelCompletion", "correctLabels")
//               }
//               className="mt-2 text-blue-600">
//               + Thêm nhãn đúng
//             </button>
//           </div>
//         )}

//         <button
//           type="submit"
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//           Gửi câu hỏi
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import axios from "axios";
import { useAdminCheck } from "../../utils/auth";

export default function ReadingCreate() {
  const [skills, setSkills] = useState([]);
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  useAdminCheck();

  const [form, setForm] = useState({
    skill: "",
    part: "",
    type: "multiple_choice",
    content: "", // Nội dung chung (mô tả bài)
    difficulty: "easy",
    passage: "", // Đoạn văn cho bài đọc
    image: null,
    question: "",
    options: ["", "", "", ""],
    answer: "",
    instruction: "",
    blanks: [""],
    answers: [""],
    wordLimit: "",
    items: [""],
    matches: [""],
    diagramUrl: "",
    labels: [""],
    correctLabels: [""],
    sentenceWithBlank: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3000/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSkills(res.data.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          window.location.href = "/login";
        } else {
          alert("Lỗi lấy skill: " + (err.response?.data?.error || err.message));
        }
      });

    axios
      .get("http://localhost:3000/api/parts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setParts(res.data.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("roleId");
          localStorage.removeItem("role");
          window.location.href = "/login";
        } else {
          alert("Lỗi lấy part: " + (err.response?.data?.error || err.message));
        }
      });
  }, []);

  useEffect(() => {
    const filtered = parts.filter(
      (p) => p.skill === form.skill || p.skill?._id === form.skill
    );
    setFilteredParts(filtered);
    setForm((prev) => ({ ...prev, part: "" }));
  }, [form.skill, parts]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addToArray = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const token = localStorage.getItem("token");

    // Gắn các trường chung
    data.append("skill", form.skill);
    data.append("part", form.part);
    data.append("type", form.type);
    data.append("difficulty", form.difficulty);
    data.append("content", form.content);
    data.append("passage", form.passage);
    if (form.image) data.append("image", form.image);

    // Tùy loại câu hỏi
    if (form.type === "multiple_choice") {
      data.append("multipleChoice.question", form.question);
      form.options.forEach((opt, i) =>
        data.append(`multipleChoice.options[${i}]`, opt)
      );
      data.append("multipleChoice.answer", form.answer);
    }

    if (form.type === "short_answer") {
      data.append("shortAnswer.question", form.question);
      data.append("shortAnswer.answer", form.answer);
    }

    if (form.type === "matching") {
      data.append("matching.question", form.question);
      form.items.forEach((val, i) => data.append(`matching.items[${i}]`, val));
      form.options.forEach((val, i) =>
        data.append(`matching.options[${i}]`, val)
      );
      form.matches.forEach((val, i) =>
        data.append(`matching.correctMatches[${i}]`, val)
      );
    }

    if (form.type === "summary_completion") {
      data.append("summaryCompletion.instruction", form.instruction);
      form.blanks.forEach((val, i) =>
        data.append(`summaryCompletion.blanks[${i}]`, val)
      );
      form.answers.forEach((val, i) =>
        data.append(`summaryCompletion.answers[${i}]`, val)
      );
      data.append("summaryCompletion.wordLimit", form.wordLimit);
    }

    if (form.type === "diagram_label_completion") {
      data.append("diagramLabelCompletion.diagramUrl", form.diagramUrl);
      form.labels.forEach((val, i) =>
        data.append(`diagramLabelCompletion.labels[${i}]`, val)
      );
      form.correctLabels.forEach((val, i) =>
        data.append(`diagramLabelCompletion.correctLabels[${i}]`, val)
      );
    }

    if (form.type === "sentence_completion") {
      data.append(
        "sentenceCompletion.sentenceWithBlank",
        form.sentenceWithBlank
      );
      data.append("sentenceCompletion.answer", form.answer);
      data.append("sentenceCompletion.wordLimit", form.wordLimit);
    }

    try {
      await axios.post("http://localhost:3000/api/reading-questions", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Tạo câu hỏi thành công!");
      setForm({
        skill: "",
        part: "",
        type: "multiple_choice",
        content: "",
        difficulty: "easy",
        passage: "",
        image: null,
        question: "",
        options: ["", "", "", ""],
        answer: "",
        instruction: "",
        blanks: [""],
        answers: [""],
        wordLimit: "",
        items: [""],
        matches: [""],
        diagramUrl: "",
        labels: [""],
        correctLabels: [""],
        sentenceWithBlank: "",
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("roleId");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else {
        alert(
          "❌ Lỗi gửi câu hỏi: " + (err.response?.data?.error || err.message)
        );
      }
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Tạo câu hỏi Reading</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Skill:</label>
        <select
          name="skill"
          value={form.skill}
          onChange={handleChange}
          required>
          <option value="">-- Chọn kỹ năng --</option>
          {skills.map((skill) => (
            <option key={skill._id} value={skill._id}>
              {skill.name}
            </option>
          ))}
        </select>
        <br />

        <label>Part:</label>
        <select name="part" value={form.part} onChange={handleChange} required>
          <option value="">-- Chọn part --</option>
          {filteredParts.map((part) => (
            <option key={part._id} value={part._id}>
              {part.name}
            </option>
          ))}
        </select>
        <br />

        <label>Loại câu hỏi:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="short_answer">Short Answer</option>
          <option value="matching">Matching</option>
          <option value="summary_completion">Summary Completion</option>
          <option value="diagram_label_completion">
            Diagram Label Completion
          </option>
          <option value="sentence_completion">Sentence Completion</option>
        </select>
        <br />

        <label>Nội dung chung:</label>
        <input
          type="text"
          name="content"
          value={form.content}
          onChange={handleChange}
        />
        <br />

        <label>Đoạn văn:</label>
        <textarea
          name="passage"
          value={form.passage}
          onChange={handleChange}
          rows="6"
          style={{ width: "100%" }}
          placeholder="Nhập đoạn văn cho bài đọc..."
        />
        <br />

        <label>Hình ảnh (tùy chọn):</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        <br />

        <label>Độ khó:</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
        <br />

        {form.type === "multiple_choice" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
              required
            />
            <br />
            <label>Tùy chọn:</label>
            {form.options.map((opt, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={opt}
                  placeholder={`Tùy chọn ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("options", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("options")}
              style={{ color: "blue" }}>
              + Thêm tùy chọn
            </button>
            <br />
            <label>Đáp án:</label>
            <input
              type="text"
              name="answer"
              value={form.answer}
              onChange={handleChange}
              required
            />
            <br />
          </div>
        )}

        {form.type === "short_answer" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
              required
            />
            <br />
            <label>Đáp án:</label>
            <input
              type="text"
              name="answer"
              value={form.answer}
              onChange={handleChange}
              required
            />
            <br />
          </div>
        )}

        {form.type === "matching" && (
          <div>
            <label>Câu hỏi:</label>
            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
              required
            />
            <br />
            <label>Các mục:</label>
            {form.items.map((item, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={item}
                  placeholder={`Mục ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("items", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("items")}
              style={{ color: "blue" }}>
              + Thêm mục
            </button>
            <br />
            <label>Tùy chọn:</label>
            {form.options.map((opt, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={opt}
                  placeholder={`Tùy chọn ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("options", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("options")}
              style={{ color: "blue" }}>
              + Thêm tùy chọn
            </button>
            <br />
            <label>Đáp án khớp:</label>
            {form.matches.map((match, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={match}
                  placeholder={`Khớp ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("matches", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("matches")}
              style={{ color: "blue" }}>
              + Thêm khớp
            </button>
            <br />
          </div>
        )}

        {form.type === "summary_completion" && (
          <div>
            <label>Hướng dẫn:</label>
            <input
              type="text"
              name="instruction"
              value={form.instruction}
              onChange={handleChange}
              required
            />
            <br />
            <label>Chỗ trống:</label>
            {form.blanks.map((blank, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={blank}
                  placeholder={`Chỗ trống ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("blanks", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("blanks")}
              style={{ color: "blue" }}>
              + Thêm chỗ trống
            </button>
            <br />
            <label>Đáp án:</label>
            {form.answers.map((ans, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={ans}
                  placeholder={`Đáp án ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("answers", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("answers")}
              style={{ color: "blue" }}>
              + Thêm đáp án
            </button>
            <br />
            <label>Giới hạn từ:</label>
            <input
              type="number"
              name="wordLimit"
              value={form.wordLimit}
              onChange={handleChange}
            />
            <br />
          </div>
        )}

        {form.type === "diagram_label_completion" && (
          <div>
            <label>URL sơ đồ:</label>
            <input
              type="text"
              name="diagramUrl"
              value={form.diagramUrl}
              onChange={handleChange}
              required
            />
            <br />
            <label>Nhãn:</label>
            {form.labels.map((label, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={label}
                  placeholder={`Nhãn ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("labels", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("labels")}
              style={{ color: "blue" }}>
              + Thêm nhãn
            </button>
            <br />
            <label>Nhãn đúng:</label>
            {form.correctLabels.map((cl, i) => (
              <div key={i}>
                <input
                  type="text"
                  value={cl}
                  placeholder={`Nhãn đúng ${i + 1}`}
                  onChange={(e) =>
                    handleArrayChange("correctLabels", i, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("correctLabels")}
              style={{ color: "blue" }}>
              + Thêm nhãn đúng
            </button>
            <br />
          </div>
        )}

        {form.type === "sentence_completion" && (
          <div>
            <label>Câu có chỗ trống:</label>
            <input
              type="text"
              name="sentenceWithBlank"
              value={form.sentenceWithBlank}
              onChange={handleChange}
              required
            />
            <br />
            <label>Đáp án:</label>
            <input
              type="text"
              name="answer"
              value={form.answer}
              onChange={handleChange}
              required
            />
            <br />
            <label>Giới hạn từ:</label>
            <input
              type="number"
              name="wordLimit"
              value={form.wordLimit}
              onChange={handleChange}
            />
            <br />
          </div>
        )}

        <button
          type="submit"
          style={{ background: "blue", color: "white", padding: "10px 20px" }}>
          Gửi câu hỏi
        </button>
      </form>
    </div>
  );
}
