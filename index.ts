import { Engine, RuleProperties } from "json-rules-engine";

async function start() {
  const engine = new Engine();

  engine.addOperator<string, string>("containsText", (factValue, jsonValue) => {
    if (!factValue.length) return false;
    return factValue.includes(jsonValue);
  });

  // rules configured in the rule builder
  const rule: RuleProperties = {
    conditions: {
      all: [
        {
          fact: "field-fact",
          operator: "containsText",
          value: "formstack.com",
          params: {
            fieldId: 1234,
          },
        },
        {
          fact: "field-fact",
          operator: "equal",
          value: "other",
          params: {
            fieldId: 12345,
          },
        },
      ],
    },
    event: {
      type: "message",
      params: {
        data: "match",
      },
    },
  };

  engine.addRule(rule);

  type Submission = {
    id: number;
    fields: { id: number; value: string }[];
  };

  // Fact functions have to be defined in BE
  engine.addFact("field-fact", (params, almanac) =>
    almanac
      .factValue<Submission["fields"]>("fields")
      .then(
        (fields) => fields.find((field) => field.id === params.fieldId)?.value
      )
  );

  // Simplified submission data
  const submission: Submission = {
    id: 1234,
    fields: [
      {
        id: 1234,
        value: "rafal.drezner@formstack.com",
      },
      { id: 12345, value: "other" },
    ],
  };

  const { results } = await engine.run(submission);

  console.log(results[0]?.result ?? "false");
}

start();
