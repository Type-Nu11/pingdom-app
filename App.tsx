// Production has one application-composition root. Active V1 screens that do not yet have
// route parity are injected only inside that boundary; there is no runtime V1-app fallback.
export { default } from './src/application/ProductionApp';
