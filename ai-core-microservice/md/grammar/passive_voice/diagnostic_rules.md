# QUY TẮC CHẨN ĐOÁN LỖI BỊ ĐỘNG (DIAGNOSTIC RULES)

Logic core dành cho AI Validation Layer để phát hiện lỗi trong câu bị động.

## 1. DETECTION RULES

```yaml
rules:
  missing_be:
    description: "Phát hiện thiếu động từ BE trong câu bị động"
    pattern: "Subject + V3 (without am/is/are/was/were/been/being)"
    example: "The house built in 1990. (Missing 'was')"
    remedy: "Add appropriate form of BE before V3"
    error_type: "Grammar_Error"

  wrong_v_form:
    description: "Phát hiện dùng sai dạng động từ sau BE (không phải V3)"
    pattern: "BE + V1/V2/V-ing (trong ngữ cảnh bị động)"
    example: "The letter was write yesterday. (Wrong: 'write' instead of 'written')"
    error_type: "Morphology_Error"

  transitive_verb_check:
    description: "Phát hiện dùng bị động với nội động từ (Intransitive Verbs)"
    forbidden_verbs: [happen, occur, die, arrive, sleep, stay, disappear]
    trigger: "BE + V3 (of forbidden_verb)"
    example: "The accident was happened. (Wrong: 'happen' cannot be passive)"
    remedy: "Use active voice for intransitive verbs"
    error_type: "Logic_Grammar_Error"

  by_agent_redundancy:
    description: "Phát hiện thừa 'by + agent' không xác định"
    pattern: "by + [someone, somebody, people, them, me, us]"
    remedy: "Remove agent for better academic tone"
    error_type: "Style_Suggestion"
```
