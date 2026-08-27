// Retained as a development/QA alias. It intentionally resolves to the same single root as
// production so auth hydration can never exchange the entire V1 and V2 applications.
export { default } from './src/application/ProductionApp';
