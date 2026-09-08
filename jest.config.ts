import type {Config} from "jest";
const config:Config={coverageProvider:"v8",testEnvironment:"jsdom",setupFilesAfterEnv:["<rootDir>/jest.setup.ts"],moduleNameMapper:{"^@/(.*)$":"<rootDir>/src/$1","^lucide-react$":"<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js"},transform:{"^.+\\.tsx?$":["ts-jest",{tsconfig:{jsx:"react-jsx",module:"CommonJS",moduleResolution:"Node",isolatedModules:true}}]}};
export default config;
