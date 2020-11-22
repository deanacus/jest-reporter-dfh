import type {
  AggregatedResult,
  Config,
  Context,
  Reporter,
  ReporterOnStartOptions,
  Test,
  TestResult,
} from '@jest/reporters';

import { red, green, cyan, yellow, bgRed, bgYellow, bgGreen, dim } from 'chalk';

interface Timing {
  elapsed: number;
  estimated: number;
  startTime: number;
}

interface ResultSet {
  fail: number;
  skip: number;
  pass: number;
  total: number;
}

interface State {
  timing: Timing;
  tests: ResultSet;
  suites: ResultSet;
  failureMessages: string[];
  testOutput: string[];
  skippedTests: string[];
  skippedFiles: string[];
}

const title = (content: string) => dim(`${content}:`).padEnd(12, ' ');
const failed = (count: number) => red(`${count} failed,`);
const skipped = (count: number) => yellow(`${count} skipped,`);
const passed = (count: number) => green(`${count} passed,`);
const totaled = (count: number) => cyan(`${count} total`);

const msToDuration = (ms: number): string => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export default class QuietReporter implements Reporter {
  private error?: Error;
  private globalConfig: Config.GlobalConfig;
  private options?: any;
  private state: State;

  constructor(globalConfig: Config.GlobalConfig, options?: any) {
    this.globalConfig = globalConfig;
    this.options = options;

    this.state = {
      timing: {
        elapsed: 0,
        estimated: 0,
        startTime: Date.now(),
      },
      tests: {
        fail: 0,
        skip: 0,
        pass: 0,
        total: 0,
      },
      suites: {
        fail: 0,
        skip: 0,
        pass: 0,
        total: 0,
      },
      failureMessages: [],
      testOutput: [],
      skippedTests: [],
      skippedFiles: [],
    };
  }

  log = (message: string): boolean => process.stdout.write(`${message}\n`);

  setTiming = (timingState: Partial<Timing>) =>
    this.setState({ timing: { ...this.state.timing, ...timingState } });

  addTestOutput = (result: string) =>
    this.setState({ testOutput: [...this.state.testOutput, result] });

  addTestFailure = (failure: string) =>
    this.setState({
      failureMessages: [...this.state.failureMessages, failure],
    });

  addTestSkip = (skip: string) =>
    this.setState({ skippedTests: [...this.state.skippedTests, skip] });

  addFileSkip = (skip: string) =>
    this.setState({ skippedFiles: [...this.state.skippedFiles, skip] });

  updateResults = (aggregatedResults: AggregatedResult) => {
    const {
      numFailedTestSuites,
      numPassedTestSuites,
      numPendingTestSuites,
      numTotalTestSuites,
      numFailedTests,
      numPassedTests,
      numPendingTests,
      numTotalTests,
    } = aggregatedResults;

    const tests = {
      fail: numFailedTests,
      pass: numPassedTests,
      skip: numPendingTests,
      total: numTotalTests,
    };

    const suites = {
      fail: numFailedTestSuites,
      pass: numPassedTestSuites,
      skip: numPendingTestSuites,
      total: numTotalTestSuites,
    };

    this.setState({ tests, suites });
  };

  setState = (newState: Record<string, unknown>) =>
    (this.state = {
      ...this.state,
      ...newState,
    });

  renderResults = () => {
    const COLS = 25;
    const length = this.state.testOutput.length;
    this.log('\nResults:');
    this.log(
      new Array(Math.ceil(length / COLS))
        .fill('')
        .map((_, i) => {
          const start = i * COLS;
          const end = start + COLS;
          return this.state.testOutput.slice(start, end).join('');
        })
        .join('\n'),
    );
  };

  renderFailureMessages = () => {
    if (this.state.failureMessages.length) {
      this.log(bgRed.black('\n Failures: '));
      this.log(this.state.failureMessages.join('\n\n'));
    }
  };

  renderSkippedMessages = () => {
    if (this.state.skippedTests.length) {
      this.log(bgYellow.black('\n Skipped Tests: '));
      this.log(this.state.skippedTests.join('\n'));
    }
  };

  renderSuitesStatus = () => {
    const {
      suites: { fail, skip, pass, total },
    } = this.state;
    this.log(
      `${title('\nTest Suites')} ${failed(fail)} ${skipped(skip)} ${passed(pass)} ${totaled(
        total,
      )}`,
    );
  };

  renderTestsStatus = () => {
    const {
      tests: { fail, skip, pass, total },
    } = this.state;
    this.log(
      `${title('Tests')} ${failed(fail)} ${skipped(skip)} ${passed(pass)} ${totaled(total)}`,
    );
  };

  renderTimeStatus = () => {
    const {
      timing: { elapsed, estimated },
    } = this.state;
    const slowRun = elapsed > estimated;
    const runTime = slowRun
      ? green(`running ${msToDuration(elapsed)},`)
      : red(`running ${msToDuration(elapsed)},`);
    const estimatedRunTime = cyan(`estimated ${msToDuration(estimated * 1000)}`);
    this.log(`${title('Time')} ${runTime} ${estimatedRunTime}`);
  };

  renderStatus = () => {
    this.renderSuitesStatus();
    this.renderTestsStatus();
    this.renderTimeStatus();
  };

  render = (runComplete = false) => {
    console.clear();
    this.renderResults();
    if (runComplete) {
      this.renderSkippedMessages();
      this.renderFailureMessages();
    }
    this.renderStatus();
  };

  onRunStart(aggregatedResults: AggregatedResult, options: ReporterOnStartOptions): void {
    this.setTiming({
      startTime: aggregatedResults.startTime,
      estimated: options.estimatedTime,
    });
    this.updateResults(aggregatedResults);
    this.render();
  }

  onTestResult(test: Test, testResult: TestResult, aggregatedResults: AggregatedResult): void {
    this.setTiming({ elapsed: Date.now() - this.state.timing.startTime });
    this.updateResults(aggregatedResults);

    testResult.testResults.map((result) => {
      switch (result.status) {
        case 'passed':
          return this.addTestOutput(bgGreen.black(' ✓ '));
        case 'failed':
          return this.addTestOutput(bgRed.black(' ✕ '));
        default:
          return this.addTestOutput(bgYellow.black(' ○ '));
      }
    });

    this.render();
  }

  onRunComplete(test?: Set<Context>, runResults?: AggregatedResult): void {
    if (runResults) {
      this.updateResults(runResults);

      runResults.testResults.map(({ failureMessage }) => {
        if (failureMessage) {
          this.addTestFailure(failureMessage.replace(/● /, '').replace(' › ', ' '));
        }
      });
    }
    runResults?.testResults.map(({ testResults }) =>
      testResults.map(({ status, fullName }) => status === 'pending' && this.addTestSkip(fullName)),
    );
    this.render(true);
  }

  getLastError(): Error | undefined {
    return this.error;
  }

  protected _setError(error: Error): void {
    this.error = error;
  }
}
