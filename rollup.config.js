import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
//import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'

const output = (format) => {
  const base = {
    file: `dist/${format}.js`,
    format,
    sourcemap: true,
    name: 'reactImageUploader',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react/jsx-runtime': 'ReactJSXRuntime',
      axios: 'axios',
      multer: 'multer',
      'multer-s3': 'multer-s3',
      '@aws-sdk/client-s3': 'clientS3',
      '@paralleldrive/cuid2': 'cuid2',      
    }
  }

  return [
    base,
    { ...base, file: `dist/${format}.min.js`, plugins: [terser()] },
  ]
}


export default [
  {
    plugins: [typescript(), nodeResolve(), commonjs()],
    external: ['react', 'react-dom', 'react/jsx-runtime', 'axios', 'multer', 'multer-s3', '@aws-sdk/client-s3', '@paralleldrive/cuid2'],

    input: 'src/index.ts',
    output: [...output('cjs'), ...output('umd'), ...output('esm')]
  },
  /*
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  */
]