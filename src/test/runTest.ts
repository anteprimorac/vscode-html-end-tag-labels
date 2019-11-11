import * as path from 'path';

import { runTests, downloadAndUnzipVSCode } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const vscodeExecutablePath = await downloadAndUnzipVSCode();

		console.log('vscodeExecutablePath');
		console.log(vscodeExecutablePath);

		// Download VS Code, unzip it and run the integration test
		await runTests({
			vscodeExecutablePath,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				'--disable-extensions',
			],
		});
	} catch (err) {
		console.error('Failed to run tests');
		console.error(err);
		process.exit(1);
	}
}

main();
