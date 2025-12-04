import { runTests } from './index';
import { IO } from '../evaluator/object/environment';

const mockIO: IO = {
  input: () => '',
  output: () => {},
};

describe('runTests', () => {
  test('runs all tests without @slow by default', () => {
    const source = `
      part_one: { 1 }

      test: {
        part_one: 1
      }

      @slow
      test: {
        part_one: 1
      }
    `;

    const results = runTests(source, mockIO);

    // Should only run the non-slow test
    expect(results).toHaveLength(1);
    expect(results[0].slow).toBe(false);
  });

  test('runs all tests including @slow when includeSlow is true', () => {
    const source = `
      part_one: { 1 }

      test: {
        part_one: 1
      }

      @slow
      test: {
        part_one: 1
      }
    `;

    const results = runTests(source, mockIO, true);

    // Should run both tests
    expect(results).toHaveLength(2);
    expect(results[0].slow).toBe(false);
    expect(results[1].slow).toBe(true);
  });

  test('marks slow tests correctly in results', () => {
    const source = `
      part_one: { 1 }

      @slow
      test: {
        part_one: 1
      }
    `;

    const results = runTests(source, mockIO, true);

    expect(results).toHaveLength(1);
    expect(results[0].slow).toBe(true);
    expect(results[0].partOne?.hasPassed).toBe(true);
  });

  test('handles multiple @slow tests', () => {
    const source = `
      part_one: { 1 }

      test: {
        part_one: 1
      }

      @slow
      test: {
        part_one: 1
      }

      @slow
      test: {
        part_one: 1
      }
    `;

    // Without includeSlow
    const resultsWithoutSlow = runTests(source, mockIO, false);
    expect(resultsWithoutSlow).toHaveLength(1);

    // With includeSlow
    const resultsWithSlow = runTests(source, mockIO, true);
    expect(resultsWithSlow).toHaveLength(3);
    expect(resultsWithSlow.filter(r => r.slow)).toHaveLength(2);
  });
});
