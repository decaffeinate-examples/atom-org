/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const $ = require('jquery');

const Reporter = require('../lib/reporter');
const FeedbackAPI = require('../lib/feedback-api');

describe("Feedback", function() {
  let [feedback, workspaceElement, ajaxSuccess] = Array.from([]);
  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    spyOn(Reporter, 'sendEvent');
    spyOn(FeedbackAPI, 'getClientID').andReturn('someuser');
    spyOn(FeedbackAPI, 'fetchSurveyMetadata').andReturn(new Promise(resolve => resolve({display_seed: 'none', display_percent: 5}))
    );
    spyOn($, 'ajax').andCallFake((url, {success}) => ajaxSuccess = success);

    waitsForPromise(() => Promise.all([
      atom.packages.activatePackage('status-bar'),
      atom.packages.activatePackage('feedback').then(pack => feedback = pack.mainModule)
    ]));

    return waitsForPromise(() => feedback.getStatusBar());
  });

  describe("when the user has completed the survey", function() {
    beforeEach(function() {
      ajaxSuccess({completed: true});

      return waitsFor(() => Reporter.sendEvent.calls.length > 0);
    });

    return it("does not display the feedback status item", function() {
      expect(workspaceElement.querySelector('feedback-status')).not.toExist();
      return expect(Reporter.sendEvent).toHaveBeenCalledWith('already-finished-survey');
    });
  });

  return describe("when the user has not completed the survey", function() {
    beforeEach(function() {
      ajaxSuccess({completed: false});

      return waitsFor(() => Reporter.sendEvent.calls.length > 0);
    });

    it("displays the feedback status item", function() {
      expect(workspaceElement.querySelector('feedback-status')).toExist();
      return expect(Reporter.sendEvent).toHaveBeenCalledWith('did-show-status-bar-link');
    });

    describe("when the user opens the dialog and clicks cancel", () => it("displays the modal, and can click ", function() {
      workspaceElement.querySelector('feedback-status a').dispatchEvent(new Event('click'));
      expect(workspaceElement.querySelector('feedback-modal')).toBeVisible();

      expect(workspaceElement.querySelector('feedback-modal .btn-primary').href).toContain(feedback.feedbackSource);
      expect(workspaceElement.querySelector('feedback-modal .btn-primary').href).toContain('someuser');

      expect(Reporter.sendEvent).toHaveBeenCalledWith('did-show-status-bar-link');
      expect(Reporter.sendEvent).toHaveBeenCalledWith('did-click-status-bar-link');
      expect(Reporter.sendEvent).not.toHaveBeenCalledWith(feedback.feedbackSource, 'did-click-modal-cancel');

      workspaceElement.querySelector('feedback-modal .btn-cancel').dispatchEvent(new Event('click'));

      expect(workspaceElement.querySelector('feedback-modal')).not.toBeVisible();
      return expect(Reporter.sendEvent).toHaveBeenCalledWith('did-click-modal-cancel');
    }));

    return describe("when the user opens the dialog and starts the ", function() {
      beforeEach(function() {
        ajaxSuccess = null;
        FeedbackAPI.PollInterval = 100;
        return expect(workspaceElement.querySelector('feedback-status')).toBeVisible();
      });

      return it("displays the modal, and can click ", function() {
        workspaceElement.querySelector('feedback-status a').dispatchEvent(new Event('click'));

        expect(Reporter.sendEvent).toHaveBeenCalledWith('did-show-status-bar-link');
        expect(Reporter.sendEvent).toHaveBeenCalledWith('did-click-status-bar-link');
        expect(Reporter.sendEvent).not.toHaveBeenCalledWith(feedback.feedbackSource, 'did-click-modal-cancel');

        workspaceElement.querySelector('feedback-modal .btn-primary').setAttribute('href', '#');
        workspaceElement.querySelector('feedback-modal .btn-primary').dispatchEvent(new Event('click'));
        expect(Reporter.sendEvent).toHaveBeenCalledWith('did-click-modal-cta');

        expect(workspaceElement.querySelector('feedback-modal')).not.toBeVisible();
        expect(workspaceElement.querySelector('feedback-status')).toBeVisible();

        // now it will poll the atom.io api to see if the user has
        waits(0);
        runs(function() {
          advanceClock(FeedbackAPI.PollInterval);
          ajaxSuccess({completed: false});
          ajaxSuccess = null;
          return expect(workspaceElement.querySelector('feedback-status')).toBeVisible();
        });

        waits(0);
        runs(function() {
          advanceClock(FeedbackAPI.PollInterval);
          ajaxSuccess({completed: false});
          ajaxSuccess = null;
          return expect(workspaceElement.querySelector('feedback-status')).toBeVisible();
        });

        waits(0);
        runs(function() {
          advanceClock(FeedbackAPI.PollInterval);
          ajaxSuccess({completed: true});
          return ajaxSuccess = null;
        });

        waits(0);
        return runs(function() {
          advanceClock(FeedbackAPI.PollInterval);
          expect(ajaxSuccess).toBe(null);
          expect(workspaceElement.querySelector('feedback-status')).not.toBeVisible();
          return expect(Reporter.sendEvent).toHaveBeenCalledWith('did-finish-survey');
        });
      });
    });
  });
});
