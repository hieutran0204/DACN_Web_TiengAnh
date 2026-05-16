# MẪU CHUYỂN ĐỔI CÂU ĐIỀU KIỆN (TRANSFORMATION TEMPLATES)

Sử dụng các mẫu này để AI gợi ý người dùng nâng cấp từ câu đơn rời rạc sang câu điều kiện phức hợp.

## 1. CAUSE-EFFECT -> CONDITIONAL TYPE 1
*   **Source:** `[Action]. So, [Result].`
*   **Template:** `If + [Action_V1], [Result_Will_V1]`
*   **Ví dụ:**
    *   *Input:* We cut down more trees. The air becomes polluted.
    *   *Transformation:* If we **cut down** more trees, the air **will become** polluted.

## 2. FACT IN PRESENT -> CONDITIONAL TYPE 2 (Hypothesis)
*   **Source:** `I am poor, so I can't buy a house.`
*   **Template:** `If I were rich, I could buy a house.`
*   **Ví dụ:**
    *   *Input:* Many people don't use public transport because it is slow.
    *   *Transformation:* If public transport **were faster**, more people **would use** it.

## 3. REGRET IN PAST -> CONDITIONAL TYPE 3
*   **Source:** `He didn't study. He failed.`
*   **Template:** `If he had studied, he would have passed.`
*   **Ví dụ:**
    *   *Input:* The government didn't act early. The virus spread quickly.
    *   *Transformation:* If the government **had acted** early, the virus **would not have spread** so quickly.

## 4. FORMAL UPGRADE -> INVERSION
*   **Template:** `If + S + V` -> `Should/Were/Had + S + V`
*   **Ví dụ:**
    *   *Input:* If you need help, let me know.
    *   *Transformation:* **Should you need** help, please let me know. (Trang trọng hơn cho Writing).
