import { describe, test, expect, mock } from "bun:test";
const mockJson = mock((data, init) => ({ data, ...init }));
mock.module("next/server", () => ({
    NextResponse: {
        json: mockJson
    }
}));

import { catchErrors } from "../../../utils/helper";

describe("helper/catchErrors utility", () => {

    test("should call the controller and return its response on success", async () => {
        const mockResponse = { status: 200 };
        const mockController = mock(async () => mockResponse);

        const wrapped = catchErrors(mockController);
        const result = await wrapped({}, {});

        expect(mockController).toHaveBeenCalled();
        expect(result).toBe(mockResponse);
    });

    test("should catch errors and return 500 JSON response by default", async () => {
        const errorMessage = "Fatal Error";
        const mockController = mock(async () => {
            throw new Error(errorMessage);
        });

        const wrapped = catchErrors(mockController);
        const result = await wrapped({}, {});

        expect(mockJson).toHaveBeenCalledWith(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    });

    test("should expose error message if error.expose is true", async () => {
        const mockController = mock(async () => {
            const err = new Error("Validation Failed");
            err.expose = true;
            err.status = 400;
            throw err;
        });

        const wrapped = catchErrors(mockController);
        await wrapped({}, {});

        expect(mockJson).toHaveBeenCalledWith(
            { error: "Validation Failed" },
            { status: 400 }
        );
    });

});
