import { describe, it } from "vitest";
import { getExistingIgnores } from "./utils";
import { expect } from "vitest";

describe("getExistingIgnores util", () => {
  it("works with simple ignores", () => {
    expect(getExistingIgnores(`{{! template-lint-disable no-curly-component-invocation }}`)).to.toMatchInlineSnapshot(`
      [
        "no-curly-component-invocation",
      ]
    `)

    expect(getExistingIgnores(`{{!template-lint-disable no-log}}`)).toMatchInlineSnapshot(`
      [
        "no-log",
      ]
    `)
  })

  it('works with -- comments', () => {
    expect(getExistingIgnores(`{{!-- template-lint-disable no-curly-component-invocation no-action no-implicit-this no-invalid-interactive no-triple-curlies --}}`)).toMatchInlineSnapshot(`
      [
        "no-action",
        "no-curly-component-invocation",
        "no-implicit-this",
        "no-invalid-interactive",
        "no-triple-curlies",
      ]
    `)

    expect(getExistingIgnores(`{{!--template-lint-disable no-log--}}`)).toMatchInlineSnapshot(`
      [
        "no-log",
      ]
    `)
  })

  it(`sorts ignores and removes duplicates`, () => {
    expect(getExistingIgnores(`{{!-- template-lint-disable no-implicit-this no-action no-implicit-this no-curly-component-invocation no-action no-invalid-interactive no-triple-curlies --}}`)).toMatchInlineSnapshot(`
      [
        "no-action",
        "no-curly-component-invocation",
        "no-implicit-this",
        "no-invalid-interactive",
        "no-triple-curlies",
      ]
    `)
  })

  it(`doesnt give you anything if you pass a template with no ignores`, () => {
    expect(getExistingIgnores(`{{log "thingy"}}`)).toMatchInlineSnapshot(`[]`)

    expect(getExistingIgnores(``)).toMatchInlineSnapshot(`[]`)
  })
})
