var format = require('util').format;

var steps = {
  start: {
    state: 'onboarding.start',
  },
  seeds: {
    state: 'onboarding.seeds',
  },
  community: {
    state: 'community.seeds'
  },
  profile: {
    state: 'profile'
  }
};

var stepOrder = ['start', 'seeds', 'community', 'profile', 'done'];

var factory = function($timeout, $resource, $rootScope, $state, $analytics, Overlay) {

  var OnboardingResource = $resource('/noo/user/:userId/onboarding', {userId: '@userId'});

  var Onboarding = function(user) {
    // this is used in templates
    this.community = user.memberships[0].community;

    // for internal use only
    this._user = user;
    this._status = user.onboarding.status;

    // TESTING
    var params = require('querystring').parse(location.search.replace(/^\?/, ''));
    if (params.obs) {
      _.merge(this._status, {step: params.obs});
      this.allowBack = true;
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.$emit('announcer:hide');

      if (this.currentStep() === 'community' && toState.name === 'profile' && toParams.id === this._user.id) {
        if (this._announcerDelay) {
          $timeout.cancel(this._announcerDelay);
        }
        this._setStep('profile', true);
      }

    }.bind(this));

  };

  _.extend(Onboarding.prototype, {
    isComplete: function() {
      return this._status.step === 'done';
    },
    canSkipSeedForm: function() {
      return !!this._status.can_skip_seed_form;
    },
    markSeedCreated: function(type) {
      this._track('Add Seed', {type: type});
      this._status.seed_created = true;
      this.goNext();
    },
    isSeedCreated: function() {
      return !!this._status.seed_created;
    },
    currentStep: function() {
      if (!_.contains(stepOrder, this._status.step))
        return 'community';

      return this._status.step;
    },
    showOverlay: function(name) {
      var scope = {
        overlay: 'onboarding.' + name,
        onboarding: this
      };
      if (name === 'community') {
        scope.conversationStep = 1;
      }
      Overlay.show(scope);
    },
    continue: function(data) {
      var self = this;

      switch (this.currentStep()) {
        case 'community':

          var cleanup = function(string) {
            if (!string) return;

            return _.chain(string.split(','))
              .map(function(x) { return x.trim(); })
              .reject(function(x) { return x == '' })
              .uniq().value();
          }, input = {
            skills: cleanup(data.skills),
            organizations: cleanup(data.organizations)
          };

          if (_.isEmpty(input.skills)) {
            delete input.skills;
          } else {
            this._track('Add Skills');
          }

          if (_.isEmpty(input.organizations)) {
            delete input.organizations;
          } else {
            this._track('Add Affiliations');
          }

          if (!_.isEmpty(input)) this._user.update(input);

          this._announcerDelay = $timeout(function() {
            $rootScope.$emit('announcer:show', {
              text: "When you're ready, click here to visit your profile.",
              onclick: function() {
                self._goDelta(0);
              },
              className: 'point-to-profile'
            });
          }, 3000);

          this._setStep('profile', true);
          break;

        case 'profile':
          this._setStep('done', true);
          break;
      }
    },
    resume: function() {
      // TODO maybe only do this if within the first few steps?
      // i.e. once we get to community step, we can allow open-ended
      // exploration and only continue onboarding through non-modal prompts
      if (this.currentStep() === 'done' || $state.$current.name === steps[this.currentStep()].state)
        return;

      this._track('Resume', {from: $state.$current.name, to: steps[this.currentStep()].state});
      this._goDelta(0);
    },
    goNext: function() {
      this._goDelta(1);
    },
    goBack: function() {
      this._goDelta(-1);
    },
    jump: function(name) {
      this._go(name, true);
    },
    _goDelta: function(delta) {
      var next = stepOrder[_.indexOf(stepOrder, this.currentStep()) + delta];
      this._go(next, delta != 0);
    },
    _go: function(name, update) {
      this._setStep(name, update);

      var params;
      // FIXME code smell
      if (_.include(['newSeed', 'community'], name)) {
        params = {community: this.community.slug};
      } else if (_.include(['profile'], name)) {
        params = {id: this._user.id};
      } else {
        params = {};
      }
      return $state.go(steps[name].state, params);
    },
    _setStep: function(name, update) {
      this._track('Step: ' + name);
      this._status.step = name;

      if (update) {
        OnboardingResource.save({userId: this._user.id, step: name});
      }
    },
    _track: function(name, params) {
      $analytics.eventTrack('Onboarding: ' + name, _.merge({
        user_id: this._user.id,
        new_user: this._status.new_user
      }, params));
    }
  });

  return Onboarding;
};

module.exports = function(angularModule) {
  angularModule.factory('Onboarding', factory);
};