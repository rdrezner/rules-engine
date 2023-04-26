import { Engine, RuleProperties } from "json-rules-engine";

async function start() {
  const engine = new Engine();

  engine.addOperator<string, string>("containsText", (factValue, givenValue) =>
    factValue?.includes(givenValue)
  );

  engine.addOperator<string, string>(
    "dateCompare",
    (factValue, givenValue) => Date.parse(factValue) === Date.parse(givenValue)
  );

  // rules configured in the rule builder
  const rule: RuleProperties = {
    conditions: {
      any: [
        {
          all: [
            {
              fact: "field-value-fact",
              operator: "containsText",
              value: "formstack.com",
              params: {
                fieldId: 11,
              },
            },
            {
              fact: "field-value-fact",
              operator: "dateCompare",
              value: "10 Nov 1984",
              params: {
                fieldId: 22,
              },
            },
          ],
        },
        {
          fact: "field-value-fact",
          operator: "equal",
          value: true,
          params: {
            fieldId: 33,
          },
        },
      ],
    },
    event: {
      type: "result",
      params: {
        then: "continue",
        else: "stop",
      },
    },
  };

  engine.addRule(rule);

  type Submission = {
    id: number;
    fields: { id: number; name: string; value: string | boolean }[];
  };

  // Fact functions have to be defined in BE
  engine.addFact("field-value-fact", (params, almanac) =>
    almanac
      .factValue<Submission["fields"]>("fields")
      .then(
        (fields) => fields.find((field) => field.id === params.fieldId)?.value
      )
  );

  // Simplified submission data from db
  const submission: Submission = {
    id: 1234,
    fields: [
      {
        id: 11,
        name: "Email",
        value: "rafal.drezner@formstack.com",
      },
      { id: 22, name: "Todays Date", value: "11/10/1984" },
      { id: 33, name: "Works in Marketing", value: false },
    ],
  };

  engine
    .on("success", (event, almanac) => {
      console.log(event.params.then);
    })
    .on("failure", (event) => {
      console.log(event.params.else);
    });

  await engine.run(submission);
}

start();
