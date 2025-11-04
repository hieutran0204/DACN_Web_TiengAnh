
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const backendUrl = "http://localhost:3000";

export default function ExamDetail_User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  const handleSubmit = () => {
    if (
      !exam ||
      (!exam.skills?.listening &&
        !exam.skills?.reading &&
        !exam.skills?.speaking &&
        !exam.skills?.writing) ||
      (!exam.skills.listening?.length &&
        !exam.skills.reading?.length &&
        !exam.skills.speaking?.length &&
        !exam.skills.writing?.length)
    ) {
      setError("Không có câu hỏi để nộp.");
      return;
    }

    let correctCount = 0;
    const totalQuestions =
      (exam.skills.listening?.length || 0) + (exam.skills.reading?.length || 0);

    const scoreableSkills = [
      ...(exam.skills.listening || []),
      ...(exam.skills.reading || []),
    ];
    scoreableSkills.forEach((question) => {
      const { correctAnswer } = getQuestionData(question);
      const userAnswer = answers[question._id];
      const isCorrect = Array.isArray(correctAnswer)
        ? JSON.stringify(correctAnswer.sort()) ===
          JSON.stringify((userAnswer || "").split(", ").sort())
        : userAnswer === correctAnswer;
      if (isCorrect) correctCount++;
    });

    const calculatedScore =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    setScore(calculatedScore);
    setSubmitted(true);
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data;
        if (!data) {
          setError("Không nhận được dữ liệu đề thi.");
          return;
        }
        if (
          !data.skills ||
          (!data.skills.listening &&
            !data.skills.reading &&
            !data.skills.speaking &&
            !data.skills.writing)
        ) {
          setError("Đề thi không chứa câu hỏi hoặc dữ liệu không hợp lệ.");
          return;
        }
        if (
          !Array.isArray(data.skills.listening) &&
          !Array.isArray(data.skills.reading) &&
          !Array.isArray(data.skills.speaking) &&
          !Array.isArray(data.skills.writing)
        ) {
          setError("Dữ liệu câu hỏi không phải là mảng.");
          return;
        }
        setExam(data);
        setError(null);
        const duration = data.durationMinutes || 60;
        setTimeLeft(duration * 60);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(`Không thể tải đề thi: ${errorMsg}`);
        if (err.response?.status === 401) navigate("/login");
      }
    };
    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    if (!exam || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) =>
        prev <= 1 ? (clearInterval(timer), handleSubmit(), 0) : prev - 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, submitted, timeLeft, handleSubmit]);

  const getQuestionData = (question) => {
    const baseData = {
      question: "",
      options: [],
      correctAnswer: "",
      inputType: null,
    };
    switch (question.type) {
      case "multiple_choice": {
        const { question: q, options, answer } = question.multipleChoice || {};
        return {
          ...baseData,
          question: q || "Câu hỏi không hợp lệ",
          options: options || [],
          correctAnswer: answer || "",
          inputType: "radio",
        };
      }
      case "short_answer": {
        const { question: q, answer } = question.shortAnswer || {};
        return {
          ...baseData,
          question: q || "Trả lời ngắn",
          options: [],
          correctAnswer: answer || "",
          inputType: "text",
        };
      }
      case "matching":
      case "matching_headings":
      case "matching_information":
      case "matching_features":
      case "matching_sentence_endings": {
        const typeKey = question.type;
        const data = question[typeKey] || {};
        const correctAnswer =
          typeKey === "matching"
            ? data.correctMatches?.join(", ") || ""
            : typeKey === "matching_headings"
              ? data.correctHeading || ""
              : typeKey === "matching_features"
                ? data.matchedFeature || ""
                : typeKey === "matching_sentence_endings"
                  ? data.correctEnding || ""
                  : data.correctMatches?.join(", ") || "";
        return {
          ...baseData,
          question: `${typeKey.replace("matching_", "")}: ${data.question || data.paragraph || data.infoText || ""}`,
          options:
            data.options ||
            data.headings ||
            data.features ||
            data.endings ||
            [],
          correctAnswer,
          inputType: "select",
        };
      }
      case "form_note_table_completion": {
        const {
          question: q,
          blanks,
          answers,
        } = question.formNoteTableCompletion || {};
        return {
          ...baseData,
          question: q || "Điền vào bảng ghi chú",
          options: blanks || [],
          correctAnswer: answers || [],
          inputType: "text",
        };
      }
      case "plan_map_diagram_labelling":
      case "diagram_label_completion": {
        const {
          question: q,
          labels,
          correctLabels,
        } = question[question.type] || {};
        return {
          ...baseData,
          question: q || `${question.type.replace("_", " ")}`,
          options: labels || [],
          correctAnswer: correctLabels || [],
          inputType: "text",
        };
      }
      case "sentence_completion":
      case "summary_completion": {
        const data = question[question.type] || {};
        const correctAnswer =
          question.type === "summary_completion"
            ? data.answers || []
            : data.answer || "";
        return {
          ...baseData,
          question:
            data.sentenceWithBlank ||
            data.summaryText ||
            `${question.type.replace("_", " ")}`,
          options: [],
          correctAnswer,
          inputType: "text",
        };
      }
      case "true_false_not_given":
      case "yes_no_not_given": {
        const data = question.trueFalseNotGiven || question.yesNoNotGiven || {};
        return {
          ...baseData,
          question: data.statement || "Đúng/Sai/Không đủ thông tin",
          options: ["True/Yes", "False/No", "Not Given"],
          correctAnswer: data.answer || "",
          inputType: "radio",
        };
      }
      case "personal_experience":
      case "descriptive":
      case "comparative":
      case "opinion_based":
      case "cause_effect":
      case "hypothetical":
      case "advantage_disadvantage":
      case "problem_solution":
      case "prediction":
      case "abstract": {
        const { question: q, suggestedIdeas, sampleAnswer } = question || {};
        return {
          ...baseData,
          question: q || `${question.type.replace("_", " ")}`,
          options: [],
          correctAnswer:
            sampleAnswer || suggestedIdeas?.join(", ") || "Không có gợi ý",
          inputType: "text",
        };
      }
      case "bar_chart":
      case "line_graph":
      case "pie_chart":
      case "table":
      case "process":
      case "map":
      case "mixed_chart":
      case "formal_letter":
      case "semi_formal_letter":
      case "informal_letter":
      case "opinion":
      case "discussion": {
        const { question: q, suggestedIdeas, sampleAnswer } = question || {};
        return {
          ...baseData,
          question: q || `${question.type.replace("_", " ")}`,
          options: [],
          correctAnswer:
            sampleAnswer || suggestedIdeas?.join(", ") || "Không có gợi ý",
          inputType: "textarea",
        };
      }
      default:
        return {
          ...baseData,
          question: "Loại câu hỏi không hỗ trợ",
          options: [],
          correctAnswer: "",
          inputType: null,
        };
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (!exam && !error)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Đang tải...</div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        {error}
      </div>
    );

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const totalQuestionsBefore = (skill) => {
    return (
      (exam.skills.listening?.length || 0) +
      (exam.skills.reading?.length || 0) +
      (exam.skills.speaking?.length || 0)
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f3f4f6",
        padding: "0",
      }}>
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "white",
          padding: "20px",
          boxSizing: "border-box",
        }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "16px",
          }}>
          {exam?.title}
        </h2>
        <p
          style={{
            color: "#6b7280",
            textAlign: "center",
            marginBottom: "16px",
          }}>
          Thời gian còn lại: {formatTime(timeLeft)}
        </p>
        <p
          style={{
            color: "#6b7280",
            textAlign: "center",
            marginBottom: "24px",
          }}>
          Tạo lúc: {new Date(exam?.createdAt).toLocaleDateString("vi-VN")}
        </p>

        {!submitted ? (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center",
                }}>
                Câu hỏi
              </h3>
              {exam.skills?.listening?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}>
                    Listening
                  </h4>
                  {exam.skills.listening.map((question, index) => {
                    const {
                      question: qText,
                      options,
                      correctAnswer,
                      inputType,
                    } = getQuestionData(question);
                    const uniqueKey = `${question._id}-${index}`;
                    return (
                      <div
                        key={uniqueKey}
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                        }}>
                        <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                          Câu {index + 1} ({question.type}): {qText}
                        </p>
                        {question.audio && (
                          <audio
                            controls
                            style={{ marginBottom: "8px", width: "100%" }}>
                            <source
                              src={`${backendUrl}${question.audio}`}
                              type="audio/mpeg"
                            />
                            Trình duyệt của bạn không hỗ trợ thẻ audio.
                          </audio>
                        )}
                        {question.image && (
                          <img
                            src={`${backendUrl}${question.image}`}
                            alt="Hình minh họa"
                            style={{
                              marginBottom: "8px",
                              maxWidth: "200px",
                              height: "auto",
                              borderRadius: "8px",
                              display: "block",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          />
                        )}
                        {inputType === "radio" && options.length > 0 ? (
                          options.map((option, optIndex) => (
                            <div
                              key={`${uniqueKey}-option-${optIndex}`}
                              style={{
                                marginLeft: "16px",
                                marginBottom: "8px",
                              }}>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}>
                                <input
                                  type="radio"
                                  name={question._id || `q${index}`}
                                  value={option}
                                  checked={
                                    answers[question._id || `q${index}`] ===
                                    option
                                  }
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question._id || `q${index}`,
                                      e.target.value
                                    )
                                  }
                                  style={{ marginRight: "8px" }}
                                  disabled={submitted}
                                />
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </label>
                            </div>
                          ))
                        ) : inputType === "text" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <input
                              type="text"
                              value={answers[question._id || `q${index}`] || ""}
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "textarea" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <textarea
                              value={answers[question._id || `q${index}`] || ""}
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                                resize: "vertical",
                              }}
                              rows="3"
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "select" && options.length > 0 ? (
                          <div style={{ marginLeft: "16px" }}>
                            <select
                              value={answers[question._id || `q${index}`] || ""}
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}>
                              <option value="">Chọn đáp án</option>
                              {options.map((option, optIndex) => (
                                <option
                                  key={`${uniqueKey}-option-${optIndex}`}
                                  value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p style={{ color: "red", fontSize: "14px" }}>
                            Không hỗ trợ loại câu hỏi này hoặc thiếu dữ liệu
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {exam.skills?.reading?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}>
                    Reading
                  </h4>
                  {exam.skills.reading.map((question, index) => {
                    const {
                      question: qText,
                      options,
                      correctAnswer,
                      inputType,
                    } = getQuestionData(question);
                    const baseIndex = exam.skills.listening?.length || 0;
                    const uniqueKey = `${question._id}-${baseIndex + index}`;
                    return (
                      <div
                        key={uniqueKey}
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                        }}>
                        <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                          Câu {baseIndex + index + 1} ({question.type}): {qText}
                        </p>
                        {question.audio && (
                          <audio
                            controls
                            style={{ marginBottom: "8px", width: "100%" }}>
                            <source
                              src={`${backendUrl}${question.audio}`}
                              type="audio/mpeg"
                            />
                            Trình duyệt của bạn không hỗ trợ thẻ audio.
                          </audio>
                        )}
                        {question.image && (
                          <img
                            src={`${backendUrl}${question.image}`}
                            alt="Hình minh họa"
                            style={{
                              marginBottom: "8px",
                              maxWidth: "200px",
                              height: "auto",
                              borderRadius: "8px",
                              display: "block",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          />
                        )}
                        {inputType === "radio" && options.length > 0 ? (
                          options.map((option, optIndex) => (
                            <div
                              key={`${uniqueKey}-option-${optIndex}`}
                              style={{
                                marginLeft: "16px",
                                marginBottom: "8px",
                              }}>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}>
                                <input
                                  type="radio"
                                  name={question._id || `q${baseIndex + index}`}
                                  value={option}
                                  checked={
                                    answers[
                                      question._id || `q${baseIndex + index}`
                                    ] === option
                                  }
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question._id || `q${baseIndex + index}`,
                                      e.target.value
                                    )
                                  }
                                  style={{ marginRight: "8px" }}
                                  disabled={submitted}
                                />
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </label>
                            </div>
                          ))
                        ) : inputType === "text" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <input
                              type="text"
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "textarea" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <textarea
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                                resize: "vertical",
                              }}
                              rows="3"
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "select" && options.length > 0 ? (
                          <div style={{ marginLeft: "16px" }}>
                            <select
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}>
                              <option value="">Chọn đáp án</option>
                              {options.map((option, optIndex) => (
                                <option
                                  key={`${uniqueKey}-option-${optIndex}`}
                                  value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p style={{ color: "red", fontSize: "14px" }}>
                            Không hỗ trợ loại câu hỏi này hoặc thiếu dữ liệu
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {exam.skills?.speaking?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}>
                    Speaking
                  </h4>
                  {exam.skills.speaking.map((question, index) => {
                    const {
                      question: qText,
                      options,
                      correctAnswer,
                      inputType,
                    } = getQuestionData(question);
                    const baseIndex =
                      (exam.skills.listening?.length || 0) +
                      (exam.skills.reading?.length || 0);
                    const uniqueKey = `${question._id}-${baseIndex + index}`;
                    return (
                      <div
                        key={uniqueKey}
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                        }}>
                        <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                          Câu {baseIndex + index + 1} ({question.type}): {qText}
                        </p>
                        {question.audio && (
                          <audio
                            controls
                            style={{ marginBottom: "8px", width: "100%" }}>
                            <source
                              src={`${backendUrl}${question.audio}`}
                              type="audio/mpeg"
                            />
                            Trình duyệt của bạn không hỗ trợ thẻ audio.
                          </audio>
                        )}
                        {question.image && (
                          <img
                            src={`${backendUrl}${question.image}`}
                            alt="Hình minh họa"
                            style={{
                              marginBottom: "8px",
                              maxWidth: "200px",
                              height: "auto",
                              borderRadius: "8px",
                              display: "block",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          />
                        )}
                        {inputType === "radio" && options.length > 0 ? (
                          options.map((option, optIndex) => (
                            <div
                              key={`${uniqueKey}-option-${optIndex}`}
                              style={{
                                marginLeft: "16px",
                                marginBottom: "8px",
                              }}>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}>
                                <input
                                  type="radio"
                                  name={question._id || `q${baseIndex + index}`}
                                  value={option}
                                  checked={
                                    answers[
                                      question._id || `q${baseIndex + index}`
                                    ] === option
                                  }
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question._id || `q${baseIndex + index}`,
                                      e.target.value
                                    )
                                  }
                                  style={{ marginRight: "8px" }}
                                  disabled={submitted}
                                />
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </label>
                            </div>
                          ))
                        ) : inputType === "text" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <input
                              type="text"
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "textarea" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <textarea
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                                resize: "vertical",
                              }}
                              rows="3"
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "select" && options.length > 0 ? (
                          <div style={{ marginLeft: "16px" }}>
                            <select
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}>
                              <option value="">Chọn đáp án</option>
                              {options.map((option, optIndex) => (
                                <option
                                  key={`${uniqueKey}-option-${optIndex}`}
                                  value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p style={{ color: "red", fontSize: "14px" }}>
                            Không hỗ trợ loại câu hỏi này hoặc thiếu dữ liệu
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {exam.skills?.writing?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}>
                    Writing
                  </h4>
                  {exam.skills.writing.map((question, index) => {
                    const {
                      question: qText,
                      options,
                      correctAnswer,
                      inputType,
                    } = getQuestionData(question);
                    const baseIndex = totalQuestionsBefore("writing");
                    const uniqueKey = `${question._id}-${baseIndex + index}`;
                    return (
                      <div
                        key={uniqueKey}
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                        }}>
                        <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                          Câu {baseIndex + index + 1} ({question.type}): {qText}
                        </p>
                        {question.audio && (
                          <audio
                            controls
                            style={{ marginBottom: "8px", width: "100%" }}>
                            <source
                              src={`${backendUrl}${question.audio}`}
                              type="audio/mpeg"
                            />
                            Trình duyệt của bạn không hỗ trợ thẻ audio.
                          </audio>
                        )}
                        {question.image && (
                          <img
                            src={`${backendUrl}${question.image}`}
                            alt="Hình minh họa"
                            style={{
                              marginBottom: "8px",
                              maxWidth: "200px",
                              height: "auto",
                              borderRadius: "8px",
                              display: "block",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          />
                        )}
                        {inputType === "radio" && options.length > 0 ? (
                          options.map((option, optIndex) => (
                            <div
                              key={`${uniqueKey}-option-${optIndex}`}
                              style={{
                                marginLeft: "16px",
                                marginBottom: "8px",
                              }}>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}>
                                <input
                                  type="radio"
                                  name={question._id || `q${baseIndex + index}`}
                                  value={option}
                                  checked={
                                    answers[
                                      question._id || `q${baseIndex + index}`
                                    ] === option
                                  }
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question._id || `q${baseIndex + index}`,
                                      e.target.value
                                    )
                                  }
                                  style={{ marginRight: "8px" }}
                                  disabled={submitted}
                                />
                                {String.fromCharCode(65 + optIndex)}: {option}
                              </label>
                            </div>
                          ))
                        ) : inputType === "text" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <input
                              type="text"
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "textarea" ? (
                          <div style={{ marginLeft: "16px" }}>
                            <textarea
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                                resize: "vertical",
                              }}
                              rows="3"
                              disabled={submitted}
                            />
                          </div>
                        ) : inputType === "select" && options.length > 0 ? (
                          <div style={{ marginLeft: "16px" }}>
                            <select
                              value={
                                answers[
                                  question._id || `q${baseIndex + index}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  question._id || `q${baseIndex + index}`,
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                              disabled={submitted}>
                              <option value="">Chọn đáp án</option>
                              {options.map((option, optIndex) => (
                                <option
                                  key={`${uniqueKey}-option-${optIndex}`}
                                  value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p style={{ color: "red", fontSize: "14px" }}>
                            Không hỗ trợ loại câu hỏi này hoặc thiếu dữ liệu
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              style={{
                width: "100%",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={handleSubmit}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
              disabled={
                (!exam.skills?.listening?.length &&
                  !exam.skills?.reading?.length) ||
                timeLeft <= 0
              }>
              Nộp bài
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}>
              Kết quả
            </h3>
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>
              Điểm của bạn: {score?.toFixed(2) || "0"}%
            </p>
            <p style={{ color: "#6b7280", marginBottom: "16px" }}>
              {score >= 50
                ? "Chúc mừng bạn đã vượt qua!"
                : "Hãy cố gắng hơn nhé!"}
            </p>
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}>
                Đáp án/Dự thảo gợi ý:
              </h4>
              {[
                ...(exam.skills?.listening || []),
                ...(exam.skills?.reading || []),
                ...(exam.skills?.speaking || []),
                ...(exam.skills?.writing || []),
              ].map((question, index) => {
                const { question: qText, correctAnswer } =
                  getQuestionData(question);
                const isScoreable = ["listening", "reading"].includes(
                  question.part?.skill?.name || ""
                );
                const userAnswer =
                  answers[question._id || `q${index}`] || "Chưa chọn";
                const uniqueKey = `${question._id}-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    style={{
                      marginBottom: "16px",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      backgroundColor: "#f9fafb",
                    }}>
                    <p style={{ marginBottom: "8px", fontSize: "16px" }}>
                      Câu {index + 1} ({question.type}): {qText}
                    </p>
                    {question.image && (
                      <img
                        src={`${backendUrl}${question.image}`}
                        alt="Hình minh họa"
                        style={{
                          marginBottom: "8px",
                          maxWidth: "200px",
                          height: "auto",
                          borderRadius: "8px",
                          display: "block",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      />
                    )}
                    <p style={{ marginBottom: "4px" }}>
                      Đáp án của bạn: {userAnswer}
                    </p>
                    <p style={{ marginBottom: "4px" }}>
                      {isScoreable ? "Đáp án đúng: " : "Gợi ý đáp án: "}{" "}
                      {Array.isArray(correctAnswer)
                        ? correctAnswer.join(", ")
                        : correctAnswer}
                    </p>
                    {isScoreable &&
                      userAnswer !== "Chưa chọn" &&
                      (Array.isArray(correctAnswer) ? (
                        JSON.stringify(correctAnswer.sort()) ===
                        JSON.stringify(userAnswer.split(", ").sort()) ? (
                          <span style={{ color: "green" }}>Đúng</span>
                        ) : (
                          <span style={{ color: "red" }}>Sai</span>
                        )
                      ) : userAnswer === correctAnswer ? (
                        <span style={{ color: "green" }}>Đúng</span>
                      ) : (
                        <span style={{ color: "red" }}>Sai</span>
                      ))}
                  </div>
                );
              })}
            </div>
            <button
              style={{
                width: "100%",
                backgroundColor: "#22c55e",
                color: "white",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={() => navigate("/exams")}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#16a34a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#22c55e")}>
              Quay lại danh sách
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
