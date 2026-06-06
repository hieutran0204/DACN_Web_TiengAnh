import os
import re

content = """
# Writing Task 1 Band Descriptors

## Band 9

### Task Achievement
* All task requirements are fully and appropriately satisfied.
* Extremely rare lapses in content.

### Coherence & Cohesion
* Message can be followed effortlessly.
* Cohesion rarely attracts attention.
* Minimal lapses in coherence/cohesion.
* Paragraphing is skilfully managed.

### Lexical Resource
* Full flexibility and precise use.
* Wide vocabulary range used naturally and accurately.
* Sophisticated lexical control.
* Extremely rare spelling/word formation errors.

### Grammatical Range & Accuracy
* Wide range of structures with full flexibility and control.
* Grammar and punctuation are consistently appropriate.
* Extremely rare minor errors.

## Band 8

### Task Achievement
* Covers all task requirements appropriately, relevantly, and sufficiently.
* Key features are skilfully selected and clearly presented.
* Occasional omissions/lapses may occur.

### Coherence & Cohesion
* Easy to follow.
* Logical sequencing.
* Cohesion well managed.
* Paragraphing used sufficiently and appropriately.

### Lexical Resource
* Wide resource used fluently and flexibly.
* Skillful use of uncommon/idiomatic vocabulary.
* Occasional lexical inaccuracies.

### Grammatical Range & Accuracy
* Wide range of structures.
* Majority of sentences error-free.
* Occasional non-systematic errors.

## Band 7

### Task Achievement
* Covers task requirements.
* Relevant and accurate content.
* Clear overview.
* Key features highlighted.

### Coherence & Cohesion
* Logical organization.
* Clear progression.
* Flexible use of cohesive devices.
* Some minor lapses.

### Lexical Resource
* Sufficient range for flexibility and precision.
* Some less common lexical items.
* Minor lexical inaccuracies.

### Grammatical Range & Accuracy
* Variety of complex structures.
* Generally controlled grammar.
* Frequent error-free sentences.

## Band 6

### Task Achievement
* Focuses on task requirements.
* Appropriate format.
* Key features adequately highlighted.
* Relevant overview attempted.
* Some details may be missing/excessive.

### Coherence & Cohesion
* Generally coherent.
* Clear overall progression.
* Cohesion may be faulty/mechanical.
* Reference/substitution may lack clarity.

### Lexical Resource
* Generally adequate vocabulary.
* Meaning generally clear.
* Some spelling/word formation errors.

### Grammatical Range & Accuracy
* Mix of simple and complex forms.
* Limited flexibility.
* Errors occur but rarely impede communication.

## Band 5

### Task Achievement
* Generally addresses task.
* Incomplete feature coverage.
* Mechanical recounting of details.
* Limited support.

### Coherence & Cohesion
* Organization evident but not wholly logical.
* Limited cohesive devices.
* Repetition present.

### Lexical Resource
* Limited but minimally adequate.
* Restricted variation.
* Frequent lexical simplifications.

### Grammatical Range & Accuracy
* Limited structure range.
* Faulty complex sentence attempts.
* Frequent grammatical errors.

## Band 4

### Task Achievement
* Attempt to address task.
* Few key features selected.
* May contain irrelevant/inaccurate information.

### Coherence & Cohesion
* Poor progression.
* Weak logical arrangement.

### Lexical Resource
* Limited/inadequate vocabulary.
* Basic repetitive language.

### Grammatical Range & Accuracy
* Very limited structures.
* Frequent grammatical errors.

## Band 3

### Task Achievement
* Does not address task adequately.
* Limited or irrelevant information.

### Coherence & Cohesion
* No clear organization.

### Lexical Resource
* Inadequate resource.
* Severe lexical control issues.

### Grammatical Range & Accuracy
* Grammar errors dominate.

## Band 2

### Task Achievement
* Barely related to task.

### Coherence & Cohesion
* Little organizational control.

### Lexical Resource
* Extremely limited.

### Grammatical Range & Accuracy
* Little/no sentence form evidence.

## Band 1
* Responses of 20 words or fewer.
* No meaningful communication.

## Band 0
* No attempt / memorized response / non-English response.

# Writing Task 2 Band Descriptors

## Band 9

### Task Response
* Prompt fully addressed and explored in depth.
* Clear, fully developed position.
* Relevant, fully extended, well-supported ideas.

### Coherence & Cohesion
* Effortless readability.
* Cohesion invisible.
* Skilful paragraphing.

### Lexical Resource
* Precise and flexible vocabulary.
* Sophisticated lexical control.

### Grammatical Range & Accuracy
* Full structural flexibility.
* Near-perfect grammar.

## Band 8

### Task Response
* Prompt sufficiently addressed.
* Clear well-developed position.
* Relevant, well-supported ideas.

### Coherence & Cohesion
* Logical sequencing.
* Well-managed cohesion.
* Appropriate paragraphing.

### Lexical Resource
* Wide fluent vocabulary.
* Skillful uncommon lexical usage.

### Grammatical Range & Accuracy
* Flexible structures.
* Majority error-free.

## Band 7

### Task Response
* Main parts appropriately addressed.
* Clear developed position.
* Main ideas extended and supported.

### Coherence & Cohesion
* Logical organization.
* Clear progression.
* Effective paragraphing.

### Lexical Resource
* Sufficient flexibility.
* Some less common vocabulary.

### Grammatical Range & Accuracy
* Variety of complex structures.
* Generally well controlled.

## Band 6

### Task Response
* Main parts addressed.
* Relevant position.
* Some insufficient development.

### Coherence & Cohesion
* Generally coherent.
* Cohesion may be mechanical.
* Paragraphing may be inconsistent.

### Lexical Resource
* Generally adequate.
* Restricted precision.

### Grammatical Range & Accuracy
* Mix of simple and complex forms.
* Limited flexibility.

## Band 5

### Task Response
* Incomplete task coverage.
* Unclear development.
* Limited main ideas.

### Coherence & Cohesion
* Underlying coherence present.
* Weak linking.
* Inadequate paragraphing.

### Lexical Resource
* Limited vocabulary.
* Repetition and simplification.

### Grammatical Range & Accuracy
* Limited range.
* Frequent grammar errors.

## Band 4

### Task Response
* Minimal/tangential response.
* Weakly identifiable position.

### Coherence & Cohesion
* No clear progression.

### Lexical Resource
* Limited/inadequate.

### Grammatical Range & Accuracy
* Very limited structures.

## Band 3

### Task Response
* Prompt misunderstood.
* No relevant position.

### Coherence & Cohesion
* No logical organization.

### Lexical Resource
* Inadequate vocabulary.

### Grammatical Range & Accuracy
* Errors dominate.

## Band 2

### Task Response
* Barely related to prompt.

### Coherence & Cohesion
* Minimal control.

### Lexical Resource
* Extremely limited.

### Grammatical Range & Accuracy
* Little/no sentence evidence.

## Band 1
* No communicative writing.

## Band 0
* No attempt / memorized / non-English.
"""

def split_and_save():
    base_dir = os.path.join("md", "ielts")
    
    task1_dir = os.path.join(base_dir, "task1")
    task2_dir = os.path.join(base_dir, "task2")
    
    os.makedirs(task1_dir, exist_ok=True)
    os.makedirs(task2_dir, exist_ok=True)
    
    parts = re.split(r'# Writing Task (\d) Band Descriptors', content)
    
    # parts[0] is empty before the first match
    for i in range(1, len(parts), 2):
        task_num = parts[i]
        task_content = parts[i+1]
        
        current_dir = task1_dir if task_num == "1" else task2_dir
        
        bands = re.split(r'## Band (\d)', task_content)
        
        for j in range(1, len(bands), 2):
            band_num = bands[j]
            band_text = bands[j+1].strip()
            
            file_path = os.path.join(current_dir, f"band_{band_num}.md")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# Task {task_num} - Band {band_num}\n\n")
                f.write(band_text)
                
    print("Successfully generated all band descriptor files in data/ielts/!")

if __name__ == "__main__":
    split_and_save()
