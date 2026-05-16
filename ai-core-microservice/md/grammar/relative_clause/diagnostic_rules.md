# QUY TẮC CHẨN ĐOÁN LỖI (DIAGNOSTIC RULES)

Dưới đây là cấu trúc logic để hệ thống AI (Validation Layer) thực hiện quét và phát hiện lỗi trong mệnh đề quan hệ.

## 1. DETECTION RULES (CẤU TRÚC PHÁT HIỆN)

```yaml
rules:
  comma_check:
    description: "Phát hiện thiếu dấu phẩy trong mệnh đề không xác định"
    trigger:
      - proper_noun + relative_pronoun (e.g., Hanoi which...)
      - possessive_noun + relative_pronoun (e.g., My father who...)
      - demonstrative_noun + relative_pronoun (e.g., That car which...)
    expectation: 
      comma_required: true
    error_type: "Punctuation_Error"

  pronoun_selection:
    description: "Kiểm tra sự phù hợp giữa Tiền ngữ và Đại từ quan hệ"
    person:
      target: [who, whom, that]
      forbidden: [which]
    thing:
      target: [which, that]
      forbidden: [who, whom]
    possession:
      target: [whose]
    error_type: "Grammar_Error"

  redundancy_check:
    description: "Phát hiện thừa đại từ tân ngữ (Object Pronoun Redundancy)"
    pattern: "Relative_Pronoun + ... + Verb + [it, them, him, her]"
    remedy: "Remove the object pronoun"
    example: "The book which I bought it (-> delete 'it')"
    error_type: "Redundancy"

  fragment_check:
    description: "Phát hiện mệnh đề quan hệ bị bỏ lửng (Sentence Fragment)"
    pattern: "Subject + [Relative_Clause] + (EOF or Punctuation)"
    missing: "Main_Verb"
    error_type: "Syntax_Error"

  that_in_non_defining:
    description: "Phát hiện dùng 'That' trong mệnh đề có dấu phẩy"
    trigger: "comma + that"
    remedy: "Replace 'that' with 'who' or 'which'"
    error_type: "Grammar_Strict_Rule"
```