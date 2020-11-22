"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const title = (content) => chalk_1.dim(`${content}:`).padEnd(12, ' ');
const failed = (count) => chalk_1.red(`${count} failed,`);
const skipped = (count) => chalk_1.yellow(`${count} skipped,`);
const passed = (count) => chalk_1.green(`${count} passed,`);
const totaled = (count) => chalk_1.cyan(`${count} total`);
const msToDuration = (ms) => {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
class QuietReporter {
    constructor(globalConfig, options) {
        this.log = (message) => process.stdout.write(`${message}\n`);
        this.setTiming = (timingState) => this.setState({ timing: { ...this.state.timing, ...timingState } });
        this.addTestOutput = (result) => this.setState({ testOutput: [...this.state.testOutput, result] });
        this.addTestFailure = (failure) => this.setState({
            failureMessages: [...this.state.failureMessages, failure],
        });
        this.addTestSkip = (skip) => this.setState({ skippedTests: [...this.state.skippedTests, skip] });
        this.addFileSkip = (skip) => this.setState({ skippedFiles: [...this.state.skippedFiles, skip] });
        this.updateResults = (aggregatedResults) => {
            const { numFailedTestSuites, numPassedTestSuites, numPendingTestSuites, numTotalTestSuites, numFailedTests, numPassedTests, numPendingTests, numTotalTests, } = aggregatedResults;
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
        this.setState = (newState) => (this.state = {
            ...this.state,
            ...newState,
        });
        this.renderResults = () => {
            const COLS = 25;
            const length = this.state.testOutput.length;
            this.log('\nResults:');
            this.log(new Array(Math.ceil(length / COLS))
                .fill('')
                .map((_, i) => {
                const start = i * COLS;
                const end = start + COLS;
                return this.state.testOutput.slice(start, end).join('');
            })
                .join('\n'));
        };
        this.renderFailureMessages = () => {
            if (this.state.failureMessages.length) {
                this.log(chalk_1.bgRed.black('\n Failures: '));
                this.log(this.state.failureMessages.join('\n\n'));
            }
        };
        this.renderSkippedMessages = () => {
            if (this.state.skippedTests.length) {
                this.log(chalk_1.bgYellow.black('\n Skipped Tests: '));
                this.log(this.state.skippedTests.join('\n'));
            }
        };
        this.renderSuitesStatus = () => {
            const { suites: { fail, skip, pass, total }, } = this.state;
            this.log(`${title('\nTest Suites')} ${failed(fail)} ${skipped(skip)} ${passed(pass)} ${totaled(total)}`);
        };
        this.renderTestsStatus = () => {
            const { tests: { fail, skip, pass, total }, } = this.state;
            this.log(`${title('Tests')} ${failed(fail)} ${skipped(skip)} ${passed(pass)} ${totaled(total)}`);
        };
        this.renderTimeStatus = () => {
            const { timing: { elapsed, estimated }, } = this.state;
            const slowRun = elapsed > estimated;
            const runTime = slowRun
                ? chalk_1.green(`running ${msToDuration(elapsed)},`)
                : chalk_1.red(`running ${msToDuration(elapsed)},`);
            const estimatedRunTime = chalk_1.cyan(`estimated ${msToDuration(estimated * 1000)}`);
            this.log(`${title('Time')} ${runTime} ${estimatedRunTime}`);
        };
        this.renderStatus = () => {
            this.renderSuitesStatus();
            this.renderTestsStatus();
            this.renderTimeStatus();
        };
        this.render = (runComplete = false) => {
            console.clear();
            this.renderResults();
            if (runComplete) {
                this.renderSkippedMessages();
                this.renderFailureMessages();
            }
            this.renderStatus();
        };
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
    onRunStart(aggregatedResults, options) {
        this.setTiming({
            startTime: aggregatedResults.startTime,
            estimated: options.estimatedTime,
        });
        this.updateResults(aggregatedResults);
        this.render();
    }
    onTestResult(test, testResult, aggregatedResults) {
        this.setTiming({ elapsed: Date.now() - this.state.timing.startTime });
        this.updateResults(aggregatedResults);
        testResult.testResults.map((result) => {
            switch (result.status) {
                case 'passed':
                    return this.addTestOutput(chalk_1.bgGreen.black(' ✓ '));
                case 'failed':
                    return this.addTestOutput(chalk_1.bgRed.black(' ✕ '));
                default:
                    return this.addTestOutput(chalk_1.bgYellow.black(' ○ '));
            }
        });
        this.render();
    }
    onRunComplete(test, runResults) {
        if (runResults) {
            this.updateResults(runResults);
            runResults.testResults.map(({ failureMessage }) => {
                if (failureMessage) {
                    this.addTestFailure(failureMessage.replace(/● /, '').replace(' › ', ' '));
                }
            });
        }
        runResults?.testResults.map(({ testResults }) => testResults.map(({ status, fullName }) => status === 'pending' && this.addTestSkip(fullName)));
        this.render(true);
    }
    getLastError() {
        return this.error;
    }
    _setError(error) {
        this.error = error;
    }
}
exports.default = QuietReporter;
