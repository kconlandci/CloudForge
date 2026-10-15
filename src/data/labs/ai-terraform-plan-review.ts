import type { LabManifest } from "../../types/manifest";

export const aiTerraformPlanReviewLab: LabManifest = {
  schemaVersion: "1.1",
  id: "ai-terraform-plan-review",
  version: 1,
  title: "Review This AI-Generated Terraform Plan Before Apply",
  tier: "advanced",
  track: "cloud-operations",
  difficulty: "challenging",
  accessLevel: "premium",
  tags: ["terraform", "iac", "ai-review", "code-review", "devops", "security", "finops"],
  description:
    "An AI coding assistant generated Terraform for three production changes and summarized each plan as safe to apply. Read the actual plan output — not the summary — catch the security exposure, the hallucinated resources, and the database replacement, and decide what may ship.",
  estimatedMinutes: 15,
  learningObjectives: [
    "Diff an AI assistant's change summary against the actual terraform plan output before approving",
    "Recognize force-replacement (-/+) actions in a plan and assess their blast radius",
    "Validate resource types, sizes, and argument names against provider documentation",
    "Catch security regressions such as public access and open administrative ports in generated IaC",
    "Read the cost delta of a plan, including quiet additions like extra NAT gateways",
  ],
  sortOrder: 615,
  status: "published",
  prerequisites: [],
  rendererType: "investigate-decide",
  scenarios: [
    {
      type: "investigate-decide",
      id: "ai-tf-review-s1",
      title: "The Summary Says 'Best Practices' — The Plan Disagrees",
      objective:
        "Your team asked an AI coding assistant to generate Terraform for a new bastion host and a customer-uploads S3 bucket. It returned a plan and a summary claiming security best practices were applied. The production apply window opens in 30 minutes. Review the evidence and decide whether this plan may be applied.",
      investigationData: [
        {
          id: "ai-summary",
          label: "AI Assistant — Change Summary",
          content: "Changes requested: new bastion host security group and a customer-uploads S3 bucket. Security applied: SSH restricted to the corporate network; bucket private by default; default encryption enabled. The assistant's verdict: 'Configuration follows AWS security best practices. Safe to apply.'",
        },
        {
          id: "plan-security-group",
          label: "Terraform Plan — aws_security_group.bastion",
          content: "Plan excerpt: ingress tcp/22 with cidr_blocks = 0.0.0.0/0 (rule description: SSH access) | ingress tcp/443 with cidr_blocks = 10.0.0.0/16 | egress: all protocols to 0.0.0.0/0. The security group will be created in the production VPC.",
        },
        {
          id: "plan-bucket",
          label: "Terraform Plan — S3 Bucket and Public Access Block",
          content: "Plan excerpt: aws_s3_bucket.customer_uploads will be created | aws_s3_bucket_public_access_block.uploads sets block_public_acls = false, block_public_policy = false, ignore_public_acls = false, restrict_public_buckets = false | aws_s3_bucket_policy.uploads grants s3:GetObject to Principal * on every object in the bucket.",
        },
        {
          id: "team-standards",
          label: "Team Wiki — Standards and Bucket Contents",
          content: "Corporate egress IP: 203.0.113.10/32. Standard: SSH and other administrative access must be restricted to the corporate egress range or the VPN subnet 10.8.0.0/16. The customer-uploads bucket stores customer contracts and ID documents (PII); team standard requires all four S3 Block Public Access settings ON for any bucket holding PII.",
        },
      ],
      actions: [
        { id: "approve-apply", label: "Approve the plan and apply it in the window — the summary confirms best practices", color: "red" },
        { id: "apply-then-fix", label: "Apply now to hit the window, and raise a follow-up ticket to tighten the settings this week", color: "yellow" },
        { id: "send-back-security-fixes", label: "Send it back: restrict SSH to 203.0.113.10/32, turn on all four Block Public Access settings, and remove the public bucket policy — then re-review the corrected plan", color: "green" },
        { id: "reject-manual-rewrite", label: "Reject AI-generated Terraform for this change and write it by hand instead", color: "blue" },
      ],
      correctActionId: "send-back-security-fixes",
      rationales: [
        { id: "r-ai-tf-s1-correct", text: "The plan contradicts the summary on the two controls that matter most. SSH is open to the entire internet instead of the corporate egress range, and the bucket holding customer PII has every Block Public Access setting off plus a public read policy. These are small, precise fixes — a CIDR change, four settings on, one policy removed — and the corrected plan can be re-reviewed in minutes. Verification means diffing every claim in the summary against the plan output, line by line, because the plan is what actually ships." },
        { id: "r-ai-tf-s1-approve", text: "Approving on the strength of the summary means approving a document you did not verify. The summary is the AI's description of its own work — it is not evidence. The plan output, which is the evidence, shows the opposite of both security claims." },
        { id: "r-ai-tf-s1-apply-then-fix", text: "'Apply now, fix this week' leaves a PII bucket publicly readable and a production bastion open to automated SSH attacks for the entire gap. Internet-facing exposure is measured in minutes, not sprint tickets. Security regressions in a plan are fixed before apply, never after." },
        { id: "r-ai-tf-s1-manual", text: "Writing it by hand discards the parts the assistant got right (the 443 rule scoped to the VPC, the encryption default) and does not scale — the team will review AI-generated plans every week. The professional skill is verification and correction, not refusal to use the tool." },
      ],
      correctRationaleId: "r-ai-tf-s1-correct",
      feedback: {
        perfect: "Correct. You read the plan instead of the summary — and the two disagreed on SSH scope and bucket privacy. The habit to keep: an AI's summary is a claim, the plan output is the fact. Diff them every time, especially where the artifact touches the internet or holds PII.",
        partial: "You spotted the problem but chose to ship it and fix it later. For internet-facing exposure on a bucket containing customer PII, 'later' is the incident. Correct the plan first — the fixes are small and the re-review is fast.",
        wrong: "The summary claimed both controls were in place; the plan output showed the opposite on both. Never approve generated infrastructure from its summary. Open the plan, find the security group rules and the public access settings, and compare them against the team standard before deciding.",
      },
    },
    {
      type: "investigate-decide",
      id: "ai-tf-review-s2",
      title: "Claimed Validated — It Couldn't Have Run",
      objective:
        "An AI coding assistant generated Terraform to add a reporting worker instance and a small RDS reporting replica. Its summary states the configuration was validated with terraform plan. Your CI job ran the real plan on the same code. Compare the assistant's claim with the evidence and decide how this change proceeds.",
      investigationData: [
        {
          id: "ai-summary",
          label: "AI Assistant — Change Summary",
          content: "Changes requested: a reporting worker EC2 instance and a small RDS reporting replica. The assistant's verdict: 'Validated — terraform plan executed successfully with no errors. Estimated added cost: $96/month. Safe to apply.'",
        },
        {
          id: "plan-code",
          label: "Terraform Configuration — As Submitted",
          content: "aws_instance.reporting_worker: instance_type = t3.4xlarge, subnet = private reporting subnet | aws_db_instance.reporting_replica: engine = postgres, instance_class = db.t3.medium, storage_gb = 100.",
        },
        {
          id: "ci-plan-output",
          label: "CI Job — Actual terraform plan Output",
          content: "Error: invalid value for instance_type — the T3 family runs t3.micro, t3.small, t3.medium, t3.large, t3.xlarge, t3.2xlarge; t3.4xlarge does not exist. | Error: An argument named storage_gb is not expected here (aws_db_instance) — the provider suggests allocated_storage. | Result: plan failed with 2 errors. No apply is possible from this code.",
        },
        {
          id: "provider-docs",
          label: "AWS Provider Registry — Argument Reference",
          content: "aws_db_instance supports allocated_storage (the amount of storage, in GB). No argument named storage_gb exists in any released provider version. EC2 T3 sizes top out at t3.2xlarge. Both values in the submitted configuration can be checked against the provider registry in under a minute.",
        },
      ],
      actions: [
        { id: "approve-anyway", label: "Approve — the assistant already validated it, CI must be misconfigured", color: "red" },
        { id: "fix-inline-no-replan", label: "Fix the two values directly in the change yourself and approve without re-running plan", color: "yellow" },
        { id: "send-back-require-real-plan", label: "Send it back: correct the instance type to an existing size and storage_gb to allocated_storage, and require the actual terraform plan output attached to the change before approval", color: "green" },
        { id: "escalate-ban-ai", label: "Escalate and propose banning AI-generated Terraform for the team", color: "blue" },
      ],
      correctActionId: "send-back-require-real-plan",
      rationales: [
        { id: "r-ai-tf-s2-correct", text: "Two independent hallucinations — a nonexistent instance size and an argument that has never existed — prove the 'validated' claim was fabricated: this code was never run through terraform plan, because plan fails on it immediately. The fixes are trivial (t3.2xlarge or another real size; allocated_storage), but approval requires evidence, not another claim: the real plan output attached to the change. The durable habit is to verify names — resource types, sizes, arguments — against the provider registry, because AI tools state invented values with exactly the same confidence as real ones." },
        { id: "r-ai-tf-s2-approve", text: "CI is showing you the ground truth: the plan fails with two errors and cannot apply at all. Trusting the assistant's self-report over the toolchain's output inverts the entire review process." },
        { id: "r-ai-tf-s2-inline", text: "Fixing the values yourself feels efficient, but approving without a re-run repeats the original failure in miniature — an unverified change, this time with your name on it. Any edit to infrastructure code invalidates previous validation; the plan must run again on the final code." },
        { id: "r-ai-tf-s2-ban", text: "A ban punishes the tool for a process failure. The code was never the deepest problem — the missing verification step was. Generated Terraform with a mandatory plan-output check is faster than hand-written Terraform and just as safe; unverified code from any source, human or AI, is the actual risk." },
      ],
      correctRationaleId: "r-ai-tf-s2-correct",
      feedback: {
        perfect: "Correct. A claimed validation is not evidence — the real plan output is. You caught that the code could never have been validated, required the small fixes, and required proof before approval. Spot-checking types and arguments against the provider registry takes a minute and catches exactly this failure class.",
        partial: "You found the errors, but approving your own inline fix without a fresh plan run skips the very step whose absence caused this. Edits invalidate validation — always re-run and attach the plan output on the final version of the code.",
        wrong: "The assistant's 'validated' claim was impossible: terraform plan fails on this code in seconds, on a nonexistent instance size and an invented argument. When a generator claims it ran a check, ask for the artifact — the actual output — and verify identifiers against the provider documentation yourself.",
      },
    },
    {
      type: "investigate-decide",
      id: "ai-tf-review-s3",
      title: "A 'Minor In-Place Update' That Replaces the Production Database",
      objective:
        "An AI coding assistant prepared a change to the production RDS instance: enable storage encryption, plus what it calls a minor networking tidy-up. Its summary promises no downtime and no cost impact. The plan output and a cost estimate are below. Decide whether this change may be applied in tonight's window.",
      investigationData: [
        {
          id: "ai-summary",
          label: "AI Assistant — Change Summary",
          content: "Change requested: enable storage encryption on the production database; minor networking tidy-up. The assistant's verdict: 'Minor in-place update. No downtime. No cost impact. Safe to apply in any window.'",
        },
        {
          id: "plan-output",
          label: "Terraform Plan — Summary and Resource Actions",
          content: "Plan: 5 to add, 1 to change, 1 to destroy. | aws_db_instance.primary must be replaced: -/+ destroy and then create replacement, because storage_encrypted changes from false to true, which forces a new resource. | Also added: aws_nat_gateway.dev_a and aws_nat_gateway.dev_b — two new NAT gateways for dev subnets. The environment currently runs one NAT gateway in total.",
        },
        {
          id: "cost-estimate",
          label: "Cost Estimate — Monthly Delta (Infracost)",
          content: "NAT gateways: 1 to 3 (+$65/month in hourly charges alone, before data processing fees). | The plan contains no snapshot, replication, or migration resources for the database replacement: applied as written, it would destroy the unencrypted production instance and create a new, empty encrypted one.",
        },
        {
          id: "db-context",
          label: "Change Policy — Production Data Resources",
          content: "aws_db_instance.primary is the production orders database (4.2 TB). Team change policy: any plan that destroys a production data resource requires a documented migration path (snapshot restore or replication cutover) and a scheduled maintenance window. Storage encryption on this database is a standing compliance requirement.",
        },
      ],
      actions: [
        { id: "approve-tonight", label: "Approve for tonight's window — the assistant confirms it is in-place and minor", color: "red" },
        { id: "approve-in-window", label: "Approve the plan as written, but only inside a scheduled maintenance window", color: "yellow" },
        { id: "send-back-migration-plan", label: "Send it back: encryption requires a migration path (encrypted snapshot restore or replication cutover), the two dev NAT gateways come out, and the change is resubmitted with a real plan and cost diff", color: "green" },
        { id: "cancel-encryption", label: "Cancel the change entirely and leave the production database unencrypted", color: "blue" },
      ],
      correctActionId: "send-back-migration-plan",
      rationales: [
        { id: "r-ai-tf-s3-correct", text: "The loudest line in any plan is 'must be replaced.' Enabling storage_encrypted on an existing RDS instance cannot be done in place — Terraform must destroy and recreate it, and this plan contains no migration path, so applying it deletes the production orders database and creates an empty one. Encryption is still worth doing, the right way: restore from an encrypted snapshot or cut over with replication, inside a window, per policy. The 'tidy-up' also quietly triples the NAT gateway count for dev subnets — a permanent $65+/month for nothing. Before approving any plan, search it for 'must be replaced' and '-/+', then read the cost diff: the summary's adjectives are not data." },
        { id: "r-ai-tf-s3-tonight", text: "The summary's three claims — in-place, no downtime, no cost impact — are each contradicted by the plan: a forced replacement, a database destroyed and recreated empty, and two added NAT gateways. Approving tonight on the assistant's wording would cause the outage it promised to avoid." },
        { id: "r-ai-tf-s3-window", text: "A maintenance window fixes timing, not method. Inside a window, this plan still destroys the production database with no migration path — you would simply be losing the data at a scheduled hour. Windows are a requirement for the corrected change, not a cure for this one." },
        { id: "r-ai-tf-s3-cancel", text: "Cancelling protects the database today but abandons a standing compliance requirement. The goal — an encrypted production database — is correct and achievable; what failed is the proposed method. Send it back for a migration-based plan rather than dropping the requirement." },
      ],
      correctRationaleId: "r-ai-tf-s3-correct",
      feedback: {
        perfect: "Correct on both counts: you caught the forced replacement hiding behind the words 'minor in-place update,' and the permanent NAT cost hiding inside a 'tidy-up.' The habits: search every plan for 'must be replaced' before anything else, and never let a summary substitute for the plan's own action counts and cost diff.",
        partial: "You slowed the change down, but a maintenance window does not repair a plan with no migration path — it would still destroy the production database, just on schedule. The fix is a different method (snapshot restore or replication cutover), plus removing the unnecessary NAT gateways, then the window.",
        wrong: "The summary's adjectives ('minor', 'in-place', 'no cost impact') contradicted the plan's verbs ('destroy', 'create replacement', two new NAT gateways). Applied as written, this change deletes the production orders database. Read the plan's action lines — especially anything marked 'must be replaced' — before you read anyone's summary of them.",
      },
    },
  ],
  hints: [
    "Read the plan, not the summary. The summary is the AI's opinion of its own work; the plan output is what will actually happen to your infrastructure.",
    "Before approving any plan, search it for 'must be replaced' and '-/+' — a destroy-and-recreate on a data resource is a migration project, not an edit.",
    "Verify every resource type, size, and argument name against the provider registry. AI tools present invented values with the same confidence as real ones, and a claimed validation is not evidence — ask for the actual plan output.",
  ],
  scoring: {
    maxScore: 100,
    hintPenalty: 5,
    penalties: { perfect: 0, partial: 10, wrong: 20 },
    passingThresholds: { pass: 80, partial: 50 },
  },
  careerInsight:
    "Reviewing AI-generated infrastructure code is becoming a core platform-engineering skill: the generators are fast and usually plausible, and the failures are confident ones — a public bucket described as private, an invented instance type described as validated, a database replacement described as a minor update. Engineers who build the habit of verifying plan output, provider documentation, and cost diffs before approving are the ones trusted with production apply rights in AI-assisted teams.",
  toolRelevance: ["Terraform", "AWS Provider Registry", "Infracost", "GitHub Copilot", "Amazon Q Developer"],
  createdAt: "2026-10-15",
  updatedAt: "2026-10-15",
};
