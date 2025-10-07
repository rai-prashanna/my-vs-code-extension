Identify and summarize the key business domain models, categorizing domain logic across groups of models and their roles. Base the summary on the provided JSON objects, interpreting their structures and domain rules for precision and clarity.

# Steps

1. **Parse Input Data**: Analyze each JSON object to extract key attributes such as `file`, `type`, and `domain_rules`.
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


you are software architect. 
identify key important models and summarize with business domain logic spread out in group of models. 
provided list of json object. each json object as following structures: 

{"file": "app/models/metric.rb", "type": "model", "domain_rules": ["A Metric records a system event tied to an Organization—every metric must belong to an organization.", "A Metric can optionally record which User caused the event (whodunnit via user_id); when user_id is set or changed it must pass a user privacy policy validation.", "Metrics are ordered chronologically by created_at by default (implicit ordering column).", "The model uses a type field as an event/type discriminator (STI disabled), e.g. FAILED_LOGINS = 'logins.failed'.", "There is a convenience scope to retrieve failed login events (type == 'logins.failed')."]}

{"file": "app/models/label.rb", "type": "model", "domain_rules": ["A Label belongs to an Organization and can optionally be associated with a User and an Approval Team.", "Labels are typed: only equipment, product, or consumable; templates are chosen from a configured set.", "A Label must have a name, width, and height; width and height are treated as millimeter dimensions used for printing.", "Label records are versioned (history is tracked).", "Labels can be archived; archived labels are presented with an “[Archived]” prefix in their name.", "Labels require approval: a label is considered to require approval when its approved flag is false.", "Only labels that are approved and not marked as approved_clone are considered printable.", "Labels marked as editable exclude those with approved_clone = true (editable scope).", "All detail fields (detail through detail5) are sanitized before validation to remove embedded JavaScript.", "Label templates may contain a barcode/QR placeholder UUID that is replaced with an object’s id to generate per-object QR HTML; the resulting HTML is filtered prior to printing.", "Supported print/QR database fields vary by label type: equipment (Serial #, Name), product (Product ID, Name plus product custom formula fields), consumable (Model, Expiration plus consumable custom formula fields).", "When a Label is deleted, related change_notifications are not destroyed but disassociated (their foreign key is nulled).", "Label search is permission-scoped (Pundit) and matches name via case-insensitive partial match; defaults return a limited, policy-scoped set."]}
