export function mountComponents() {
  let components = [];
  const demos = require.context('./demos', true, /(?<!\/)[a-z-]+\.([jt]sx)?$/)
  demos.keys().forEach((filename,index) => {
    const componentConfig = demos(filename)
    const name = filename.replace(/^\.\//, '').replace(/.\w+$/, '');
    const component = componentConfig.default || componentConfig;

    let htmlInfo = {};
    if (typeof component === 'string') {
      // htmlInfo = parserHtml(component);
    } else {
      htmlInfo = component.meta || {};
    }

    components.push({
      name,
      component,
      ...htmlInfo,
      id: index
    })
  })
  return components
}
export const COMPONENTS = mountComponents();
