import { ESLint } from "eslint";
import { expect, it } from "vitest";
import plugin from "./index";

// https://trpc.io/docs/client/react#the-trpc-react-query-integration
const testCode = `
import { trpc } from "../utils/trpc";

export default () => {
  let helloQuery = trpc.hello.useQuery({ name: 'Bob' });
  const goodbyeMutation = trpc.goodbye.useMutation();
  if (Math.floor(Math.random() * 2)) {
    helloQuery = trpc.hello.useQuery({ name: "Michael" });
  }
  return (
    <div>
      <p>{helloQuery.data?.greeting}</p>
      <button onClick={() => goodbyeMutation.mutate()}>Say Goodbye</button>
    </div>
  );
}
`;

it("eslint-plugin-react-hooks", async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: { "react-hooks": plugin },
      rules: {
        "react-hooks/rules-of-hooks": "error",
      },
    },
  });

  const [{ errorCount, messages }] = await eslint.lintText(testCode);

  expect(errorCount).toBe(1);

  expect(messages[0].message).toMatchInlineSnapshot(
    `"React Hook "trpc.hello.useQuery" is called conditionally. React Hooks must be called in the exact same order in every component render."`,
  );
});
