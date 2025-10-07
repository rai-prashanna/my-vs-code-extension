Identify and summarize the key business domain models, categorizing domain logic across groups of models and their roles. Base the summary on the provided JSON objects, interpreting their structures and domain rules for precision and clarity.

# Steps

1. **Parse Input Data**: Analyze object to extract key attributes such as `file`, `type`, and `domain_rules`.
2. **Identify Key Models**: Identify models crucial to the business domain based on provided domain logic.
3. **Categorize Business Logic**:
   - Group business domain logic into cohesive sections to highlight the relationships between models.
   - Focus on how models interact with other objects/entities, their attributes, constraints, and any specialized behavior.
4. **Summarize**: Provide a concise overview for the developer/architect, categorizing models by their business roles and responsibilities.

# Output Format

The output should be structured as follows:

- **Key Models and Business Logic Grouping**
  - Model Name: [Derived from file path, e.g., Metric]
  - File Path: [Original file path]
  - Key Role: [A one-sentence summary of the model’s business purpose.]
  - Domain Logic:
    - **Associations & Ownership**: Business rules detailing this model’s relationships with other entities or ownership requirements.
    - **Validation & Constraints**: Rules that must be followed (e.g., required attributes, validations).
    - **Behavior, Actions & Scopes**: Any domain-specific functionality, scopes, or behaviors.
  - Other Notes (if applicable): [Any notable edge cases, external requirements, or special patterns.]

Use Markdown formatting for clear organization and readability.

# Examples

### Key Models and Business Logic Grouping

#### 1. Model Name: Metric
- **File Path**: `app/models/metric.rb`
- **Key Role**: Tracks system events tied to an organization, offering optional user activity records.
- **Domain Logic**:
  - **Associations & Ownership**:
    - Each `Metric` belongs to an `Organization`.
    - Optionally associates with a `User` via the `user_id` field to indicate the individual responsible for the event.
  - **Validation & Constraints**:
    - User privacy policy validation required when `user_id` is set or updated.
  - **Behavior, Actions & Scopes**:
    - Chronologically ordered by `created_at`.
    - Discriminator field `type` categorizes events (e.g., `FAILED_LOGINS = 'logins.failed'`).
    - Convenience scope retrieves failed login events (`type == 'logins.failed'`).
- **Other Notes**: The model serves as an auditing layer tied to organizational triggers.

#### 2. Model Name: Label
- **File Path**: `app/models/label.rb`
- **Key Role**: Represents a printable labeling system tied to specific entities like equipment, products, and consumables.
- **Domain Logic**:
  - **Associations & Ownership**:
    - Belongs to an `Organization`.
    - Optionally associated with a `User` and an `Approval Team`.
  - **Validation & Constraints**:
    - Must have attributes: `name`, `width`, and `height`. Dimensions (width and height) are in millimeters and used for print specifications.
    - Labels are typed (`equipment`, `product`, `consumable`) and utilize predefined templates.
    - Details fields (`detail` through `detail5`) must be sanitized to remove embedded JavaScript.
  - **Behavior, Actions & Scopes**:
    - Labels can be archived, denoted by an “[Archived]” prefix in their name.
    - Labels require approval (`approved = false`).
    - Printable labels are both approved and not flagged as `approved_clone`.
    - Editable scope excludes labels marked with `approved_clone = true`.
    - Label templates can use a barcode/QR placeholder UUID for dynamic placeholder replacement.
    - Database field support varies by type (e.g., equipment includes Serial #, Name; products include Product ID, Name plus custom fields).
    - Deleting a label nullifies related `change_notifications` references.
    - Searches are scoped by user permission (Pundit) and allow case-insensitive partial matches on `name`.
- **Other Notes**:
  - Historical versions of labels are tracked.
  - Custom logic for barcode/QR code generation includes strict sanitization and field mappings.

# Notes

- Focus on summarizing each model’s domain impacts and relationships with other objects.
- Group similar logic together for clarity, especially when models share overlapping constraints or rules.