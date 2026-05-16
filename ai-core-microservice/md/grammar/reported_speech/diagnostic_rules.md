# QUY TẮC CHẨN ĐOÁN LỖI CÂU GIÁN TIẾP (DIAGNOSTIC RULES)

Logic core dành cho AI Validation Layer để phát hiện lỗi khi tường thuật.

## 1. DETECTION RULES

```yaml
rules:
  no_backshift_error:
    description: "Phát hiện quên lùi thì khi động từ tường thuật ở quá khứ"
    pattern: "said/told/asked + [V1/Present_Tense]"
    example: "He said he is happy. (Wrong: 'is' should be 'was')"
    remedy: "Change verb to past form"
    error_type: "Grammar_Error"

  question_inversion_error:
    description: "Lỗi giữ nguyên đảo ngữ trong câu hỏi gián tiếp"
    pattern: "asked + [Wh-word] + [be/do/does/did] + Subject"
    example: "He asked me where was I going. (Wrong: 'where I was going')"
    remedy: "Use statement word order (Subject + Verb)"
    error_type: "Syntax_Error"

  pronoun_consistency_error:
    description: "Lỗi không đổi đại từ phù hợp với người kể"
    example: "She said I am busy. (If 'I' still refers to her, it's wrong)"
    remedy: "Check and update pronouns (I -> he/she, my -> his/her)"
    error_type: "Contextual_Error"

  time_adverb_error:
    description: "Lỗi không đổi trạng từ thời gian"
    pattern: "said/told + ... + [tomorrow, yesterday, now]"
    example: "He said he would go tomorrow. (Should be 'the next day')"
    error_type: "Style_Accuracy_Error"

  tell_say_confusion:
    description: "Phân biệt giữa SAY và TELL"
    rules:
      - "SAY + (to someone) + content"
      - "TELL + someone + content (No 'to')"
    example: "He told to me... (Wrong)"
    remedy: "Use 'He told me' or 'He said to me'"
    error_type: "Usage_Error"
```
