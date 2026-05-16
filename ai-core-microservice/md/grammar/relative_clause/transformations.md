# MẪU CHUYỂN ĐỔI NÂNG CẤP CÂU (TRANSFORMATION TEMPLATES)

Sử dụng các mẫu này để AI gợi ý người dùng chuyển từ câu đơn (Simple) sang câu phức (Complex) nhằm tăng điểm Grammatical Range.

## 1. SIMPLE -> DEFINING RELATIVE CLAUSE
*   **Source:** `[Sentence 1: S1 + V1 + O1]. [Sentence 2: S2 + V2 + O2].` (Trong đó S2 hoặc O2 lặp lại danh từ ở Sentence 1).
*   **Template:** `S1 + [who/which/that] + V2 + O2 + V1 + O1`
*   **Ví dụ:**
    *   *Input:* Many students use AI tools. They want to save time.
    *   *Transformation:* Students **who want to save time** use AI tools.

## 2. ACTIVE -> REDUCED (V-ING)
*   **Source:** `Noun + [who/which/that] + Verb_Active`
*   **Template:** `Noun + V-ing`
*   **Ví dụ:**
    *   *Input:* The girl who is sitting next to me is kind.
    *   *Transformation:* The girl **sitting next to me** is kind. (Gọn hơn, học thuật hơn).

## 3. PASSIVE -> REDUCED (V3/ED)
*   **Source:** `Noun + [which/that] + [is/are/was/were] + V3/ed`
*   **Template:** `Noun + V3/ed`
*   **Ví dụ:**
    *   *Input:* Products which are manufactured in China are cheap.
    *   *Transformation:* Products **manufactured in China** are cheap.

## 4. CLAUSE -> WHICH (RESULTATIVE)
*   **Source:** `[Sentence 1]. This leads to [Effect].`
*   **Template:** `[Sentence 1], which leads to [Effect].`
*   **Ví dụ:**
    *   *Input:* People exercise daily. This improves their health.
    *   *Transformation:* People exercise daily, **which improves their health**.

## 5. EMPHASIS (CLEAN SENTENCE)
*   **Template:** `It is + [Subject] + that/who + [Action]`
*   **Ví dụ:**
    *   *Input:* Technology changed our lives.
    *   *Transformation:* **It is technology that** has significantly changed our lives.
