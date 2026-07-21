locals {
  short_project_id = substr(replace(var.project_id, "-", ""), 0, 20)
  rule_name        = "dg-${local.short_project_id}-${var.environment_name}-ecs-events"
}

resource "aws_cloudwatch_log_group" "ecs_events" {
  count = var.enable_rule ? 1 : 0

  name              = "/deployguard/${var.project_id}/${var.environment_name}/ecs-events"
  retention_in_days = 14

  tags = var.tags
}

resource "aws_cloudwatch_log_resource_policy" "eventbridge" {
  count = var.enable_rule ? 1 : 0

  policy_name = "${local.rule_name}-logs"
  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = ["events.amazonaws.com", "delivery.logs.amazonaws.com"]
        }
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.ecs_events[0].arn}:*"
      }
    ]
  })
}

resource "aws_cloudwatch_event_rule" "ecs_events" {
  count = var.enable_rule ? 1 : 0

  name        = local.rule_name
  description = "DeployGuard ECS task state change and interruption foundation"

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change", "ECS Service Action"]
    detail = {
      clusterArn = var.ecs_cluster_arn == null ? [] : [var.ecs_cluster_arn]
    }
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "log_group" {
  count = var.enable_rule ? 1 : 0

  rule = aws_cloudwatch_event_rule.ecs_events[0].name
  arn  = aws_cloudwatch_log_group.ecs_events[0].arn

  depends_on = [aws_cloudwatch_log_resource_policy.eventbridge]
}
