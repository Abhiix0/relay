import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Increase async timeout for animated components
configure({ asyncUtilTimeout: 3000 });
