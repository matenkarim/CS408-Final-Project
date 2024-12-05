// tests.js

// Remove import statements and ensure functions are accessible globally.

QUnit.module('Utility Functions', function() {

    QUnit.test('generateUniqueId should return a unique string', function(assert) {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
  
      assert.ok(typeof id1 === 'string', 'ID is a string');
      assert.notEqual(id1, id2, 'IDs are unique');
      assert.ok(id1.length > 0, 'ID is not empty');
    });
  
  });
  
  QUnit.module('Workouts Page Functions', function(hooks) {
  
    hooks.beforeEach(function() {
      // Set up DOM elements needed for testing
      document.body.innerHTML = `
        <input id="plan-name" />
        <ul id="plans-ul"></ul>
      `;
    });
  
    QUnit.test('addWorkoutPlan should add a new plan', function(assert) {
      const done = assert.async();
      const planNameInput = document.getElementById('plan-name');
      planNameInput.value = 'New Plan';
  
      // Mock fetch
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        assert.ok(url.includes('/plans'), 'Fetch called with correct URL');
        assert.equal(options.method, 'POST', 'Fetch method is POST');
        return Promise.resolve({ ok: true });
      };
  
      addWorkoutPlan();
  
      setTimeout(() => {
        assert.equal(planNameInput.value, '', 'Plan name input is cleared');
        window.fetch = originalFetch; // Restore original fetch
        done();
      }, 100);
    });
  
    QUnit.test('deletePlan should delete a plan', function(assert) {
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
  
  QUnit.module('Log Workout Page Functions', function(hooks) {
  
    hooks.beforeEach(function() {
      document.body.innerHTML = `
        <select id="workout-plan-select"></select>
        <input type="date" id="workout-date" />
        <button id="log-workout-button"></button>
        <div id="exercises-container"></div>
      `;
    });
  
    QUnit.test('logWorkoutSession should log workout data', function(assert) {
      const done = assert.async();
  
      // Mock inputs
      const workoutPlanSelect = document.getElementById('workout-plan-select');
      const workoutDateInput = document.getElementById('workout-date');
      const exercisesContainer = document.getElementById('exercises-container');
  
      workoutPlanSelect.value = 'plan123';
      workoutDateInput.value = '2023-01-01';
  
      // Mock exercise entries
      exercisesContainer.innerHTML = `
        <div class="exercise-entry">
          <h3>Exercise 1</h3>
          <div class="set-entry">
            <label>Weight:</label>
            <input type="number" id="weight-ex1-1" value="100" />
            <label>Reps:</label>
            <input type="number" id="reps-ex1-1" value="10" />
          </div>
        </div>
      `;
  
      // Mock fetch
      let fetchCalled = false;
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        fetchCalled = true;
        assert.ok(url.includes(`/plans/${workoutPlanSelect.value}/exercises/`), 'Fetch called with correct URL');
        assert.equal(options.method, 'POST', 'Fetch method is POST');
        return Promise.resolve({ ok: true });
      };
  
      logWorkoutSession();
  
      setTimeout(() => {
        assert.ok(fetchCalled, 'Fetch was called');
        assert.equal(workoutDateInput.value, '', 'Workout date input is cleared');
        assert.equal(exercisesContainer.innerHTML, '', 'Exercises container is cleared');
        window.fetch = originalFetch; // Restore original fetch
        done();
      }, 100);
    });
  
  });
  