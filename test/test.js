import { addWorkoutPlan, deletePlan } from '../src/utils.js';

QUnit.module('Workouts Page Functions', function() {
    
    QUnit.test('addWorkoutPlan adds a new plan', function(assert) {
        const done = assert.async();
        const planNameInput = document.createElement('input');
        planNameInput.value = 'Test Plan';
        document.body.appendChild(planNameInput);

        // Mock fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            assert.ok(url.includes('/plans'), 'Fetch called with correct URL');
            assert.equal(options.method, 'POST', 'Fetch method is POST');
            return Promise.resolve({ ok: true });
        };

        addWorkoutPlan();
        
        setTimeout(() => {
            assert.equal(planNameInput.value, '', 'Plan name input is cleared after addition');
            window.fetch = originalFetch; // Restore original fetch
            document.body.removeChild(planNameInput);
            done();
        }, 100);
    });

    QUnit.test('deletePlan removes a plan', function(assert) {
        const done = assert.async();
        const planId = '12345';

        window.confirm = () => true; // Simulate user clicking 'OK'

        // Mock fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            assert.ok(url.includes(`/plans/${planId}`), 'Fetch called with correct URL');
            assert.equal(options.method, 'DELETE', 'Fetch method is DELETE');
            return Promise.resolve({ ok: true });
        };

        deletePlan(planId);
        
        setTimeout(() => {
            window.fetch = originalFetch; // Restore original fetch
            done();
        }, 100);
    });
});
