import path from 'pathe'
import { findUp, findUpMultiple } from 'find-up'
import { readInitialOptions } from 'jest-config'

export interface TestFrameworkInfo {
  framework: 'jest' | 'vitest'
  configPath: string
}

export async function detectTestFramework(
  testFilePath: string,
  frameworkSetting: 'autodetect' | 'vitest' | 'jest',
): Promise<TestFrameworkInfo> {
  // auto detect test config files

  let vitestFile = (frameworkSetting === 'autodetect' || frameworkSetting === 'vitest')
    ? await findUp(VITEST_CONFIG_FILES, { cwd: testFilePath })
    : undefined
  vitestFile &&= path.resolve(vitestFile)

  const jestFile = (frameworkSetting === 'autodetect' || frameworkSetting === 'jest')
    ? await (async () => {
      const cwd = process.cwd()
      try {
        const pkgPaths = await findUpMultiple('package.json', { cwd: testFilePath })
        if (!pkgPaths.length) {
          throw new Error(`Could not find related package.json for test file ${testFilePath}`)
        }

        for (const pkgPath of pkgPaths) {
          // Change cwd to package root so Jest can find the right config file
          process.chdir(path.dirname(pkgPath))

          const cfg = await (async () => {
            try {
              // Call Jest's built-in function to read the jest config file for the current working dir
              return await readInitialOptions(undefined, {})
            }
            catch (e) {
              // readInitialOptions throws an error if it can't find jest.config.x or package.json; ignore this error
              if (e instanceof Error && e.message?.includes?.('Could not find a config file')) {
                return undefined
              }
              throw e
            }
          })()

          if (!cfg) {
            // no jest config found in package.json; try going up to the next parent package
            continue
          }

          if (
            cfg.configPath && path.resolve(cfg.configPath).endsWith('/package.json')

            // check for { rootDir: '/...' } ; the empty config placeholder
            && Object.keys(cfg.config).length <= 1
          ) {
            // no jest config found in package.json; try going up to the next parent package
            continue
          }
          // Return the config for the first valid jest config
          return cfg.configPath && path.resolve(cfg.configPath)
        }
      }
      finally {
        process.chdir(cwd)
      }
    })()
    : undefined

  const configPath = vitestFile ?? jestFile

  // throw error if no config file found
  if (!configPath) {
    switch (frameworkSetting) {
      case 'autodetect':
        throw new Error('No Vitest or Jest config found')
      case 'vitest':
        throw new Error('No Vitest config found')
      case 'jest':
        throw new Error('No Jest config found')
    }
  }

  // choose the config file with the deepest path

  const vitestCfgPathLength = vitestFile?.split(path.sep).length ?? 0
  const jestConfigPathLength = jestFile?.split(path.sep).length ?? 0

  if (vitestCfgPathLength > jestConfigPathLength) {
    return {
      framework: 'vitest' as const,
      configPath,
    }
  }
  else {
    return {
      framework: 'jest' as const,
      configPath,
    }
  }
}

const VITEST_CONFIG_NAMES = ['vitest.config', 'vite.config']

const VITEST_CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']

const VITEST_CONFIG_FILES = VITEST_CONFIG_NAMES.flatMap(name =>
  VITEST_CONFIG_EXTENSIONS.map(ext => name + ext),
)
