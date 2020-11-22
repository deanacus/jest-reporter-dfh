import type { AggregatedResult, Config, Context, Reporter, ReporterOnStartOptions, Test, TestResult } from '@jest/reporters';
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
export default class QuietReporter implements Reporter {
    private error?;
    private globalConfig;
    private options?;
    private state;
    constructor(globalConfig: Config.GlobalConfig, options?: any);
    log: (message: string) => boolean;
    setTiming: (timingState: Partial<Timing>) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    addTestOutput: (result: string) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    addTestFailure: (failure: string) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    addTestSkip: (skip: string) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    addFileSkip: (skip: string) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    updateResults: (aggregatedResults: AggregatedResult) => void;
    setState: (newState: Record<string, unknown>) => {
        timing: Timing;
        tests: ResultSet;
        suites: ResultSet;
        failureMessages: string[];
        testOutput: string[];
        skippedTests: string[];
        skippedFiles: string[];
    };
    renderResults: () => void;
    renderFailureMessages: () => void;
    renderSkippedMessages: () => void;
    renderSuitesStatus: () => void;
    renderTestsStatus: () => void;
    renderTimeStatus: () => void;
    renderStatus: () => void;
    render: (runComplete?: boolean) => void;
    onRunStart(aggregatedResults: AggregatedResult, options: ReporterOnStartOptions): void;
    onTestResult(test: Test, testResult: TestResult, aggregatedResults: AggregatedResult): void;
    onRunComplete(test?: Set<Context>, runResults?: AggregatedResult): void;
    getLastError(): Error | undefined;
    protected _setError(error: Error): void;
}
export {};
