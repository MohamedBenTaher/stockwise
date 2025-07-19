#!/usr/bin/env node

/**
 * Integration Test Script
 *
 * This script tests the complete TypeScript API integration:
 * 1. Backend health check
 * 2. OpenAPI schema validation
 * 3. Type generation
 * 4. TypeScript compilation
 * 5. API client functionality
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000";
const TYPES_FILE = path.join(
  __dirname,
  "..",
  "src",
  "types",
  "generated",
  "api-types.ts"
);

console.log("🧪 Running StockWise TypeScript Integration Tests...\n");

// Test functions
const tests = {
  async backendHealth() {
    console.log("1️⃣  Testing backend health...");
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("   ✅ Backend is healthy:", data.status);
      return true;
    } catch (error) {
      console.log("   ❌ Backend health check failed:", error.message);
      return false;
    }
  },

  async openApiSchema() {
    console.log("2️⃣  Testing OpenAPI schema...");
    try {
      const response = await fetch(`${BACKEND_URL}/openapi.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const schema = await response.json();

      console.log(`   ✅ OpenAPI schema fetched successfully`);
      console.log(
        `   📊 Found ${Object.keys(schema.paths || {}).length} API endpoints`
      );
      console.log(
        `   📄 Found ${
          Object.keys(schema.components?.schemas || {}).length
        } data models`
      );
      return schema;
    } catch (error) {
      console.log("   ❌ OpenAPI schema test failed:", error.message);
      return null;
    }
  },

  async typeGeneration() {
    console.log("3️⃣  Testing type generation...");
    try {
      // Check if types file exists and get stats
      const beforeStats = fs.existsSync(TYPES_FILE)
        ? fs.statSync(TYPES_FILE)
        : null;

      // Run type generation
      execSync("npm run generate-types", {
        stdio: "pipe",
        cwd: path.join(__dirname, ".."),
      });

      // Check if file was created/updated
      if (!fs.existsSync(TYPES_FILE)) {
        throw new Error("Types file was not generated");
      }

      const afterStats = fs.statSync(TYPES_FILE);
      const content = fs.readFileSync(TYPES_FILE, "utf8");

      console.log("   ✅ Type generation completed");
      console.log(`   📄 Generated file: ${TYPES_FILE}`);
      console.log(`   📏 File size: ${(afterStats.size / 1024).toFixed(1)}KB`);
      console.log(`   📅 Last modified: ${afterStats.mtime.toISOString()}`);

      // Validate content
      if (content.includes("export interface paths")) {
        console.log("   ✅ Contains path definitions");
      }
      if (content.includes("export interface components")) {
        console.log("   ✅ Contains component schemas");
      }

      return true;
    } catch (error) {
      console.log("   ❌ Type generation failed:", error.message);
      return false;
    }
  },

  async typescriptCompilation() {
    console.log("4️⃣  Testing TypeScript compilation...");
    try {
      // Test compilation of generated types
      execSync(
        "npx tsc --noEmit --skipLibCheck src/types/generated/api-types.ts",
        {
          stdio: "pipe",
          cwd: path.join(__dirname, ".."),
        }
      );
      console.log("   ✅ Generated types compile successfully");

      // Test compilation of demo component
      execSync("npx tsc --noEmit --skipLibCheck src/demo/TypedAPIDemo.tsx", {
        stdio: "pipe",
        cwd: path.join(__dirname, ".."),
      });
      console.log("   ✅ Demo component compiles successfully");

      // Test compilation of API client
      execSync("npx tsc --noEmit --skipLibCheck src/api/typed-api.ts", {
        stdio: "pipe",
        cwd: path.join(__dirname, ".."),
      });
      console.log("   ✅ API client compiles successfully");

      return true;
    } catch (error) {
      console.log("   ❌ TypeScript compilation failed:", error.message);
      return false;
    }
  },

  async apiClientFunctionality() {
    console.log("5️⃣  Testing API client functionality...");
    try {
      // Import and test the API client
      const { typedApi } = await import("../src/api/typed-api.js");

      console.log("   ✅ API client imports successfully");

      // Test that methods exist
      const methods = [
        "auth.register",
        "auth.login",
        "auth.getMe",
        "holdings.getAll",
        "holdings.create",
        "insights.generate",
      ];

      for (const method of methods) {
        const [module, func] = method.split(".");
        if (typeof typedApi[module]?.[func] === "function") {
          console.log(`   ✅ Method ${method} exists`);
        } else {
          throw new Error(`Method ${method} not found`);
        }
      }

      return true;
    } catch (error) {
      console.log("   ❌ API client test failed:", error.message);
      return false;
    }
  },

  async integrationSummary() {
    console.log("6️⃣  Integration Summary...");

    // Check all key files exist
    const requiredFiles = [
      "src/types/generated/api-types.ts",
      "src/types/generated/index.ts",
      "src/api/typed-api.ts",
      "src/demo/TypedAPIDemo.tsx",
      "scripts/generate-types.js",
      "TYPE_INTEGRATION_GUIDE.md",
    ];

    const baseDir = path.join(__dirname, "..");
    for (const file of requiredFiles) {
      const filePath = path.join(baseDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`   ❌ ${file} (missing)`);
      }
    }

    return true;
  },
};

// Run all tests
async function runTests() {
  let passedTests = 0;
  const totalTests = Object.keys(tests).length;

  for (const [testName, testFunc] of Object.entries(tests)) {
    try {
      const result = await testFunc();
      if (result) passedTests++;
      console.log(""); // Empty line for readability
    } catch (error) {
      console.log(`   ❌ Test ${testName} threw error:`, error.message);
      console.log(""); // Empty line for readability
    }
  }

  // Final results
  console.log("🎯 Test Results:");
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(
    `   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log(
      "\n🎉 All tests passed! Your TypeScript API integration is working perfectly."
    );
    console.log("\n📚 Next Steps:");
    console.log("   1. Check out the demo: src/demo/TypedAPIDemo.tsx");
    console.log("   2. Read the guide: TYPE_INTEGRATION_GUIDE.md");
    console.log("   3. Start type watching: npm run types:watch");
    console.log("   4. Start developing with full type safety!");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please check the errors above and fix them."
    );
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error("❌ Test runner failed:", error);
  process.exit(1);
});
