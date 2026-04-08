// Server component: injects the Atlaskit light theme CSS once into the document.
// The CSS string uses selectors keyed to data-color-mode and data-theme on <html>.
// Using require() to load the pre-built CJS theme CSS string from Atlaskit tokens
const lightThemeCss: string = require("@atlaskit/tokens/dist/cjs/artifacts/themes/atlassian-light.js").default;

export default function AtlaskitTheme() {
  return (
    <style
      id="atlaskit-light-theme"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: lightThemeCss }}
    />
  );
}
