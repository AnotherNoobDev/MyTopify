import { debounce } from "./utility";

describe("Utility test suite", function() {
    beforeEach(() => {
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it("debounced function executes after the specified time from the last call", function() {
        let calls = 0;
        const dummyFct = () => {
            calls++;
        }

        const afterMs = 1000;
        const bufferMs = 100;
        const dummyFctDebounced = debounce(dummyFct, afterMs);

        // single call is delayed
        dummyFctDebounced();
        expect(calls).toEqual(0);
        
        jasmine.clock().tick(afterMs / 2);
        expect(calls).toEqual(0);

        jasmine.clock().tick(afterMs / 2 + bufferMs);
        expect(calls).toEqual(1);

        // multiple calls: called after last fct. call with delay
        calls = 0;
        dummyFctDebounced();

        jasmine.clock().tick(afterMs / 2);
        expect(calls).toEqual(0);

        dummyFctDebounced();
        jasmine.clock().tick(afterMs / 2 + bufferMs);
        expect(calls).toEqual(0);

        dummyFctDebounced();
        jasmine.clock().tick(afterMs / 2 + bufferMs);
        expect(calls).toEqual(0);

        jasmine.clock().tick(afterMs / 2);
        expect(calls).toEqual(1);

        dummyFctDebounced();

        jasmine.clock().tick(afterMs + bufferMs);
        expect(calls).toEqual(2);
    });


    it("debounced function should forward parameters correctly", function() {
        let arg1 = 0;
        let arg2 = [0, 0];
        let arg3 = {x: 0, y: 0};

        const dummyFct = (a1: typeof arg1, a2: typeof arg2, a3: typeof arg3) => {
            arg1 = a1;
            arg2 = a2;
            arg3 = a3;
        }

        const afterMs = 1000;
        const bufferMs = 100;
        const dummyFctDebounced = debounce(dummyFct, afterMs);

        const arg1After = 0;
        const arg2After = [10, 20, 50];
        const arg3After = {x: -3.4, y: 1.7};

        dummyFctDebounced(arg1After, arg2After, arg3After);
        jasmine.clock().tick(afterMs + bufferMs);

        expect(arg1).toEqual(arg1After);
        expect(arg2).toEqual(arg2After);
        expect(arg3).toEqual(arg3After);
    });
});